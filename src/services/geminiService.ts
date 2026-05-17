import { GoogleGenAI } from "@google/genai";
import type { BusinessMetrics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStrategicInsights(metrics: BusinessMetrics): Promise<string> {
  const prompt = `
    You are an expert, empathetic business consultant for Indonesian Small and Medium Enterprises (UMKM).
    You are provided with a "Gold" aggregation of their sales data in JSON format:
    ${JSON.stringify(metrics, null, 2)}

    Please act as "AnI Buddy", a trusted AI Data Analyst (the name stands for "An Insight Buddy" or simply "Anybody").
    Generate a strategic business report in Bahasa Indonesia that is actionable and encouraging.
    
    Structure the report with the following Markdown sections:
    1. **Ringkasan Strategis**: A brief wrap-up of how the business is doing.
    2. **Performa Utama**: Highlights of what's working best (top products, busiest day).
    3. **Poin Perhatian**: Any potential issues or areas for improvement.
    4. **3 Rekomendasi Operasional**: Three specific, actionable steps the owner can take right now to grow or optimize.

    Use a professional yet warm tone. Keep it concise but insightful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Gagal menghasilkan analisis AI. Silakan coba lagi.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Maaf, layanan AI sedang sibuk. Silakan coba beberapa saat lagi.");
  }
}
