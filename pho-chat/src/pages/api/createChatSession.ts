import type { NextApiRequest, NextApiResponse } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Resolve Convex URL without mutating process.env (safe for serverless)
  const resolvedUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://clean-ox-220.convex.cloud";

  const { userId, model } = req.body as { userId?: string; model?: string };
  if (!userId || !model) {
    return res.status(400).json({ error: "Missing userId or model" });
  }

  try {
    const client = new ConvexHttpClient(resolvedUrl);
    const session = await client.mutation(api.functions.createChatSession, { userId, model });
    return res.status(200).json(session);
  } catch (err: any) {
    return res.status(500).json({
      error: "Convex call failed",
      message: err?.message || String(err),
      url: resolvedUrl,
    });
  }
}

