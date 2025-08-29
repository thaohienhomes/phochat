import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_KEY || process.env.NEXT_PUBLIC_AI_GATEWAY_KEY,
  baseURL: process.env.AI_GATEWAY_BASE_URL || process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL,
});

export async function POST(req: Request) {
  try {
    const { model = "gpt-4o-mini", prompt } = (await req.json()) as {
      model?: string;
      prompt: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const result = await streamText({
      model: openai(model),
      prompt,
    });

    // Stream the response back to the client
    // This returns a web Response that streams chunks as they arrive
    // Next.js (edge runtime) can return this directly
    // @ts-ignore - types expect a generic Response
    return result.toAIStreamResponse();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

