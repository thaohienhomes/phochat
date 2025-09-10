import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getAIBaseURL, getAIKey } from "@/lib/aiConfig";
import { ALLOWED_MODELS as ALLOWED } from "../models";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic"; // ensure streaming works in dev/prod
export const runtime = "nodejs"; // ensure Node runtime for streaming

const apiKey = getAIKey();
const baseURL = getAIBaseURL();

// OpenAI-compatible provider (Vercel AI Gateway routes by model name)
const openai = createOpenAI({ apiKey, baseURL });

function json(status: number, data: any) {
  return NextResponse.json(data, { status });
}

const ALLOWED_MODELS = new Set(ALLOWED as readonly string[]);

export async function POST(req: Request) {
  try {
    // Require auth when Clerk is configured
    if (process.env.CLERK_SECRET_KEY) {
      const { userId } = await auth();
      if (!userId) return json(401, { error: "Unauthorized" });
    }

    const { model = "gpt-4o-mini", prompt } = (await req.json()) as {
      model?: string;
      prompt: string;
    };

    if (!prompt) return json(400, { error: "Missing prompt" });
    if (model && !ALLOWED_MODELS.has(model)) return json(400, { error: "Unsupported model" });

    if (!apiKey) {
      return json(500, { error: "AI key missing. Set AI_GATEWAY_KEY (or NEXT_PUBLIC_AI_GATEWAY_KEY) in .env.local." });
    }
    // If using a gateway key (heuristic), require a baseURL to be set to avoid 401s against api.openai.com
    if (/^vck_/i.test(apiKey) && !baseURL) {
      return json(500, {
        error:
          "Gateway key detected but AI_GATEWAY_BASE_URL is not set. Set your AI gateway base URL (or NEXT_PUBLIC_AI_GATEWAY_BASE_URL) in .env.local.",
      });
    }

    // Tier-based gating for pro models
    const PRO_MODELS = new Set(["gpt-4o", "o3-mini", "claude-3-sonnet", "claude-3-5-sonnet-latest"]);
    if (PRO_MODELS.has(model)) {
      let tier: string | null = null;
      try {
        // Ask Convex for current user's tier using Clerk JWT (if available)
        const { getToken } = await auth();
        const token = typeof getToken === "function" ? await getToken({ template: "convex" }) : null;
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("../../../../../convex/_generated/api");
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
        if (token && typeof (convex as any).setAuth === "function") (convex as any).setAuth(token);
        const res = await convex.query(api.users.getTier, {} as any).catch(() => null);
        tier = (res as any) ?? null;
      } catch {
        tier = null;
      }
      if (tier !== "pro" && tier !== "team") {
        return json(403, { error: "Model requires Pro plan" });
      }
    }

    console.log("[AI] streamText", { model, using: "chat.completions", baseURL });
    const result = await streamText({ model: openai.chat(model), prompt });

    // Stream plain text chunks; ignore non-text events
    return result.toTextStreamResponse();
  } catch (err: any) {
    // Surface richer error info during dev
    const message = err?.message || String(err);
    const stack = err?.stack;
    return json(500, { error: message, stack });
  }
}
