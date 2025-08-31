import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }
  if (req.method === "GET") {
    res.status(200).json({ ok: true, now: new Date().toISOString() });
    return;
  }
  res.setHeader("Allow", ["GET", "HEAD"]);
  res.status(405).end("Method Not Allowed");
}

