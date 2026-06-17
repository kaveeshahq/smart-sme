import { NextRequest, NextResponse } from "next/server";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { aiTools, executeAiTool } from "@/lib/ai-tools";
import type { Content } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are the AI assistant inside Smart SME, a business management system for a Sri Lankan SME. You have tools to look up real business data: revenue/expenses, products/stock, customers, recent sales, employees, and top sellers. Always use a tool instead of guessing when the question needs real data. Currency is LKR — format amounts naturally (e.g. "LKR 45,000"). Be concise, friendly, and direct. Don't repeat raw JSON back to the user; summarize in plain English. If a query is ambiguous, make a reasonable assumption rather than asking too many clarifying questions.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "messages array is required" },
        { status: 400 }
      );
    }

    // Convert chat history into Gemini's Content[] format
    const contents: Content[] = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    let response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: aiTools }],
      },
    });

    // Tool-calling loop — keep executing tools until the model gives a final text answer
    let loopCount = 0;
    while (loopCount < 5) {
      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) break;

      // Append the model's tool-call turn to history
      const modelParts = response.candidates?.[0]?.content?.parts || [];
      contents.push({ role: "model", parts: modelParts });

      // Execute every requested tool call and collect responses
      const functionResponseParts = await Promise.all(
        functionCalls.map(async (call) => {
          const result = await executeAiTool(call.name || "", call.args || {});
          return {
            functionResponse: {
              name: call.name,
              response: { result },
            },
          };
        })
      );

      contents.push({ role: "user", parts: functionResponseParts });

      response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: aiTools }],
        },
      });

      loopCount++;
    }

    const reply = response.text || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ success: true, data: { reply } });
  } catch (error) {
    console.error("AI Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}