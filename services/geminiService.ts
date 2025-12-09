import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates an image using the Gemini 2.5 Flash Image model.
 * @param prompt The user's text description.
 * @param aspectRatio The desired aspect ratio for the image.
 * @returns Base64 image string.
 */
export const generateImageFromPrompt = async (prompt: string, aspectRatio: AspectRatio = '16:9'): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Enhance prompt for better quality
  const enhancedPrompt = `${prompt}, high quality, HD, 4k, highly detailed, photorealistic`;

  let lastError: any = null;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: enhancedPrompt },
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
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;

      // Check for Quota/Rate Limit errors
      const isRateLimit = 
        error.message?.includes('429') || 
        error.message?.includes('RESOURCE_EXHAUSTED') || 
        error.status === 429;

      if (isRateLimit && attempt < maxRetries - 1) {
        // Exponential backoff: 2s, 4s...
        const delayMs = 2000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delayMs}ms...`);
        await wait(delayMs);
        continue;
      }
      
      // If it's not a rate limit, or we ran out of retries, break loop
      break;
    }
  }

  // Process the final error to make it user-friendly
  console.error("Gemini Image Gen Final Error:", lastError);
  
  let userMessage = "Не удалось сгенерировать изображение.";
  
  if (lastError) {
    const msg = lastError.message || JSON.stringify(lastError);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      userMessage = "Достигнут лимит запросов (Quota Exceeded). Попробуйте подождать минуту или используйте другой API ключ.";
    } else if (msg.includes('API Key is missing')) {
      userMessage = "Отсутствует API ключ.";
    } else {
      // Try to extract a clean message if it's JSON
      try {
        // Sometimes the error message is a stringified JSON object
        const match = msg.match(/{.*}/);
        if (match) {
           // Don't show raw JSON to user, show generic error + log
           userMessage = "Ошибка сервиса генерации. Попробуйте изменить запрос.";
        } else {
           userMessage = msg;
        }
      } catch (e) {
        userMessage = msg;
      }
    }
  }

  throw new Error(userMessage);
};