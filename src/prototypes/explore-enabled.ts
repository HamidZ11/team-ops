/**
 * Design exploration (the concept index, concepts A and B, experiments) is
 * development-only, so the production-facing app has no route to it.
 * Set MERIDIAN_EXPLORE=1 to include it in a production build for review.
 */
export const EXPLORE_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.MERIDIAN_EXPLORE === "1";
