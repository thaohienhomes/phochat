import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = process.env.NODE_ENV === "development" && process.env.ENABLE_SENTRY_DEV_TOOLS === "1";
  if (!enabled) {
    return new Response("Not Found", { status: 404 });
  }
  const clientFromApi = (Sentry as any).getClient?.();
  const clientFromHub = (Sentry as any).getCurrentHub?.().getClient?.();
  const client = clientFromApi || clientFromHub;
  const initialized = Boolean(client);
  const env = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV;
  const hasDsn = Boolean((client as any)?.getOptions?.().dsn ?? process.env.SENTRY_DSN);
  return Response.json(
    { initialized, viaGetClient: Boolean(clientFromApi), viaHub: Boolean(clientFromHub), hasDsn, env },
    { status: 200 },
  );
}

