import type { NextApiRequest, NextApiResponse } from "next";
import { run } from "convex/next";
import { createChatSession } from "../../../convex/functions/createChatSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { userId, model } = req.body as { userId?: string; model?: string };
  if (!userId || !model) {
    return res.status(400).json({ error: "Missing userId or model" });
  }
  const session = await run(createChatSession, { userId, model });
  res.status(200).json(session);
}

