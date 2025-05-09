import React, { useState, useEffect } from 'react';
import AnimatedTarotCard from '../components/tarot/animated-tarot-card';
import { TarotCard } from '../data/tarot-cards';
import { getDailyCard } from '../utils/tarot-utils';

const DailyTarotPage: React.FC = () => {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    const fetchDailyCard = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from API first
        try {
          const response = await fetch('/api/tarot/cards/card-of-the-day');
          
          if (response.ok) {
            const data = await response.json();
            setCard(data.card);
            setIsReversed(data.isReversed);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('API fetch failed, falling back to local data:', apiError);
        }
        
        // Fallback to local data
        import('../data/tarot-cards').then(({ allTarotCards }) => {
          const { card: dailyCard, isReversed: cardIsReversed } = getDailyCard(allTarotCards);
          setCard(dailyCard);
          setIsReversed(cardIsReversed);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error loading daily card:', error);
        setIsLoading(false);
      }
    };
    
    fetchDailyCard();
  }, []);
  
  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    } else {
      setShowDetails(!showDetails);
    }
  };
  
  return (
    <div className="cosmic-container">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="clouds"></div>
      
      <div className="content-container py-12">
        <h1 className="text-3xl md:text-4xl text-center mb-8 text-shadow-lg">
          Your Daily Tarot Card
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            {isLoading ? (
              <div className="w-[140px] h-[240px] bg-primary-900/50 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-gold/70">Loading your card...</span>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <AnimatedTarotCard
                    card={card!}
                    isReversed={isReversed}
                    size="lg"
                    onClick={handleCardClick}
                    className="mx-auto"
                  />
                </div>
                
                {isFlipped && (
                  <div className="mt-6 text-center max-w-lg mx-auto animate-fade-in">
                    <h2 className="text-2xl mb-4">{card?.name}</h2>
                    
                    {showDetails && (
                      <div className="bg-dark/70 backdrop-blur-sm p-6 rounded-lg border border-gold/20">
                        <h3 className="text-xl mb-2">
                          {isReversed ? 'Reversed Meaning' : 'Upright Meaning'}
                        </h3>
                        <p className="mb-4 text-light/90">
                          {isReversed ? card?.meaningReversed : card?.meaningUpright}
                        </p>
                        
                        <div className="mt-6">
                          <h4 className="text-lg mb-2">Keywords</h4>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {card?.keywords.map((keyword, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-primary-800/70 rounded-full text-sm"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="mt-4 px-4 py-2 bg-primary-700 hover:bg-primary-600 rounded-md transition-colors"
                    >
                      {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTarotPage;