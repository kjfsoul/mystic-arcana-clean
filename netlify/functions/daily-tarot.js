// netlify/functions/daily-tarot.js
import crypto from 'crypto'; // For hashing, built-in Node.js module
import { isPremiumUser, supabaseAdmin } from '../shared/supabase-admin.js';

// Function to get a deterministic daily card ID
async function getDeterministicCardId(dateString, userId = null) {
  try {
    const { data: cards, error: countError } = await supabaseAdmin
      .from('tarot_cards')
      .select('id');

    if (countError || !cards || cards.length === 0) {
      console.error('Error fetching tarot card IDs or no cards found:', countError);
      throw new Error('Could not retrieve tarot card list.');
    }

    const sortedCardIds = cards.map(c => c.id).sort(); // Ensure consistent order
    const totalCards = sortedCardIds.length;

    let seed = dateString;
    if (userId) {
      seed += `-${userId}`;
    }

    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const decimalHash = parseInt(hash.substring(0, 8), 16); // Use a portion of the hash
    const cardIndex = decimalHash % totalCards;

    return sortedCardIds[cardIndex];
  } catch (error) {
    console.error('Error in getDeterministicCardId:', error);
    throw error;
  }
}

// Function to construct the image path based on card properties
const constructCardImagePath = (card) => {
  if (!card) return '';
  
  if (card.arcana === 'major') {
    return `/images/tarot/decks/rider-waite/major/${card.id}.png`;
  } else if (card.arcana === 'minor' && card.suit) {
    return `/images/tarot/decks/rider-waite/minor/${card.suit}/${card.id}.png`;
  }
  
  // Fallback
  return `/images/tarot/decks/rider-waite/${card.id}.png`;
};

export const handler = async (event, context) => {
  // Check for required environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required Supabase environment variables in daily-tarot function');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error - missing environment variables' }),
    };
  }

  // Parse request body if it exists
  const body = event.body ? JSON.parse(event.body) : {};
  const { user_id } = body;

  // For a general daily card, use today's date
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for daily consistency

  try {
    const dailyCardId = await getDeterministicCardId(today, user_id);

    const { data: card, error: cardError } = await supabaseAdmin
      .from('tarot_cards')
      .select('*')
      .eq('id', dailyCardId)
      .single();

    if (cardError) {
      console.error('Supabase error fetching daily card:', cardError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to retrieve daily tarot card from database.',
          details: process.env.NODE_ENV === 'development' ? cardError.message : undefined
        }),
      };
    }

    if (!card) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Daily tarot card not found.' }),
      };
    }
    
    // Determine if card is reversed (22% chance, deterministically)
    const reversedHash = crypto.createHash('sha256').update(today + card.id + (user_id || '')).digest('hex');
    const isReversed = parseInt(reversedHash.substring(0, 2), 16) % 100 < 22; // 22% chance
    
    // Process the card data to match frontend expectations
    const processedCard = {
      id: card.id,
      name: card.name,
      arcana: card.arcana,
      suit: card.suit,
      meaningUpright: card.meaning_upright || card.meaningUpright,
      meaningReversed: card.meaning_reversed || card.meaningReversed,
      keywords: card.keywords || [],
      element: card.element,
      zodiacSign: card.zodiac_sign || card.zodiacSign,
      // Generate the proper image path based on the card's properties
      imagePath: constructCardImagePath(card)
    };

    // If user_id is provided, save this reading to user history
    if (user_id) {
      try {
        const { error: readingError } = await supabaseAdmin
          .from('user_readings')
          .insert({
            user_id,
            card_id: card.id,
            reading_type: 'daily',
            is_reversed: isReversed,
            created_at: new Date().toISOString(),
          });

        if (readingError) {
          // Log error but don't fail the request
          console.error('Error saving reading history:', readingError);
        }
        
        // Check if user has premium for additional content
        const isPremium = await isPremiumUser(user_id);
        
        // If user is premium, we could enhance the response with additional data
        if (isPremium) {
          processedCard.extendedMeaning = card.extended_meaning || 
            'Additional insights will be available soon.';
        }
      } catch (userError) {
        console.error('Error processing user data:', userError);
        // Continue despite user-related error
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        card: processedCard,
        isReversed,
        timestamp: new Date().toISOString(),
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    };
  } catch (error) {
    console.error('Error in daily-tarot function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to get daily tarot card',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    };
  }
};
