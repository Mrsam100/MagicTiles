/**
 * Security Utilities
 * Input sanitization and validation functions
 */

/**
 * Sanitizes a username by removing potentially dangerous characters
 * Allows only alphanumeric characters and spaces
 * @param input - Raw username input
 * @returns Sanitized username
 */
export const sanitizeUsername = (input: string): string => {
  if (!input) return '';

  // Remove any characters that aren't alphanumeric or spaces
  let sanitized = input.replace(/[^a-zA-Z0-9\s]/g, '');

  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Trim whitespace from start and end
  sanitized = sanitized.trim();

  // Limit length to 12 characters
  sanitized = sanitized.slice(0, 12);

  return sanitized;
};

/**
 * Validates a username against game requirements
 * - Must be 2-12 characters
 * - Only alphanumeric and spaces allowed
 * - Cannot be only spaces
 * @param input - Username to validate
 * @returns true if valid, false otherwise
 */
export const validateUsername = (input: string): boolean => {
  if (!input || input.length < 2 || input.length > 12) {
    return false;
  }

  // Check if only contains valid characters
  if (!/^[a-zA-Z0-9\s]+$/.test(input)) {
    return false;
  }

  // Ensure it's not just spaces
  if (input.trim().length === 0) {
    return false;
  }

  return true;
};

/**
 * Sanitizes content from AI or user sources
 * Removes HTML tags and potentially dangerous content
 * @param content - Content to sanitize
 * @returns Sanitized content
 */
export const sanitizeContent = (content: string): string => {
  if (!content) return '';

  // Remove HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '');

  // Remove script/style content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Limit length to prevent extremely long content
  sanitized = sanitized.slice(0, 150);

  return sanitized.trim();
};

/**
 * Validates and sanitizes a high score value
 * @param value - Score value to validate
 * @returns Valid non-negative integer or 0 if invalid
 */
export const sanitizeHighScore = (value: string | number | null): number => {
  if (value === null || value === undefined) return 0;

  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return 0;
  }

  // Prevent absurdly large scores (max 1 million)
  return Math.min(num, 1000000);
};
