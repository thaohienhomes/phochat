"use client";
import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrdersPage() {
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const orders = useQuery(api.orders.listRecent, { status, limit: 50 }) || [];
  const [busy, setBusy] = React.useState(false);
  const [lastManualReconcileAt, setLastManualReconcileAt] = React.useState<number | null>(null);

  async function reconcile() {
    try {
      setBusy(true);
      const res = await fetch("/api/payos/admin/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ olderThanMs: 15 * 60 * 1000 }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastManualReconcileAt(Date.now());
        alert(`Reconciled: ${data?.count}`);
      } else {
        alert(data?.error || "Reconcile failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
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
          <Button onClick={reconcile} disabled={busy} className="bg-amber-600 text-white">
            {busy ? "Reconciling..." : "Reconcile pending (>15m)"}
          </Button>
        </div>
      </div>

      {lastManualReconcileAt && (
        <p className="text-xs text-muted-foreground">Last manual reconcile: {new Date(lastManualReconcileAt).toLocaleString()}</p>
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

