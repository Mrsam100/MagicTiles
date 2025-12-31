
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private isQuotaExceeded: boolean = false;

  private FALLBACK_REVIEWS = [
    "Your timing is pure magic! You have the soul of a true virtuoso.",
    "Absolutely breathtaking performance. The rhythm flows through you like a river of light.",
    "Simply wonderful! You're turning every tap into a masterpiece of sound.",
    "Your precision is world-class. You're not just playing; you're conducting a symphony.",
    "A legendary run! Your focus is unbreakable and your rhythm is divine.",
    "Incredible! You have a natural gift for melody that is rare to see.",
    "That was magical! You make the impossible look easy with your speed.",
    "Brilliant work! Your coordination is reaching the level of a master."
  ];

  constructor() {
    this.initAI();
  }

  private initAI() {
    try {
      if (process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY.length > 5) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      }
    } catch (e) {
      console.warn("Gemini AI initialization failed - using sweet fallbacks.");
    }
  }

  public getRandomFallback(username: string): string {
    const name = username || 'Maestro';
    const review = this.FALLBACK_REVIEWS[Math.floor(Math.random() * this.FALLBACK_REVIEWS.length)];
    return `${name}, ${review}`;
  }

  async getPerformanceReview(username: string, score: number, maxCombo: number): Promise<string> {
    if (this.isQuotaExceeded || !this.ai) return this.getRandomFallback(username);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The player "${username}" just finished a "Magic Tiles" rhythm game. 
        Score: ${score}, Max Combo: ${maxCombo}.
        Provide a short, incredibly sweet, and encouraging performance review addressed to "${username}" (max 12 words). 
        Mention how magical and sweet their rhythm is.`,
      });
      return response.text?.trim() || this.getRandomFallback(username);
    } catch (e: any) {
      console.error("AI Review failed:", e);
      if (e?.status === 429 || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('key')) {
        this.isQuotaExceeded = true;
      }
      return this.getRandomFallback(username);
    }
  }
}

export const geminiService = new GeminiService();
