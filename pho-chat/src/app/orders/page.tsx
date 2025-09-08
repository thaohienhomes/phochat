"use client";
import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

export default function OrdersPage() {
  const { user, isSignedIn } = useUser();
  const isDev = process.env.NODE_ENV !== "production";
  const isAdmin = isDev || (isSignedIn && (user?.publicMetadata as any)?.role === "admin");

  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const orders = useQuery(api.orders.listRecent, { status, limit: 50 }) || [];
  const userTier = useQuery(api.users.getTier, {} as any) as string | null;
  const [busy, setBusy] = React.useState(false);
  const [lastManualReconcileAt, setLastManualReconcileAt] = React.useState<number | null>(null);
  const [cronStatus, setCronStatus] = React.useState<{ configured: boolean; schedule: string; method: string; path: string } | null>(null);
  const [cronBusy, setCronBusy] = React.useState(false);
  const { success, error: toastError } = useToast();

  async function reconcile() {
    try {
      setBusy(true);
      const endpoint = isDev
        ? "/api/payos/admin/reconcile"
        : "/api/payos/admin/reconcile-safe";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ olderThanMs: 15 * 60 * 1000 }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastManualReconcileAt(Date.now());
        success(`Reconciled: ${data?.count ?? data?.ok ?? "ok"}`);
      } else {
        toastError(data?.error || "Reconcile failed");
      }
    } finally {
      setBusy(false);
    }
  }

  async function refreshCronStatus() {
    try {
      setCronBusy(true);
      const res = await fetch("/api/payos/admin/cron-status-safe");
      if (!res.ok) throw new Error("Failed to load cron status");
      const data = await res.json();
      setCronStatus(data);
      success("Cron status refreshed");
    } catch (e: any) {
      toastError(e?.message || "Unable to load cron status");
    } finally {
      setCronBusy(false);
    }
  }

  // One-time 'Pro unlocked' banner after upgrade
  const [showProWelcome, setShowProWelcome] = React.useState(false);
  React.useEffect(() => {
    try {
      const flag = localStorage.getItem("proWelcomeBanner");
      if (flag === "1" && (userTier === "pro" || userTier === "team")) {
        setShowProWelcome(true);
        localStorage.removeItem("proWelcomeBanner");
      }
    } catch {}
  }, [userTier]);

  React.useEffect(() => {
    if (!isAdmin) return;
    let abort = false;
    (async () => {
      try {
        setCronBusy(true);
        const res = await fetch("/api/payos/admin/cron-status-safe");
        if (!res.ok) throw new Error("Failed to load cron status");
        const data = await res.json();
        if (!abort) setCronStatus(data);
      } catch (e: any) {
        toastError(e?.message || "Unable to load cron status");
      } finally {
        setCronBusy(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-3">
        <h1 className="text-xl font-semibold">Orders</h1>
        {!isSignedIn ? (
          <div className="text-sm">
            <p className="text-muted-foreground mb-3">Please sign in to view orders.</p>
            <Button asChild className="bg-blue-600 text-white"><Link href="/sign-in">Sign in</Link></Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You are signed in but not authorized. Ask an admin to grant access.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Orders</h1>
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
          {process.env.NODE_ENV === "production" && isAdmin && (
            <Badge variant="warning">Admin only</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>

              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={reconcile} disabled={busy} className="bg-amber-600 text-white">
              {busy ? "Reconciling..." : "Reconcile pending (>15m)"}
            </Button>
          )}
        </div>
      </div>

      {showProWelcome && (
        <div className="rounded border border-green-600/30 bg-green-50 dark:bg-green-900/10 p-3 text-sm flex items-center justify-between">
          <div className="text-green-800 dark:text-green-200">You are now Pro. Enjoy premium models and higher limits.</div>
          <Button size="sm" variant="secondary" onClick={() => setShowProWelcome(false)}>Dismiss</Button>
        </div>
      )}

      {lastManualReconcileAt && (
        <p className="text-xs text-muted-foreground">Last manual reconcile: {new Date(lastManualReconcileAt).toLocaleString()}</p>
      )}

      {/* Cron status panel (admin) */}
      {isAdmin && (
        <div className="rounded border p-3 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">Cron status</div>
            {cronStatus ? (
              <div className="text-muted-foreground mt-1">
                <div>Configured: <span className={cronStatus.configured ? "text-green-600" : "text-red-600"}>{String(cronStatus.configured)}</span></div>
                <div>Schedule: {cronStatus.schedule} ({cronStatus.method})</div>
                <div className="truncate max-w-[70ch]">Path: {cronStatus.path.replace("ADMIN_RECONCILE_TOKEN", "\u2022\u2022\u2022\u2022")}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">{cronBusy ? "Loading..." : "No data"}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={refreshCronStatus} disabled={cronBusy} variant="secondary">{cronBusy ? "Refreshing..." : "Refresh"}</Button>
          </div>
        </div>
      )}

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">orderCode</th>
              <th className="p-2 text-left">amount</th>
              <th className="p-2 text-left">status</th>
              <th className="p-2 text-left">created_at</th>
              <th className="p-2 text-left">user_id</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o._id} className="border-t">
                <td className="p-2">{o.orderCode}</td>
                <td className="p-2">{o.amount?.toLocaleString?.() ?? o.amount}</td>
                <td className="p-2">{o.status}</td>
                <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-2">{o.user_id}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td className="p-4 text-center text-muted-foreground" colSpan={5}>No orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

