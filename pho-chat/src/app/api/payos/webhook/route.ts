import { NextRequest } from 'next/server';
import { getPayOS } from '@/lib/payos';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { logger } from '@/lib/logger';
import { stableHash, deriveOrderStatus } from '@/lib/payosWebhook';
import { clerkClient } from '@clerk/nextjs/server';
import { sendEmail, chooseLanguage } from '@/lib/email';
import * as Sentry from '@sentry/nextjs';
import PaymentSuccessEmail from '@/emails/PaymentSuccessEmail';
import PaymentFailedEmail from '@/emails/tx/PaymentFailedEmail';


export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Simple in-memory rate limit (best-effort; serverless instances may not share memory)
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQS_PER_WINDOW = 120; // per IP
const ipHits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string | null) {
  const key = (ip || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const cur = ipHits.get(key);
  if (!cur || now > cur.resetAt) {
    ipHits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  cur.count++;
  return cur.count > MAX_REQS_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    if (rateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
      });
    }
    // Some dashboards may send a POST without a body just to check liveness.
    // Read raw text safely first; if empty or non-JSON, return 200 OK as health check.
    const contentType = req.headers.get('content-type') || '';
    let raw = '';
    try {
      raw = await req.text();
    } catch (parseErr: any) {
      Sentry.addBreadcrumb?.({ category: 'payos.webhook', level: 'warning', message: 'Webhook body read failed; treating as health check', data: { ip, error: parseErr?.message || String(parseErr) } });
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200 });
    }

    if (!raw || raw.trim().length === 0) {
      // Treat as health-check POST without body
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200 });
    }

    if (!contentType.includes('application/json')) {
      // Non-JSON ping from dashboard; acknowledge as healthcheck
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200 });
    }

    let body: any = undefined;
    try {
      body = JSON.parse(raw);
    } catch (parseErr: any) {
      Sentry.addBreadcrumb?.({ category: 'payos.webhook', level: 'warning', message: 'Webhook JSON parse failed; treating as health check', data: { ip, error: parseErr?.message || String(parseErr), rawPreview: raw.slice(0, 200) } });
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200 });
    }

    // Some providers send a non-signed JSON ping when saving the webhook URL.
    // Only process real events when signature is present; otherwise, ack 200.
    if (!body?.signature) {
      Sentry.addBreadcrumb?.({ category: 'payos.webhook', level: 'info', message: 'No signature in body; treating as provider health check', data: { ip } });
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200 });
    }

    Sentry.addBreadcrumb?.({ category: 'payos.webhook', level: 'info', message: 'Webhook received', data: { ip, bodyPreview: JSON.stringify(body).slice(0, 200) } });
    let payos: ReturnType<typeof getPayOS> | undefined;
    try {
      payos = getPayOS();
    } catch (e: any) {
      // If credentials are missing/misconfigured, do not block provider from saving the URL.
      // Acknowledge as healthcheck and log the error; real events will be retried once fixed.
      Sentry.captureMessage?.('PayOS credentials missing while saving webhook URL', { level: 'error', extra: { ip, error: e?.message || String(e) } });
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200 });
    }
    const verified = await payos!.webhooks.verify(body as any);

    if (!verified?.orderCode) {
      return new Response(JSON.stringify({ error: 'Invalid webhook data' }), {
        status: 400,
      });
    }

    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL || ''
    );

    // Idempotency: record event first; if already processed, exit early
    const eventHash = stableHash({
      orderCode: verified.orderCode,
      code: verified.code,
      id: (verified as any)?.id,
    });
    const isNew = await convex.mutation(api.orders.recordEventIfNew, {
      eventHash,
      orderCode: verified.orderCode,
      payload: verified,
    });
    Sentry.addBreadcrumb?.({ category: 'payos.webhook', level: 'info', message: 'Idempotency check', data: { orderCode: verified.orderCode, eventHash, isNew } });
    if (!isNew) {
      logger.info('Webhook duplicate event', {
        orderCode: verified.orderCode,
        eventHash,
      });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
      });
    }

    // Fetch existing order to compare status and retrieve context
    const existingOrder = await convex.query(api.orders.orderByOrderCode, {
      orderCode: verified.orderCode,
    });
    const prevStatus = (existingOrder as any)?.status as string | undefined;
    const clerkUserId = (existingOrder as any)?.user_id as string | undefined;

    // Update order status based on webhook
    const status = deriveOrderStatus(verified as any);
    await convex.mutation(api.orders.setStatusByOrderCode, {
      orderCode: verified.orderCode,
      status,
    });
    logger.info('Order status updated from webhook', {
      orderCode: verified.orderCode,
      status,
      prevStatus,
    });

    // Send transactional email on state change (success/failure)
    try {
      if (prevStatus !== status && (status === 'succeeded' || status === 'failed')) {
        let to: string | undefined;
        let userLocale: string | undefined;
        let convexUserId: any | undefined;
        if (clerkUserId) {
          try {
            const u = await clerkClient.users.getUser(clerkUserId);
            // @ts-expect-error Clerk types may vary
            userLocale = (u as any)?.locale;
            // @ts-expect-error Clerk types may vary
            to = (u as any)?.primaryEmailAddress?.emailAddress || (u as any)?.emailAddresses?.[0]?.emailAddress;
            // Map to Convex user for email_events
            const convexUser = await convex.query(api.users.getUserByClerkOrToken, { id: clerkUserId });
            convexUserId = (convexUser as any)?._id;
          } catch (e: any) {
            logger.error?.('Failed to fetch user for email', { clerkUserId, error: e?.message || String(e) });
          }
        }
        if (to) {
          const lang = chooseLanguage({ userLocale, email: to });
          const subject = lang === 'vi'
            ? (status === 'succeeded' ? 'Pho.Chat - Thanh toán thành công' : 'Pho.Chat - Thanh toán thất bại')
            : (status === 'succeeded' ? 'Pho.Chat - Payment successful' : 'Pho.Chat - Payment failed');
          const amount = (existingOrder as any)?.amount as number | undefined;
          const eventType = status === 'succeeded' ? 'payment_success' : 'payment_failed';
          let sendRes: any | undefined;
          Sentry.addBreadcrumb?.({ category: 'email', level: 'info', message: 'Sending payment email', data: { orderCode: verified.orderCode, status, to, lang } });
          if (status === 'succeeded') {
            sendRes = await sendEmail({
              to,
              subject,
              template: PaymentSuccessEmail,
              props: { lang, orderCode: verified.orderCode, amount } as any,
            });
          } else {
            sendRes = await sendEmail({
              to,
              subject,
              template: PaymentFailedEmail,
              props: { lang, orderCode: verified.orderCode } as any,
            });
          }
          Sentry.addBreadcrumb?.({ category: 'email', level: 'info', message: 'Payment email sent', data: { orderCode: verified.orderCode, status, to, resendId: (sendRes as any)?.id } });
          // Record email event (best-effort)
          try {
            if (convexUserId) {
              await convex.mutation(api.emails.recordEvent, {
                userId: convexUserId,
                eventType,
                orderCode: String(verified.orderCode),
                emailAddress: to,
                status: 'sent',
                resendId: (sendRes as any)?.id,
                context: { subject, lang, status, to },
                sentAt: Date.now(),
              } as any);
            }
          } catch (err: any) {
            logger.error?.('Failed to record email event', { orderCode: verified.orderCode, error: err?.message || String(err) });
          }
          logger.info('Payment email sent', { orderCode: verified.orderCode, status, to });
        }
      }
    } catch (e: any) {
      logger.error?.('Failed to send payment email', { orderCode: verified.orderCode, error: e?.message || String(e) });
      Sentry.captureException?.(e, { extra: { orderCode: verified.orderCode } });
      // Attempt to record failure event if possible
      try {
        const existingOrder2 = await convex.query(api.orders.orderByOrderCode, { orderCode: verified.orderCode });
        const clerkUserId2 = (existingOrder2 as any)?.user_id as string | undefined;
        let to2: string | undefined;
        if (clerkUserId2) {
          try {
            const u2 = await clerkClient.users.getUser(clerkUserId2);
            // @ts-expect-error
            to2 = (u2 as any)?.primaryEmailAddress?.emailAddress || (u2 as any)?.emailAddresses?.[0]?.emailAddress;
          } catch {}
          const convexUser = await convex.query(api.users.getUserByClerkOrToken, { id: clerkUserId2 });
          const convexUserId2 = (convexUser as any)?._id;
          if (convexUserId2) {
            await convex.mutation(api.emails.recordEvent, {
              userId: convexUserId2,
              eventType: status === 'succeeded' ? 'payment_success' : 'payment_failed',
              orderCode: String(verified.orderCode),
              emailAddress: to2 || 'unknown',
              status: 'failed',
              errorMessage: e?.message || String(e),
              context: { status, to: to2 || 'unknown', error: e?.message || String(e) },
              sentAt: Date.now(),
            } as any);
          }
        }
      } catch {}
    }

    // On successful payment, upgrade the corresponding user to Pro
    if (status === 'succeeded') {
      try {
        const order = await convex.query(api.orders.orderByOrderCode, {
          orderCode: verified.orderCode,
        });
        const clerkUserId = (order as any)?.user_id as string | undefined;
        if (clerkUserId) {
          const user = await convex.query(api.users.getUserByClerkOrToken, {
            id: clerkUserId,
          });
          const convexUserId = (user as any)?._id;
          if (convexUserId) {
            await convex.mutation(api.users.setTierById, {
              userId: convexUserId,
              tier: 'pro',
            } as any);
            logger.info('User upgraded to Pro via PayOS', {
              clerkUserId,
              orderCode: verified.orderCode,
            });
          } else {
            logger.info('User not found for upgrade', { clerkUserId });
          }
        } else {
          logger.info('Order has no user_id; cannot upgrade tier', {
            orderCode: verified.orderCode,
          });
        }
      } catch (err: any) {
        logger.error?.('Failed to upgrade user to Pro', {
          orderCode: verified.orderCode,
          error: err?.message || String(err),
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e: any) {
    logger.error('Webhook error', { error: e?.message || String(e) });
    return new Response(
      JSON.stringify({ error: e?.message || 'Webhook error' }),
      { status: 500 }
    );
  }
}

// Helpful for manual checks: opening this URL in a browser returns 200
export async function GET() {
  return new Response('OK (webhook endpoint expects POST from PayOS)', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// Support provider liveness checks that issue HEAD requests
export async function HEAD() {
  return new Response(null, { status: 200 });
}

