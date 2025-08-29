import type { NextApiRequest, NextApiResponse } from "next";
import { run } from "convex/next";
import { sendMessage } from "../../../convex/functions/sendMessage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sessionId, content } = req.body as { sessionId: string; content: string };
    const message = {
      id: Date.now().toString(),
      role: "user" as const,
      content,
      createdAt: Date.now(),
    };
    const result = await run(sendMessage, { sessionId: sessionId as any, message });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

