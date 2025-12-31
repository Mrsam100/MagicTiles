/**
 * Performance Review Service
 * Provides encouraging feedback messages to players after each game
 */

export class GeminiService {
  private readonly FALLBACK_REVIEWS = [
    "Your timing is pure magic! You have the soul of a true virtuoso.",
    "Absolutely breathtaking performance. The rhythm flows through you like a river of light.",
    "Simply wonderful! You're turning every tap into a masterpiece of sound.",
    "Your precision is world-class. You're not just playing; you're conducting a symphony.",
    "A legendary run! Your focus is unbreakable and your rhythm is divine.",
    "Incredible! You have a natural gift for melody that is rare to see.",
    "That was magical! You make the impossible look easy with your speed.",
    "Brilliant work! Your coordination is reaching the level of a master.",
    "Outstanding! Your rhythm is as smooth as silk and twice as sweet.",
    "Phenomenal! You've mastered the art of perfect timing.",
    "Amazing! Every tap resonates with musical genius.",
    "Spectacular! Your performance was nothing short of extraordinary."
  ];

  public getRandomFallback(username: string): string {
    const name = username || 'Maestro';
    const review = this.FALLBACK_REVIEWS[Math.floor(Math.random() * this.FALLBACK_REVIEWS.length)];
    return `${name}, ${review}`;
  }

  async getPerformanceReview(username: string, _score: number, _maxCombo: number): Promise<string> {
    return this.getRandomFallback(username);
  }
}

export const geminiService = new GeminiService();
