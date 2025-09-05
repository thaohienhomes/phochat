import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = process.env.NODE_ENV === "development" && process.env.ENABLE_SENTRY_DEV_TOOLS === "1";
  if (!enabled) {
    return new Response("Not Found", { status: 404 });
  }
  Sentry.captureException(new Error("Sentry capture+flush test (server)"));
  try {
    await Sentry.flush(5000);
  } catch {}
  return Response.json({ ok: true }, { status: 200 });
}

