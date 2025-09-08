import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/payos/admin/cron-status-safe
// Server-authenticated endpoint to expose cron configuration status to admins only.
export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const cc = await clerkClient();
  const user = await cc.users.getUser(userId);
  const role = (user?.publicMetadata as any)?.role;
  if (role !== "admin") return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  const configured = Boolean(process.env.ADMIN_RECONCILE_TOKEN || process.env.CRON_SECRET);
  return new Response(
    JSON.stringify({
      configured,
      schedule: "*/30 * * * *",
      method: "GET",
      path: "/api/payos/admin/reconcile-cron",
      auth: process.env.CRON_SECRET ? "Authorization: Bearer CRON_SECRET" : "x-admin-token: ADMIN_RECONCILE_TOKEN"
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

