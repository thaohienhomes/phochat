import { describe, it, expect } from "vitest";
import { stableHash, deriveOrderStatus } from "./payosWebhook";

describe("stableHash", () => {
  it("produces the same hash for same object regardless of key order", () => {
    const a = { b: 2, a: 1, c: { z: 9, y: 8 } };
    const b = { c: { y: 8, z: 9 }, a: 1, b: 2 };
    expect(stableHash(a)).toBe(stableHash(b));
  });

  it("changes when content changes", () => {
    const a = { a: 1 };
    const b = { a: 2 };
    expect(stableHash(a)).not.toBe(stableHash(b));
  });
});

describe("deriveOrderStatus", () => {
  it("returns succeeded when code is '00'", () => {
    expect(deriveOrderStatus({ code: "00" })).toBe("succeeded");
  });

  it("returns succeeded when status is 'PAID' (case-insensitive)", () => {
    expect(deriveOrderStatus({ status: "PAID" })).toBe("succeeded");
    expect(deriveOrderStatus({ status: "paid" })).toBe("succeeded");
  });

  it("returns failed otherwise", () => {
    expect(deriveOrderStatus({ code: "01" })).toBe("failed");
    expect(deriveOrderStatus({ status: "PENDING" })).toBe("failed");
    expect(deriveOrderStatus({})).toBe("failed");
  });
});




describe("idempotency event hash behavior", () => {
  it("treats identical (orderCode, code, id) as the same event", () => {
    const a = { orderCode: 123, code: "00", id: "evt_1" };
    const b = { id: "evt_1", code: "00", orderCode: 123 };
    expect(stableHash(a)).toBe(stableHash(b));
  });
  it("treats different event id as different events (retry vs new)", () => {
    const a = { orderCode: 123, code: "00", id: "evt_1" };
    const b = { orderCode: 123, code: "00", id: "evt_2" };
    expect(stableHash(a)).not.toBe(stableHash(b));
  });
});
