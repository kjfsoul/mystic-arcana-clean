import { TarotCard } from '../lib/tarot-utils';

// Major Arcana cards
const majorArcana: TarotCard[] = [
  {
    id: "major-0",
    name: "The Fool",
    arcana: "major",
    image_id: "00-fool.webp",
    meaning_upright: "New beginnings, innocence, spontaneity, free spirit",
    meaning_reversed: "Recklessness, risk-taking, inconsideration",
    keywords: ["beginnings", "innocence", "journey", "potential"]
  },
  {
    id: "major-1",
    name: "The Magician",
    arcana: "major",
    image_id: "01-magician.webp",
    meaning_upright: "Manifestation, resourcefulness, power, inspired action",
    meaning_reversed: "Manipulation, poor planning, untapped talents",
    keywords: ["manifestation", "power", "action", "creativity"]
  },
  {
    id: "major-2",
    name: "The High Priestess",
    arcana: "major",
    image_id: "02-high-priestess.webp",
    meaning_upright: "Intuition, sacred knowledge, divine feminine, subconscious mind",
    meaning_reversed: "Secrets, disconnected from intuition, withdrawal",
    keywords: ["intuition", "mystery", "spirituality", "higher power"]
  }
  // Add more cards as needed
];

// Export all cards
export const allTarotCards: TarotCard[] = [
  ...majorArcana,
  // Add minor arcana when needed
];

// Export by arcana
export const getMajorArcana = () => majorArcana;
