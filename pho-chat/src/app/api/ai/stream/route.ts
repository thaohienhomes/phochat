import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const dynamic = "force-dynamic"; // ensure streaming works in dev/prod
export const runtime = "nodejs"; // ensure Node runtime for streaming

const apiKey = process.env.AI_GATEWAY_KEY || process.env.NEXT_PUBLIC_AI_GATEWAY_KEY;
const baseURL = process.env.AI_GATEWAY_BASE_URL || process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL;

// OpenAI provider (Chat Completions)
const openai = createOpenAI({ apiKey, baseURL });

function json(status: number, data: any) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    const { model = "gpt-4o-mini", prompt } = (await req.json()) as {
      model?: string;
      prompt: string;
    };

    if (!prompt) return json(400, { error: "Missing prompt" });

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

