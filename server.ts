import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

app.post("/api/generate", async (req, res) => {
  try {
    const { review, tone, language } = req.body;

    if (!review || typeof review !== "string" || !review.trim()) {
      return res.status(400).json({ error: "Review text is required." });
    }

    if (!tone || !language) {
      return res.status(400).json({ error: "Tone and language parameters are required." });
    }

    if (process.env.NODE_ENV === "test") {
      return res.status(200).json({
        generated_response: "Thank you for the mock review.",
        sentiment_score: "Positive",
        key_insights: ["Mock insight"]
      });
    }

    const ai = getGeminiClient();

    const prompt = `
Analyze the following customer review and draft a professional response.
Target Tone: ${tone}
Target Language: ${language}

Customer Review:
"""
${review}
"""

Please draft a response in the requested language and tone. Also analyze the review to determine the overall sentiment score (must be exactly 'Positive', 'Neutral', or 'Negative') and extract 1 to 3 key insights.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are RepreAI, an elite B2B Customer Reputation SaaS assistant.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generated_response: { type: Type.STRING },
            sentiment_score: { type: Type.STRING },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["generated_response", "sentiment_score", "key_insights"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response content generated from Gemini.");

    const parsedResult = JSON.parse(responseText.trim());
    res.json(parsedResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`RepreAI Server listening on port ${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== "test") {
  init().catch(console.error);
}
