/**
 * Moderation System Configuration
 * Central configuration for moderation thresholds and rules
 */

export const MODERATION_CONFIG = {
  /**
   * Number of strikes before a user is automatically shadowbanned
   * When a user reaches this threshold, they can still use the app
   * but their content is hidden from other users
   */
  STRIKE_THRESHOLD_FOR_SHADOWBAN: 5,

  /**
   * Number of unique reports required before a pin is automatically deleted
   * Each report must be from a different user (duplicates are prevented)
   * When this threshold is reached:
   * - The pin is deleted
   * - The pin creator receives a strike
   * - If the creator reaches STRIKE_THRESHOLD_FOR_SHADOWBAN, they are shadowbanned
   */
  REPORT_THRESHOLD_FOR_PIN_DELETION: 10,

  /**
   * Default reason for automatic shadowbans
   */
  AUTO_SHADOWBAN_REASON: 'Automatic: 5 or more strikes',
} as const;

/**
 * Type for moderation config (for type safety)
 */
export type ModerationConfig = typeof MODERATION_CONFIG;

