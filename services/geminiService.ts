import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

/**
 * Generates an image using the Gemini 2.5 Flash Image model.
 * @param prompt The user's text description.
 * @param aspectRatio The desired aspect ratio for the image.
 * @returns Base64 image string.
 */
export const generateImageFromPrompt = async (prompt: string, aspectRatio: AspectRatio = '16:9'): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        // Return the full data URI
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    throw new Error(error.message || "Не удалось сгенерировать изображение.");
  }
};