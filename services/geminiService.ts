
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFestiveBlessing = async (name: string, style: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, ultra-luxurious Christmas blessing for ${name}. The tone should be ${style}, echoing the "Winston" brand: opulence, emerald elegance, and golden success. Max 20 words.`,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });
    return response.text || "May your holiday be as brilliant as a golden emerald.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Wishing you a Winston Signature Christmas of pure gold.";
  }
};

export const generateTreePoem = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Write a 4-line cinematic poem about a majestic Emerald and Gold Christmas tree standing in a dark, silent hall. High elegance only.",
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Emerald boughs in silent night,\nDraped in gold, a holy light.\nWinston stands in regal grace,\nTime stands still in this high space.";
  } catch (error) {
    return "Majesty in emerald green, the finest gold that's ever seen.";
  }
};
