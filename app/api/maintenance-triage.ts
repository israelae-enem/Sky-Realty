// app/api/maintenance-triage/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that assigns priority to maintenance requests. Return only one: low, medium, or high.",
        },
        {
          role: "user",
          content: `Prioritize this maintenance request: "${description}"`,
        },
      ],
      temperature: 0,
    });

    const choice = completion.choices?.[0];
    let priority = "medium";

    if (choice) {
      // ✅ Type-safe trim
      if ("message" in choice && typeof choice.message?.content === "string") {
        priority = choice.message.content.trim().toLowerCase();
      } else if ("text" in choice && typeof choice.text === "string") {
        priority = choice.text.trim().toLowerCase();
      }
    }

    // Validate priority
    if (!["low", "medium", "high"].includes(priority)) priority = "medium";

    return NextResponse.json({ priority });
  } catch (err) {
    console.error("AI triage error:", err);
    return NextResponse.json(
      { priority: "medium", error: "AI triage failed" },
      { status: 500 }
    );
  }
}