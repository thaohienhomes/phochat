import { PayOS } from "@payos/node";

export function getPayOS() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("Missing PAYOS credentials in environment");
  }
  // @payos/node constructor expects an options object
  return new PayOS({ clientId, apiKey, checksumKey } as any);
}

export type CreatePaymentInput = {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
};

