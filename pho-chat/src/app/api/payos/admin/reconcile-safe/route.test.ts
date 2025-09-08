import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

const actionMock = vi.fn();

vi.mock("convex/browser", () => ({
  ConvexHttpClient: class MockConvexHttpClient {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(_url: string) {}
    action = actionMock;
  },
}));

let authState: { userId: string | null } = { userId: null };
let userRole: string | undefined;

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => ({ ...authState }),
  clerkClient: {
    users: {
      getUser: async (_id: string) => ({ publicMetadata: { role: userRole } }),
    },
  },
}));

function makeReq(body: any) {
  return new Request("http://localhost/api/payos/admin/reconcile-safe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as any;
}

describe("reconcile-safe route", () => {
  beforeEach(() => {
    actionMock.mockReset();
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://clean-ox-220.convex.cloud";
  });

  it("returns 401 when not authenticated", async () => {
    authState = { userId: null };
    const res = await POST(makeReq({ olderThanMs: 1000 }));
    expect(res.status).toBe(401);
    expect(actionMock).not.toHaveBeenCalled();
  });

  it("returns 403 when not admin", async () => {
    authState = { userId: "u_1" };
    userRole = "user";
    const res = await POST(makeReq({ olderThanMs: 1000 }));
    expect(res.status).toBe(403);
    expect(actionMock).not.toHaveBeenCalled();
  });

  it("calls Convex action and returns 200 for admin", async () => {
    authState = { userId: "u_admin" };
    userRole = "admin";
    actionMock.mockResolvedValueOnce({ count: 3 });

    const res = await POST(makeReq({ olderThanMs: 1000 }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ count: 3 });
    expect(actionMock).toHaveBeenCalledTimes(1);
  });
});

