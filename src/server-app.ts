import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Helper to handle transient Gemini 503 errors and fall back gracefully
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  if (!ai) {
    throw new Error("Gemini API client not initialized.");
  }
  try {
    return await ai.models.generateContent({
      model: "gemini-3.5-flash",
      ...params,
    });
  } catch (err: any) {
    const errMsg = (err?.message || "").toLowerCase();
    const isTransient =
      errMsg.includes("503") ||
      errMsg.includes("unavailable") ||
      errMsg.includes("busy") ||
      errMsg.includes("overloaded");

    if (isTransient) {
      console.warn("Primary model 'gemini-3.5-flash' returned transient error, trying fallback 'gemini-flash-latest'...");
      try {
        return await ai.models.generateContent({
          model: "gemini-flash-latest",
          ...params,
        });
      } catch (fallbackErr: any) {
        console.error("Fallback 'gemini-flash-latest' also failed:", fallbackErr);
        throw err;
      }
    }
    throw err;
  }
}

// API Routes
app.post("/api/ai/generate", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API key is not configured. Please add it to your secrets.",
    });
  }

  const { prompt, tone = "creative", length = "medium", keywords = [] } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt parameter." });
  }

  const wordCountGuide =
    length === "short" ? "300-500 words" : length === "long" ? "1200-1500 words" : "600-900 words";

  const systemInstruction = `You are a professional, high-caliber blog writer and editor. Your style is engaging, original, and deeply thoughtful, free of fluff ("in this fast-paced world", "delve", "it is important to note", etc.). You write formatted markdown content that flows beautifully with clean headers, paragraphs, and lists.
Always return your response in the requested JSON schema representing the complete, newly generated draft.`;

  const keywordsContext = keywords.length > 0 ? `Include and weave in these keywords: ${keywords.join(", ")}.` : "";

  const promptContent = `Write an exquisite blog post based on this core prompt/idea: "${prompt}".
Tone of voice: ${tone}
Length target: Approximately ${wordCountGuide}
${keywordsContext}

You must return a JSON object with:
1. "title": A compelling, non-clickbaity, highly readable title.
2. "content": The complete written blog post in exceptionally rich, elegant markdown. Use standard markdown headers (##), bold text, and neat paragraphs or bullet points to structure the post.
3. "summary": A brief, elegant, single-sentence meta description of the post.
4. "tags": An array of 3-4 neat, lowercase single-word tags representing the subjects.`;

  try {
    const response = await generateContentWithFallback({
      contents: promptContent,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "content", "summary", "tags"],
          properties: {
            title: {
              type: Type.STRING,
              description: "The headline/title of the blog post.",
            },
            content: {
              type: Type.STRING,
              description: "The markdown written body of the blog post.",
            },
            summary: {
              type: Type.STRING,
              description: "A short meta summary/hook.",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of relevant tags.",
            },
          },
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI model.");
    }

    const data = JSON.parse(response.text.trim());
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate blog content via AI.",
    });
  }
});

app.post("/api/ai/edit", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API key is not configured. Please add it to your secrets.",
    });
  }

  const { text, action, customInstruction, blogContext = "" } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "No text provided for editing." });
  }

  let instructions = "";
  if (action === "improve") {
    instructions = "Enhance readability, flow, and vocabulary while keeping the original meaning and structure.";
  } else if (action === "expand") {
    instructions = "Elaborate with interesting sub-points, examples, or thoughts, adding beautiful depth without fluff.";
  } else if (action === "shorten") {
    instructions = "Condense the selection to be highly concise and punchy without losing key insights.";
  } else if (action === "tone-casual") {
    instructions = "Rewrite the text in an informal, friendly, conversational, and warm human voice.";
  } else if (action === "tone-professional") {
    instructions = "Rewrite in an authoritative, clear, polished, and structured corporate or professional voice.";
  } else if (action === "improve-grammar") {
    instructions = "Correct any typos, punctuation issues, grammatical mistakes, and subtle awkward phrasing.";
  } else if (action === "custom" && customInstruction) {
    instructions = `Modify the text as requested: "${customInstruction}"`;
  } else {
    instructions = "Polishes the text, correcting subtle grammatical errors and improving vocabulary.";
  }

  const systemInstruction = `You are a precise, context-aware prose editor. You refine textual selections strictly while respecting the desired instruction. You return ONLY the modified text, ensuring it matches the ambient scope, without adding conversational intros ("Sure, here is...", "Revised text:", etc.) or surround formatting. Save markdown if it existed in the original text.`;

  const promptContent = `Here is the section of text to edit:
---
${text}
---

Action requested: ${instructions}
${blogContext ? `Ambient post context (for matching style and topic):\n"""\n${blogContext}\n"""` : ""}

Provide the beautifully rewritten prose directly. Do not wrap it in quotes or conversational commentary.`;

  try {
    const response = await generateContentWithFallback({
      contents: promptContent,
      config: {
        systemInstruction,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI model.");
    }

    return res.json({ success: true, text: response.text.trim() });
  } catch (error: any) {
    console.error("AI Edit Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process text edit via AI.",
    });
  }
});

export default app;
