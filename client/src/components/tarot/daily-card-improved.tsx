import React, { useState, useEffect } from 'react';
import { TarotCard, getTarotCardImagePath } from '../../lib/tarot-utils';
import { allTarotCards } from '../../data/tarot-cards';
import src from 'openai/src/index.js';

interface DailyCardProps {
  userId?: string;
}

const DailyCardImproved: React.FC<DailyCardProps> = ({ userId }) => {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchDailyCard = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from API first
        try {
          const response = await fetch('/api/tarot/cards/card-of-the-day');
          
          if (response.ok) {
            const data = await response.json();
            
            // Ensure the card has an image path
            const cardWithPath = {
              ...data.card,
              imagePath: getTarotCardImagePath(data.card.image_id)
            };
            
            setCard(cardWithPath);
            setIsReversed(data.isReversed);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('API fetch failed, falling back to local data:', apiError);
        }
        
        // Fallback to local data
        const { card: dailyCard, isReversed: cardIsReversed } = getDailyCard(allTarotCards);
        
        // Ensure the card has an image path
        const cardWithPath = {
          ...dailyCard,
          imagePath: getTarotCardImagePath(dailyCard.image_id)
        };
        
        setCard(cardWithPath);
        setIsReversed(cardIsReversed);
      } catch (error) {
        console.error('Error loading daily card:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDailyCard();
  }, [userId]);
  
  // Helper function for local fallback
  function getDailyCard(cards: TarotCard[]): { card: TarotCard; isReversed: boolean } {
    // Use the current date as a seed for consistent daily card
    const now = new Date();
    const dateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const userSeed = userId || 'anonymous';
    const seed = dateString + userSeed;
    
    // Create a simple hash from the seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use the hash to select a card
    const cardIndex = Math.abs(hash) % cards.length;
    const card = cards[cardIndex];
    
    // Determine if the card is reversed (50% chance)
    const isReversed = (Math.abs(hash) % 2) === 1;
    
    return { card, isReversed };
  }
  
  const handleReveal = () => {
    setIsRevealed(true);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }
  
  // Render error state
  if (error || !card) {
    return (
      <div className="text-center p-6 bg-dark-800 rounded-lg shadow-lg">
        <h2 className="text-xl text-red-400 mb-4">Unable to load your daily card</h2>
        <p className="mb-4">{error?.message || "An unknown error occurred"}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary-700 hover:bg-primary-600 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="daily-card-container">
      {/* Card component and reveal logic here */}
      <div className="text-center">
        <h2 className="text-2xl mb-6">Your Daily Tarot Card</h2>
        
        {!isRevealed ? (
          <div className="flex flex-col items-center">
            <div className="card-back w-64 h-96 bg-dark-700 rounded-lg shadow-lg mb-6 flex items-center justify-center">
              <span className="text-gold text-lg">Tap to Reveal</span>
            </div>
            <button 
              onClick={handleReveal}
              className="px-6 py-3 bg-primary-700 hover:bg-primary-600 rounded-md transition-colors"
            >
              Reveal My Card
            </button>
          </div>
        ) : (
          <div className="revealed-card">
            <div className={`card-front w-64 h-96 bg-dark-700 rounded-lg shadow-lg mb-6 ${isReversed ? 'rotate-180' : ''}`}>
              {card.imagePath ? (
                <img 
                  src={card.imagePath} 
                  alt={`${card.name} ${isReversed ? '(Reversed)' : ''}`} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-red-400">Image not available</span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl mb-2">{card.name} {isReversed ? '(Reversed)' : ''}</h3>
            <p className="mb-4">{isReversed ? card.meaning_reversed : card.meaning_upright}</p>
            
            {card.keywords && (
              <div className="keywords mb-6">
                <h4 className="text-sm text-gold mb-2">Keywords:</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {card.keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-dark-600 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCardImproved;
