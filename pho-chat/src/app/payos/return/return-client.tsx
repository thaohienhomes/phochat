"use client";
import * as React from "react";
import { useToast } from "@/components/ui/toast";

export default function ReturnClient() {
  const { success } = useToast();
  const [status, setStatus] = React.useState<string>("pending");
  const [redirectHref, setRedirectHref] = React.useState<string>("/");
  const [redirectCountdown, setRedirectCountdown] = React.useState<number | null>(null);
  const [hasOrderCode, setHasOrderCode] = React.useState<boolean>(false);


  React.useEffect(() => {
    const url = new URL(window.location.href);
    const orderCode = url.searchParams.get("orderCode");
    const redirect = url.searchParams.get("redirect");
    if (redirect) setRedirectHref(redirect);

    if (!orderCode) {
      setHasOrderCode(false);
      setStatus("no_order");
      return;
    }

    setHasOrderCode(true);

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


  // Show an upgrade toast once when payment succeeds
  const announcedRef = React.useRef(false);
  React.useEffect(() => {
    if (status === "succeeded" && !announcedRef.current) {
      announcedRef.current = true;
      try {
        success("Pro unlocked! Enjoy premium models.");
        try { localStorage.setItem("proWelcomeBanner", "1"); } catch {}
      } catch {}
    }
  }, [status, success]);

  return (
    <div className="mx-auto max-w-lg p-6" aria-live="polite">
      <h1 className="text-xl font-semibold mb-2">Payment status</h1>

      {status === "no_order" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">


            This page shows live status when opened via the PayOS return link that includes your orderCode.
            If you arrived here manually, please return to checkout and use the PayOS flow so that we can track your order.
          </p>
          <a href={redirectHref} className="inline-flex items-center text-sm text-blue-600 underline">Back to app</a>
        </div>
      ) : status === "succeeded" ? (
        <div className="space-y-3">
          <p className="text-sm text-green-700">
            Payment completed. Thank you!{" "}
            {typeof redirectCountdown === "number" && (
              <span className="text-green-800">(Redirecting in {redirectCountdown}s)</span>
            )}
          </p>
          <div className="flex items-center gap-3">
            <a href={redirectHref} className="inline-flex items-center text-sm text-blue-600 underline">Back to app</a>
            <a href="/chat?model=gpt-4o" className="inline-flex items-center text-sm text-purple-700 underline">Try premium model now →</a>
          </div>

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

