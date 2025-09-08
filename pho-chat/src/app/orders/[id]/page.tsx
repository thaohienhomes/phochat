"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    succeeded: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-gray-200 text-gray-700",
  };
  const cls = colors[status || "pending"] || "bg-gray-100 text-gray-800";
  return <span className={`inline-flex items-center rounded px-2 py-1 text-xs ${cls}`}>{status || "pending"}</span>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string | undefined;
  const userTier = useQuery(api.users.getTier, {} as any) as string | null;

  const order = useQuery(api.orders.orderById, orderId ? ({ orderId: orderId as any } as any) : ("skip" as any)) as any;

  const [busy, setBusy] = React.useState(false);
  const orderCode = order?.orderCode;
  const checkoutUrl = order?.checkoutUrl as string | undefined;
  const status = order?.status as string | undefined;

  async function refreshStatus() {
    if (!orderCode) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/payos/status?orderCode=${orderCode}`);
      await res.json();
    } catch {
      // noop
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Order Details</h1>
          {userTier && (userTier === "pro" || userTier === "team") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center text-xs rounded-full border px-2 py-0.5 text-green-700 bg-green-50 dark:text-green-200 dark:bg-green-900/20 cursor-default">
                  {userTier === "team" ? "Team" : "Pro"}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">You're on {userTier}. Enjoy premium AI models and higher limits.</div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <Button variant="outline" onClick={() => router.push("/orders")}>Back</Button>
        </div>
      </div>

      {!order && <p className="text-sm text-muted-foreground">Loading order...</p>}

      {order && (
        <div className="space-y-4 rounded border p-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Order ID</div>
            <div className="font-mono">{orderId}</div>
            <div className="text-muted-foreground">Order Code</div>
            <div className="font-mono">{orderCode}</div>
            <div className="text-muted-foreground">Amount</div>
            <div>{order.amount?.toLocaleString?.() ?? order.amount} VND</div>
            <div className="text-muted-foreground">Created</div>
            <div>{new Date(order.created_at).toLocaleString()}</div>
            <div className="text-muted-foreground">User</div>
            <div className="font-mono">{order.user_id}</div>
          </div>

          {status === "pending" ? (
            <div className="rounded bg-amber-50 p-3 text-sm">
              <p className="mb-2">This order is pending. Complete the payment using the button below, then this page will update automatically once PayOS notifies us.</p>
              <div className="flex items-center gap-2">
                {checkoutUrl && (
                  <Button className="bg-emerald-600 text-white" asChild>
                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">Open PayOS Checkout</a>
                  </Button>
                )}
                <Button variant="outline" onClick={refreshStatus} disabled={busy}>{busy ? "Refreshing..." : "Refresh status"}</Button>
              </div>
            </div>
          ) : status === "succeeded" ? (
            <div className="rounded bg-emerald-50 p-3 text-sm">Payment completed successfully.</div>
          ) : status === "failed" ? (
            <div className="rounded bg-red-50 p-3 text-sm">Payment failed. Please try again.</div>
          ) : status === "expired" ? (
            <div className="rounded bg-gray-50 p-3 text-sm">Order expired. Create a new payment.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

