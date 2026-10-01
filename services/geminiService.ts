import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Audio
                }
            },
            {
                text: `
                Please provide a high-quality transcription of the audio provided.
                1. Identify different speakers if possible (e.g., Speaker 1, Speaker 2).
                2. Ignore filler words like "um", "uh" unless they add meaning to the hesitation.
                3. Format the text cleanly with proper punctuation and paragraph breaks.
                `
            }
        ]
      }
    });

    if (response.text) {
        return response.text;
    }
    return "The model did not return any text. The audio might be silent or unrecognizable.";

  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio. Please ensure the file is a valid audio format and try again.");
  }
}
