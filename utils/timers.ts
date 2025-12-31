/**
 * Timer Cleanup Utilities
 * Automatic cleanup of setTimeout/setInterval to prevent memory leaks
 */

/**
 * CleanupTimer
 * Utility class that automatically tracks and cleans up timers
 * Prevents "setState on unmounted component" warnings and memory leaks
 */
export class CleanupTimer {
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();

  /**
   * Create a timeout that will be automatically cleaned up
   * @param callback - Function to execute after delay
   * @param delay - Delay in milliseconds
   * @returns Timeout ID
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const id = setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, delay);
    this.timeouts.add(id);
    return id;
  }

  /**
   * Create an interval that will be automatically cleaned up
   * @param callback - Function to execute repeatedly
   * @param delay - Delay between executions in milliseconds
   * @returns Interval ID
   */
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const id = setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  }

  /**
   * Clear a specific timeout
   * @param id - Timeout ID to clear
   */
  clearTimeout(id: NodeJS.Timeout): void {
    clearTimeout(id);
    this.timeouts.delete(id);
  }

  /**
   * Clear a specific interval
   * @param id - Interval ID to clear
   */
  clearInterval(id: NodeJS.Timeout): void {
    clearInterval(id);
    this.intervals.delete(id);
  }

  /**
   * Clear all tracked timers
   * Should be called in component cleanup (useEffect return)
   */
  clearAll(): void {
    this.timeouts.forEach(id => clearTimeout(id));
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.clear();
    this.intervals.clear();
  }

  /**
   * Get count of active timers (for debugging)
   */
  getActiveCount(): { timeouts: number; intervals: number } {
    return {
      timeouts: this.timeouts.size,
      intervals: this.intervals.size
    };
  }
}

/**
 * Hook-friendly timer cleanup utility
 * Use this in React components
 * @returns CleanupTimer instance
 */
export const useCleanupTimer = (): CleanupTimer => {
  return new CleanupTimer();
};
