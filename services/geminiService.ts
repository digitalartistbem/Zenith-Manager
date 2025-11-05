import { GoogleGenAI } from "@google/genai";

// The 'process' object is not available in a standard browser environment.
// This check ensures the app doesn't crash when deployed to a static host.
// The API key is expected to be provided by the execution environment (like AI Studio).
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY)
    ? process.env.API_KEY
    : undefined;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    // This warning will show in the browser console on GitHub Pages
    console.warn("API_KEY not found. Inspirational content will use fallback data.");
}

export const getInspirationalContent = async (type: 'quote' | 'verse'): Promise<string> => {
  const prompt = type === 'quote'
    ? 'Generate a single, short, uplifting and elegant motivational quote for a woman.'
    : 'Generate a single, inspirational Bible verse, including the book, chapter, and verse number (e.g., Philippians 4:13).';
  
  // Use fallback if the API is not initialized
  if (!ai) {
    console.error(`Gemini API not initialized. Using fallback for inspirational ${type}.`);
    if (type === 'quote') {
        return "The most beautiful thing you can wear is confidence. - Blake Lively";
    } else {
        return "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope. - Jeremiah 29:11";
    }
  }

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