"use client";
import * as React from "react";

export default function ReturnClient() {
  const [status, setStatus] = React.useState<string>("pending");
  const [redirectHref, setRedirectHref] = React.useState<string>("/");
  const [redirectCountdown, setRedirectCountdown] = React.useState<number | null>(null);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const orderCode = url.searchParams.get("orderCode");
    const redirect = url.searchParams.get("redirect");
    if (redirect) setRedirectHref(redirect);
    if (!orderCode) return;

    async function poll() {
      try {
        const res = await fetch(`/api/payos/status?orderCode=${orderCode}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.status) setStatus(data.status);
      } catch (_) {}
    }

    // initial + interval poll
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, []);

  // Auto-redirect on success after 3 seconds
  React.useEffect(() => {
    if (status !== "succeeded") {
      setRedirectCountdown(null);
      return;
    }
    setRedirectCountdown(3);
    const i = setInterval(() => {
      setRedirectCountdown((n) => (n && n > 0 ? n - 1 : 0));
    }, 1000);
    const t = setTimeout(() => {
      window.location.href = redirectHref;
    }, 3000);
    return () => {
      clearInterval(i);
      clearTimeout(t);
    };
  }, [status, redirectHref]);

  return (
    <div className="mx-auto max-w-lg p-6" aria-live="polite">
      <h1 className="text-xl font-semibold mb-2">Payment status</h1>

      {status === "succeeded" ? (
        <div className="space-y-3">
          <p className="text-sm text-green-700">
            Payment completed. Thank you!{" "}
            {typeof redirectCountdown === "number" && (
              <span className="text-green-800">(Redirecting in {redirectCountdown}s)</span>
            )}
          </p>
          <a href={redirectHref} className="inline-flex items-center text-sm text-blue-600 underline">Back to app</a>
        </div>
      ) : status === "failed" ? (
        <div className="space-y-3">
          <p className="text-sm text-red-700">Payment failed. Please try again.</p>
          <a href={redirectHref} className="inline-flex items-center text-sm text-blue-600 underline">Back to app</a>
        </div>
      ) : status === "not_found" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            <span>Waiting for webhook confirmation… If you just paid, please keep this tab open.</span>
          </div>
          <a href={redirectHref} className="inline-flex items-center text-sm text-blue-600 underline">Back to app</a>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            <span>We are processing your payment. If you have completed the transfer, this page may update shortly.</span>
          </div>
          <a href={redirectHref} className="inline-flex items-center text-sm text-blue-600 underline">Back to app</a>
        </div>
      )}
    </div>
  );
}

