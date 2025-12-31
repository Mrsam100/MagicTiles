/**
 * Storage Service
 * Safe wrapper around localStorage with error handling and validation
 * Handles cases where localStorage is unavailable (private browsing, etc.)
 */

import { sanitizeUsername, sanitizeHighScore } from '../utils/security';

class StorageService {
  private readonly USERNAME_KEY = 'mt_username';
  private readonly HIGH_SCORE_KEY = 'mt_high_score';
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if localStorage is available
   * @returns true if localStorage is available, false otherwise
   */
  private checkAvailability(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available. Data will not persist.');
      return false;
    }
  }

  /**
   * Get username from localStorage
   * @returns Sanitized username or empty string if not found
   */
  getUsername(): string {
    if (!this.isAvailable) return '';

    try {
      const value = localStorage.getItem(this.USERNAME_KEY);
      return sanitizeUsername(value || '');
    } catch (e) {
      console.error('Failed to get username from localStorage:', e);
      return '';
    }
  }

  /**
   * Set username in localStorage
   * @param username - Username to store (will be sanitized)
   * @returns true if successful, false otherwise
   */
  setUsername(username: string): boolean {
    if (!this.isAvailable) return false;

    try {
      const sanitized = sanitizeUsername(username);
      localStorage.setItem(this.USERNAME_KEY, sanitized);
      return true;
    } catch (e) {
      console.error('Failed to set username in localStorage:', e);
      return false;
    }
  }

  /**
   * Get high score from localStorage
   * @returns Valid high score or 0 if not found/invalid
   */
  getHighScore(): number {
    if (!this.isAvailable) return 0;

    try {
      const value = localStorage.getItem(this.HIGH_SCORE_KEY);
      if (!value) return 0;

      const parsed = parseInt(value, 10);
      return sanitizeHighScore(parsed);
    } catch (e) {
      console.error('Failed to get high score from localStorage:', e);
      return 0;
    }
  }

  /**
   * Set high score in localStorage
   * @param score - Score to store (will be validated)
   * @returns true if successful, false otherwise
   */
  setHighScore(score: number): boolean {
    if (!this.isAvailable) return false;

    try {
      const sanitized = sanitizeHighScore(score);
      localStorage.setItem(this.HIGH_SCORE_KEY, sanitized.toString());
      return true;
    } catch (e) {
      console.error('Failed to set high score in localStorage:', e);
      return false;
    }
  }

  /**
   * Clear all game data from localStorage
   * @returns true if successful, false otherwise
   */
  clearAll(): boolean {
    if (!this.isAvailable) return false;

    try {
      localStorage.removeItem(this.USERNAME_KEY);
      localStorage.removeItem(this.HIGH_SCORE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
      return false;
    }
  }
}

export const storageService = new StorageService();
