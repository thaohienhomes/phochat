export function stableHash(obj: any): string {
  try {
    const s = JSON.stringify(obj, Object.keys(obj).sort());
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return String(h);
  } catch {
    return String(Date.now());
  }
}

export type PayOSVerifiedPayload = {
  orderCode?: number;
  code?: string; // "00" for success in some payloads
  status?: string; // e.g. "PAID"
  [k: string]: any;
};

export function deriveOrderStatus(payload: PayOSVerifiedPayload): "succeeded" | "failed" {
  if (!payload) return "failed";
  if (payload.code === "00") return "succeeded";
  if (payload.status?.toUpperCase?.() === "PAID") return "succeeded";
  return "failed";
}

