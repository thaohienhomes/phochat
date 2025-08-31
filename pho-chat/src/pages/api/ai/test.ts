import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }
  if (req.method === "GET") {
    res.status(200).json({ ok: true, message: "AI test endpoint (fallback)" });
    return;
  }
  res.setHeader("Allow", ["GET", "HEAD"]);
  res.status(405).end("Method Not Allowed");
}

