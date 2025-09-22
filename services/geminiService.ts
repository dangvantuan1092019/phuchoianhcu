
import { GoogleGenAI, Modality } from "@google/genai";
import type { RestorationResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const base64ToInlineData = (base64: string, mimeType: string) => {
  // The base64 string from FileReader includes the data URI prefix,
  // e.g., "data:image/png;base64,iVBORw0KGgo...". We need to remove it.
  const data = base64.split(',')[1];
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export const restoreImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<RestorationResult> => {
  const imagePart = base64ToInlineData(base64ImageData, mimeType);
  const textPart = { text: prompt };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let restoredImage: string | null = null;
    let resultText: string | null = null;
    
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            resultText = part.text;
          } else if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            restoredImage = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          }
        }
    }

    if (!restoredImage) {
        throw new Error("AI did not return an image. It might have refused the request.");
    }
    
    return { image: restoredImage, text: resultText };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to restore image using Gemini API.");
  }
};
