import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

// Mocks
const mutationMock = vi.fn();

vi.mock("convex/browser", () => ({
  ConvexHttpClient: class MockConvexHttpClient {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(_url: string) {}
    mutation = mutationMock;
    query = vi.fn();
  },
}));

describe("create-order API route", () => {
  const originalFetch = global.fetch;
  const envBackup = { ...process.env } as NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.restoreAllMocks();
    mutationMock.mockReset();

    // Default env for the route
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://clean-ox-220.convex.cloud";
    process.env.NEXT_PUBLIC_BASE_URL = "http://example.com";
    process.env.INTERNAL_BASE_URL = "http://127.0.0.1:3000";

    // Mock internal POST /api/payos/create
    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/api/payos/create") && init?.method === "POST") {
        return new Response(
          JSON.stringify({ paymentLinkId: "plink_1", checkoutUrl: "https://checkout.example" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ) as any;
      }
      return new Response("Not Found", { status: 404 }) as any;
    }) as any;

    // First mutation: createOrReusePending -> returns orderId
    // Second mutation: attachCheckoutInfo -> ok
    mutationMock
      .mockResolvedValueOnce("order_1")
      .mockResolvedValueOnce("ok");
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
    process.env = { ...envBackup };
  });

  function makeReq(body: any) {
    return new Request("http://localhost/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as any;
  }

  it("creates order, calls PayOS create, and returns orderId+checkoutUrl", async () => {
    const res = await POST(
      makeReq({ userId: "u_1", amount: 10000, description: "Test subscription" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.orderId).toBe("order_1");
    expect(typeof json.orderCode).toBe("number");
    expect(json.checkoutUrl).toBe("https://checkout.example");

    // Convex mutations called twice
    expect(mutationMock).toHaveBeenCalledTimes(2);
    expect(mutationMock.mock.calls[0]?.[1]).toMatchObject({ amount: 10000 });
    expect(mutationMock.mock.calls[1]?.[1]).toMatchObject({ paymentLinkId: "plink_1" });
  });

  it("returns 400 on invalid payload and does not call Convex", async () => {
    const res = await POST(
      makeReq({ amount: "not-a-number" }) // missing userId and bad amount
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});

