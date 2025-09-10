import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger sanitize", () => {
  const origLog = console.log;
  const origErr = console.error;
  let logs: string[] = [];
  let errs: string[] = [];

  beforeEach(() => {
    logs = [];
    errs = [];
    console.log = vi.fn((...args: any[]) => logs.push(args.join(" ")) ) as any;
    console.error = vi.fn((...args: any[]) => errs.push(args.join(" "))) as any;
  });
  afterEach(() => {
    console.log = origLog;
    console.error = origErr;
  });

  it("masks secrets in info logs", () => {
    logger.info("test", { apiKey: "abcdef123456", checksumKey: "xyz987654321", token: "tok_foobar" });
    const out = logs.join("\n");
    expect(out).toContain("abc***456");
    expect(out).toContain("xyz***321");
    expect(out).toContain("tok***bar");
  });

  it("masks secrets in error logs", () => {
    logger.error("oops", { someSecret: "shhhsecret" });
    const out = errs.join("\n");
    expect(out).toContain("shh***ret");
  });
});

