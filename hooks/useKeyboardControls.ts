/**
 * Keyboard Controls Hook
 * Provides keyboard navigation for the game
 * Supports A/S/D/F and 1/2/3/4 keys for lane controls
 */

import { useEffect } from 'react';

interface KeyboardControlsConfig {
  onLanePress: (lane: number) => void;
  isActive: boolean;
}

/**
 * useKeyboardControls
 * Enables keyboard controls for the game lanes
 * @param onLanePress - Callback when a lane key is pressed
 * @param isActive - Whether keyboard controls are active
 */
export const useKeyboardControls = ({
  onLanePress,
  isActive
}: KeyboardControlsConfig): void => {
  useEffect(() => {
    if (!isActive) return;

    // Map keys to lane indices
    const keyMap: Record<string, number> = {
      // ASDF keys (recommended for rhythm games)
      'a': 0,
      'A': 0,
      's': 1,
      'S': 1,
      'd': 2,
      'D': 2,
      'f': 3,
      'F': 3,
      // Number keys (alternative)
      '1': 0,
      '2': 1,
      '3': 2,
      '4': 3,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const lane = keyMap[e.key];

      // If key is mapped to a lane and not a repeat event
      if (lane !== undefined && !e.repeat) {
        e.preventDefault();
        onLanePress(lane);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onLanePress, isActive]);
};
