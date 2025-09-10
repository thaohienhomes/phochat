"use client";
import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function CheckoutPage() {
  const { user } = useUser();
  const [amount, setAmount] = React.useState<number>(10000);
  const [description, setDescription] = React.useState<string>("PhoChat subscription");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function startPayment() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? "web-user",
          amount,
          description,
          // let server embed the orderId in returnUrl automatically
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create order");
      // Redirect to our order detail page for a consistent pending UX
      if (data?.orderId) window.location.href = `/orders/${data.orderId}`;
      else if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error("No orderId or checkoutUrl returned");
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Amount (VND)</span>
          <Input type="number" value={amount} min={1000} step={1000} onChange={(e) => setAmount(Number(e.target.value))} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Description</span>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <Button className="bg-emerald-600 text-white" onClick={startPayment} disabled={loading}>
          {loading ? "Redirecting..." : "Pay with PayOS (QR / Napas 24/7)"}
        </Button>
        {loading && (
          <Alert>
            <AlertTitle>Pending payment…</AlertTitle>
            <AlertDescription>
              Please complete your QR/Napas 24/7 payment in the PayOS window. Do not close this tab.
              <br />
              You can also
              <Link className="ml-1 underline text-blue-600" href="/payos/return" target="_blank" rel="noopener noreferrer">view payment status</Link>
              in a new tab.
            </AlertDescription>
          </Alert>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

