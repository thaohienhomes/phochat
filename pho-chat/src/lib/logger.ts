type Ctx = Record<string, unknown>;

function sanitize(obj: any) {
  try {
    return JSON.parse(
      JSON.stringify(obj, (key, value) => {
        const k = key.toLowerCase();
        if (k.includes("apikey") || k.includes("checksum") || k.includes("secret") || k.includes("token")) {
          return typeof value === "string" ? value.slice(0, 3) + "***" + value.slice(-3) : "***";
        }
        return value;
      })
    );
  } catch {
    return { note: "<unserializable>" };
  }
}

let Sentry: any = null;
try {
  // Import dynamically to avoid issues in environments without Sentry
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require("@sentry/nextjs");
} catch {}

export const logger = {
  info(msg: string, ctx?: Ctx) {
    const payload = ctx ? sanitize(ctx) : undefined;
    const printable = payload ? JSON.stringify(payload) : "";
    console.log("[PayOS]", msg, printable);
    try {
      if (Sentry && Sentry.captureMessage) {
        Sentry.captureMessage(msg, { level: "info", extra: payload });
      }
    } catch {}
  },
  error(msg: string, ctx?: Ctx) {
    const payload = ctx ? sanitize(ctx) : undefined;
    console.error("[PayOS]", msg, payload || "");
    try {
      if (Sentry && Sentry.captureException) {
        const err = new Error(msg);
        Sentry.captureException(err, { extra: payload });
      }
    } catch {}
  },
};

