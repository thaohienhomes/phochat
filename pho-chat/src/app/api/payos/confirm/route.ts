import { NextRequest } from 'next/server';
import { getPayOS } from '@/lib/payos';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/payos/confirm
// Accepts JSON or x-www-form-urlencoded. Also falls back to query param ?webhookUrl=...
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const raw = await req.text(); // read once

    let body: any = {};
    if (raw) {
      if (contentType.includes('application/json')) {
        try {
          body = JSON.parse(raw);
        } catch {}
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(raw);
        body = Object.fromEntries(params.entries());
      } else {
        // Try JSON anyway (helps with tooling quirks)
        try {
          body = JSON.parse(raw);
        } catch {}
      }
    }

    const queryWebhookUrl =
      req.nextUrl.searchParams.get('webhookUrl') || undefined;
    const webhookUrl =
      (body?.webhookUrl as string | undefined) ?? queryWebhookUrl;

    if (!webhookUrl) {
      logger.error('Confirm missing webhookUrl', {
        contentType,
        raw: raw?.slice(0, 200),
      });
      return new Response(JSON.stringify({ error: 'Missing webhookUrl' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payos = getPayOS();
    const res = await payos.webhooks.confirm(webhookUrl);
    logger.info('Webhook URL confirmed with PayOS', { webhookUrl });
    return new Response(JSON.stringify({ ok: true, res }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    logger.error('Failed to confirm PayOS webhook URL', {
      error: e?.message || String(e),
    });
    return new Response(
      JSON.stringify({ error: e?.message || 'Failed to confirm webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Convenience: allow GET with ?webhookUrl=... so you can confirm via browser or simple curl
export async function GET(req: NextRequest) {
  try {
    const webhookUrl = req.nextUrl.searchParams.get('webhookUrl');
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'Missing webhookUrl' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const payos = getPayOS();
    const res = await payos.webhooks.confirm(webhookUrl);
    logger.info('Webhook URL confirmed with PayOS (GET)', { webhookUrl });
    return new Response(JSON.stringify({ ok: true, res }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    logger.error('Failed to confirm PayOS webhook URL (GET)', {
      error: e?.message || String(e),
    });
    return new Response(
      JSON.stringify({ error: e?.message || 'Failed to confirm webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Some browsers or proxies may issue a HEAD request when you paste the URL in the bar.
export async function HEAD() {
  return new Response(undefined, { status: 200 });
}

