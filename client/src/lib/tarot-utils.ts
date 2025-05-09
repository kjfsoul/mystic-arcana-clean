/**
 * Constructs the image path for a given tarot card.
 * Assumes images are stored in /public/images/tarot/[deck]/[image_id]
 * @param image_id - The unique identifier for the card image (e.g., "00-fool.webp", "wands01.webp").
 * @param deck - The deck identifier (e.g., "rider-waite"). Defaults to "rider-waite".
 * @returns The full public path to the card image.
 */
export const getTarotCardImagePath = (
  image_id: string,
  deck: string = 'rider-waite'
): string => {
  if (!image_id) {
    console.warn("getTarotCardImagePath called with no image_id, returning placeholder.");
    return '/images/tarot/placeholders/card-unknown.webp'; // A generic unknown card placeholder
  }
  return `/images/tarot/${deck}/${image_id}`;
};

// Add other tarot-related utility functions here as needed, for example:
// - Function to normalize card names for IDs
// - Function to get card details from a local dataset (if not always relying on API)

// Example: Define TarotCard interface if not already globally defined in shared/types
// This should align with what your API returns and what AnimatedTarotCard expects.
export interface TarotCard {
  id: string; // e.g., "major-0", "minor-wands-01"
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  image_id: string; // e.g., "00-fool.webp" - this is what getTarotCardImagePath will use
  meaning_upright: string;
  meaning_reversed: string;
  keywords?: string[];
  description?: string;
  // These are for the component, derived or passed in
  imagePath?: string; // Full path derived by getTarotCardImagePath
  is_reversed?: boolean; // If determined by draw logic
}