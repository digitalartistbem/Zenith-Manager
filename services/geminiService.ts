import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getInspirationalContent = async (type: 'quote' | 'verse'): Promise<string> => {
  const prompt = type === 'quote'
    ? 'Generate a single, short, uplifting and elegant motivational quote for a woman.'
    : 'Generate a single, inspirational Bible verse, including the book, chapter, and verse number (e.g., Philippians 4:13).';

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching inspirational ${type}:`, error);
    if (type === 'quote') {
        return "The most beautiful thing you can wear is confidence. - Blake Lively";
    } else {
        return "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope. - Jeremiah 29:11";
    }
  }
};
