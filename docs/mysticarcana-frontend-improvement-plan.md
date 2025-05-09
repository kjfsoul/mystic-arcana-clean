# MysticArcana Frontend Improvement Plan

## Current Frontend Architecture

MysticArcana uses a modern React-based frontend with a strong focus on interactive tarot card experiences. The current architecture includes:

- React with TypeScript for component structure
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for data fetching
- Radix UI for accessible components
- Wouter for routing

## Key Frontend Components

### Tarot Card Components
- `animated-tarot-card.tsx` - Core card display with animations
- `daily-card-improved.tsx` - Daily tarot feature
- `tarot-deck.tsx` - Deck management
- `zodiac-spread.tsx` - Zodiac-based tarot spread

### UI Components
- Card-based layouts
- Cosmic-themed backgrounds
- Mystical typography and color schemes

## Identified Frontend Issues

### 1. Daily Card Component Issues
- Broken image path resolution
- Inconsistent loading and error states
- Multiple versions of the same component (`daily-card.tsx`, `daily-card-local.tsx`, `daily-card-improved.tsx`)
- Inadequate error handling for API failures

### 2. UI/UX Inconsistencies
- Inconsistent styling across components
- Mobile responsiveness issues
- Animation performance concerns
- Non-standardized component props

### 3. Technical Debt
- Duplicate logic across components
- Lack of proper TypeScript types
- Inconsistent state management approaches
- Multiple versions of similar components

### 4. Accessibility Issues
- Missing ARIA attributes
- Contrast issues in mystical theme
- Keyboard navigation challenges
- Animation motion sensitivity concerns

## Frontend Improvement Plan

### 1. Daily Card Component Consolidation and Repair

#### Current Structure Issues:
```tsx
// daily-card-improved.tsx (excerpt)
useEffect(() => {
  const loadDailyCard = async () => {
    setIsLoading(true);

    try {
      // Get the daily card
      const { card: dailyCard, isReversed: cardIsReversed } =
        getDailyCard(allTarotCards);

      // Ensure the card has a valid image path
      let imagePath = getTarotCardImagePath(dailyCard);

      // Additional safety check for problematic images
      if (
        dailyCard.id === "07-chariot" ||
        dailyCard.id === "13-death" ||
        dailyCard.id === "16-tower"
      ) {
        console.warn("Using placeholder for known problematic card");
        imagePath = "/images/tarot/placeholders/major-placeholder.svg";
      }

      // Update the card with the verified image path
      const cardWithImage = {
        ...dailyCard,
        imagePath,
      };

      // Set the card and its orientation
      setCard(cardWithImage);
      setIsReversed(cardIsReversed);

      // Reset the flip state
      setIsFlipped(false);
      setShowDetails(false);
    } catch (error) {
      console.error("Error loading daily card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadDailyCard();
}, []);
```

#### Improved Implementation:
```tsx
// Centralized hook for fetching daily card
const useDailyCard = () => {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDailyCard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to fetch from backend API
      const response = await fetch('/api/daily-tarot');
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily card from API');
      }
      
      const data = await response.json();
      const apiCard = data.card;
      
      // Ensure the card has all required fields
      if (!apiCard || !apiCard.id || !apiCard.name) {
        throw new Error('Received invalid card data from API');
      }
      
      // Process and set the card data
      setCard({
        ...apiCard,
        imagePath: getTarotCardImagePath(apiCard)
      });
      
      // Use the API's reversed status or generate randomly
      setIsReversed(data.isReversed ?? Math.random() < 0.5);
    } catch (apiError) {
      console.warn('API fetch failed, falling back to local data:', apiError);
      
      try {
        // Fallback to local data if API fails
        const { card: localCard, isReversed: localIsReversed } = getDailyCard(allTarotCards);
        
        setCard({
          ...localCard,
          imagePath: getTarotCardImagePath(localCard)
        });
        setIsReversed(localIsReversed);
      } catch (fallbackError) {
        console.error('Both API and fallback methods failed:', fallbackError);
        setError(fallbackError instanceof Error ? fallbackError : new Error('Failed to load daily card'));
        setCard(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchDailyCard();
  }, [fetchDailyCard]);

  return { card, isReversed, isLoading, error, refetch: fetchDailyCard };
};

// In the component:
const DailyCardComponent = () => {
  const { card, isReversed, isLoading, error, refetch } = useDailyCard();
  
  // Rest of component using these values...
```

### 2. Standardize Image Path Resolution

#### Current Issues:
```tsx
// In tarot-utils.ts
export function getTarotCardImagePath(card: TarotCard): string {
  const deck = getActiveDeck();
  return deck.cardPathTemplate
    .replace('{deckId}', deck.id)
    .replace('{imageId}', card.imageId)
    .replace('{normalizedName}', card.normalizedName);
}
```

#### Improved Implementation:
```tsx
// Enhanced getTarotCardImagePath with additional error handling
export function getTarotCardImagePath(card: TarotCard): string {
  if (!card) {
    console.error('Attempted to get image path for undefined card');
    return '/images/tarot/placeholders/error-card.svg';
  }
  
  try {
    const deck = getActiveDeck();
    
    // Check if card has the required properties
    if (!card.imageId || !card.normalizedName) {
      console.warn('Card missing required properties for image path:', card);
      
      // Fallback to ID-based path if possible
      if (card.id) {
        return `/images/tarot/decks/${deck.id}/${card.id}.${deck.imageFormat}`;
      }
      
      // Last resort fallback based on arcana
      return card.arcana === 'major' 
        ? '/images/tarot/placeholders/major-placeholder.svg'
        : '/images/tarot/placeholders/minor-placeholder.svg';
    }
    
    // Normal path resolution
    return deck.cardPathTemplate
      .replace('{deckId}', deck.id)
      .replace('{imageId}', card.imageId)
      .replace('{normalizedName}', card.normalizedName);
  } catch (error) {
    console.error('Error resolving card image path:', error);
    return '/images/tarot/placeholders/error-card.svg';
  }
}

// Add a utility to preload card images
export function preloadCardImage(imagePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imagePath;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}
```

### 3. Enhance AnimatedTarotCard Component

#### Current Issues:
```tsx
// In animated-tarot-card.tsx
useEffect(() => {
  // Get the image path from the card
  const cardImagePath = card.imagePath;
  
  // Create a new image to preload
  const img = new Image();
  img.src = cardImagePath;
  
  // Handle successful load
  img.onload = () => {
    setImageSrc(cardImagePath);
    setIsLoaded(true);
  };
  
  // Handle load error
  img.onerror = () => {
    console.error(`Failed to load image: ${cardImagePath}`);
    
    // Try to load a fallback image based on card type
    let fallbackPath = '';
    if (card.arcana === 'major') {
      fallbackPath = `/images/tarot/placeholders/major-placeholder.svg`;
    } else if (card.suit) {
      fallbackPath = `/images/tarot/placeholders/${card.suit}-placeholder.svg`;
    } else {
      fallbackPath = `/images/tarot/placeholders/minor-placeholder.svg`;
    }
    
    setImageSrc(fallbackPath);
    setIsLoaded(true);
  };
}, [card]);
```

#### Improved Implementation:
```tsx
// Enhanced AnimatedTarotCard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from '@/data/tarot-cards';
import { getCardBackPath, preloadCardImage } from '@/utils/tarot-utils';

interface AnimatedTarotCardProps {
  card: TarotCard;
  isReversed?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  autoReveal?: boolean;
  revealDelay?: number;
  onClick?: () => void;
  className?: string;
  showMeaning?: boolean;
  testid?: string; // For testing
}

const AnimatedTarotCard: React.FC<AnimatedTarotCardProps> = ({
  card,
  isReversed = false,
  size = 'md',
  autoReveal = false,
  revealDelay = 1500,
  onClick,
  className = '',
  showMeaning = false,
  testid = 'tarot-card',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isImageError, setIsImageError] = useState(false);
  
  // Card dimensions based on size
  const dimensions = {
    sm: { width: 100, height: 170 },
    md: { width: 140, height: 240 },
    lg: { width: 180, height: 300 },
    xl: { width: 220, height: 370 },
  };
  
  const { width, height } = dimensions[size];
  
  // Load the card image with better error handling
  useEffect(() => {
    let isMounted = true;
    
    const loadCardImage = async () => {
      if (!card) return;
      
      try {
        setIsLoaded(false);
        setIsImageError(false);
        
        // Get primary image path
        const primaryPath = card.imagePath;
        
        // Try to load the image
        const imageLoaded = await preloadCardImage(primaryPath);
        
        if (!isMounted) return;
        
        if (imageLoaded) {
          setImageSrc(primaryPath);
          setIsLoaded(true);
        } else {
          // Failed to load primary image, try fallback
          setIsImageError(true);
          
          // Determine fallback path based on card properties
          let fallbackPath = '';
          if (card.arcana === 'major') {
            fallbackPath = `/images/tarot/placeholders/major-placeholder.svg`;
          } else if (card.suit) {
            fallbackPath = `/images/tarot/placeholders/${card.suit}-placeholder.svg`;
          } else {
            fallbackPath = `/images/tarot/placeholders/minor-placeholder.svg`;
          }
          
          // Try to load fallback
          const fallbackLoaded = await preloadCardImage(fallbackPath);
          
          if (!isMounted) return;
          
          if (fallbackLoaded) {
            setImageSrc(fallbackPath);
          } else {
            // Ultimate fallback - generic error card
            setImageSrc('/images/tarot/placeholders/error-card.svg');
          }
          
          setIsLoaded(true);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading card image:', error);
        setIsImageError(true);
        setImageSrc('/images/tarot/placeholders/error-card.svg');
        setIsLoaded(true);
      }
    };
    
    loadCardImage();
    
    return () => {
      isMounted = false;
    };
  }, [card]);
  
  // Auto-reveal logic
  useEffect(() => {
    if (autoReveal && !isFlipped) {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, revealDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoReveal, isFlipped, revealDelay]);
  
  // Handle card click with debouncing to prevent double-flips
  const [isClickable, setIsClickable] = useState(true);
  
  const handleClick = () => {
    if (!isClickable) return;
    
    setIsClickable(false);
    setIsFlipped(!isFlipped);
    
    if (onClick) onClick();
    
    // Reset clickable after animation completes
    setTimeout(() => setIsClickable(true), 800);
  };
  
  // Get card meaning based on orientation
  const cardMeaning = isReversed ? card.meaningReversed : card.meaningUpright;
  
  // Add subtle random animation variants for more mystical feel
  const getRandomAnimationVariant = () => {
    const variants = [
      { scale: [1, 1.03, 1], filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'] },
      { boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 15px rgba(255,215,0,0.5)', '0 0 0px rgba(255,215,0,0)'] },
      { border: ['1px solid rgba(255,215,0,0.3)', '1px solid rgba(255,215,0,0.8)', '1px solid rgba(255,215,0,0.3)'] },
    ];
    
    return variants[Math.floor(Math.random() * variants.length)];
  };
  
  const animationVariant = getRandomAnimationVariant();
  
  return (
    <div 
      className={`relative perspective-1000 ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      style={{ width, height }}
      onClick={isClickable ? handleClick : undefined}
      data-testid={testid}
      role="button"
      aria-label={`Tarot card: ${card?.name || 'Loading...'}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isClickable) handleClick();
        }
      }}
    >
      {/* Subtle ambient animation */}
      <AnimatePresence>
        {isFlipped && !isImageError && (
          <motion.div
            className="absolute -inset-2 rounded-lg z-0 opacity-50"
            animate={animationVariant}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
      
      {/* Card flip container */}
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
      >
        {/* Card Back */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-lg shadow-lg border border-gold/30"
          style={{ 
            backgroundImage: `url(${getCardBackPath()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: isFlipped ? -1 : 1,
          }}
          aria-hidden={isFlipped}
        />
        
        {/* Card Front */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-lg shadow-lg border border-gold/30 overflow-hidden rotate-y-180"
          style={{ zIndex: isFlipped ? 1 : -1 }}
          aria-hidden={!isFlipped}
        >
          {isLoaded ? (
            <div className="relative w-full h-full">
              {/* Card Image */}
              <div 
                className="w-full h-full bg-primary-10"
                style={{
                  backgroundImage: `url(${imageSrc})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transform: isReversed ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                aria-label={`${card?.name || 'Tarot card'} ${isReversed ? 'reversed' : 'upright'}`}
              />
              
              {/* Card Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-sm p-2 text-center">
                <h3 className="text-gold font-heading text-sm md:text-base truncate">
                  {card?.name || 'Unknown Card'}
                </h3>
                {showMeaning && cardMeaning && (
                  <p className="text-light/80 text-xs mt-1 line-clamp-2">
                    {cardMeaning}
                  </p>
                )}
              </div>
              
              {/* Reversed Indicator */}
              {isReversed && (
                <div className="absolute top-2 right-2 bg-warning/80 text-dark text-xs px-1.5 py-0.5 rounded-sm font-medium">
                  Reversed
                </div>
              )}
              
              {/* Error Indicator (if using fallback but not ultimate error) */}
              {isImageError && imageSrc !== '/images/tarot/placeholders/error-card.svg' && (
                <div className="absolute top-2 left-2 bg-warning/80 text-dark text-xs px-1.5 py-0.5 rounded-sm font-medium">
                  Alt View
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-20" aria-label="Loading tarot card">
              <div className="animate-spin w-8 h-8 border-2 border-gold rounded-full border-t-transparent" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedTarotCard;
```

### 4. Standardize Tarot Card Data Structure

```typescript
// tarot-card.types.ts
export interface TarotCardBase {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  meaningUpright: string;
  meaningReversed: string;
  keywords: string[];
}

export interface TarotCardWithImage extends TarotCardBase {
  imageId: string;
  normalizedName: string;
  imagePath: string;
}

export interface TarotCardWithMetadata extends TarotCardWithImage {
  element?: string;
  zodiacSign?: string;
  planet?: string;
  numerology?: number | string;
  affirmation?: string;
  crystals?: string[];
}

// Define a type guard to check if a card has a complete image path
export function hasImagePath(card: TarotCardBase): card is TarotCardWithImage {
  return 'imagePath' in card && typeof (card as TarotCardWithImage).imagePath === 'string';
}

// Define a function to ensure a card has a proper image path
export function ensureCardImagePath(card: TarotCardBase): TarotCardWithImage {
  if (hasImagePath(card)) {
    return card;
  }
  
  // If card doesn't have an image path, try to generate one
  const imageId = ('imageId' in card) ? 
    (card as Partial<TarotCardWithImage>).imageId || '' : 
    '';
    
  const normalizedName = ('normalizedName' in card) ? 
    (card as Partial<TarotCardWithImage>).normalizedName || card.id.toLowerCase().replace(/\s+/g, '-') : 
    card.id.toLowerCase().replace(/\s+/g, '-');
  
  return {
    ...card,
    imageId,
    normalizedName,
    imagePath: `/images/tarot/decks/rider-waite/${card.id}.webp`
  };
}
```

### 5. Enhanced Error States and UI Fallbacks

```tsx
// Error Boundary Component
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!);
      }
      
      return this.props.fallback || (
        <div className="p-4 border border-warning/50 rounded-lg bg-warning/10 text-center">
          <h3 className="text-warning mb-2">The mystical energies are currently disrupted</h3>
          <p className="text-light/80 mb-4">
            We're working to restore the cosmic balance.
          </p>
          <button 
            className="px-4 py-2 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/50 rounded-md"
            onClick={() => window.location.reload()}
          >
            Realign Energies
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Usage in components
<ErrorBoundary>
  <DailyCardImproved />
</ErrorBoundary>
```

### 6. Global Consistency for Component Props

```tsx
// ui/types.ts
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Variant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
export type ColorScheme = 'light' | 'dark' | 'gold' | 'cosmic' | 'warning' | 'success';

export interface BaseComponentProps {
  className?: string;
  testid?: string;
  children?: React.ReactNode;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  ariaLabel?: string;
}

export interface CardComponentProps extends BaseComponentProps {
  size?: Size;
  variant?: Variant;
  colorScheme?: ColorScheme;
  hoverEffect?: boolean;
  bordered?: boolean;
}

// Then in components:
const MyCard: React.FC<CardComponentProps> = ({
  size = 'md',
  variant = 'default',
  colorScheme = 'dark',
  hoverEffect = true,
  bordered = true,
  className = '',
  testid = 'card',
  children
}) => {
  // Component implementation
};
```

### 7. Responsive Layout Improvements

```tsx
// Layout.tsx
import React from 'react';
import { Outlet } from 'wouter';
import ErrorBoundary from './ErrorBoundary';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark text-light">
      <header className="p-4 md:p-6 border-b border-gold/20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-heading text-gold">
            Mystic Arcana
          </h1>
          
          <nav className={isMobile ? 'hidden' : 'flex space-x-6'}>
            {/* Navigation items */}
          </nav>
          
          {isMobile && (
            <button className="p-2 text-gold">
              {/* Mobile menu button */}
            </button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        <ErrorBoundary>
          {children || <Outlet />}
        </ErrorBoundary>
      </main>
      
      <footer className="mt-auto p-4 md:p-6 border-t border-gold/20 text-center text-sm">
        <div className="container mx-auto">
          <p className="text-light/60">
            Mystic Arcana &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
```

### 8. Custom Hooks for Common Operations

```tsx
// hooks/useTarotCard.ts
import { useState, useEffect } from 'react';
import { TarotCard, hasImagePath, ensureCardImagePath } from '@/types/tarot-card.types';
import { preloadCardImage } from '@/utils/tarot-utils';

interface UseTarotCardOptions {
  preloadImage?: boolean;
  generateReversed?: boolean;
  autoReveal?: boolean;
  revealDelay?: number;
}

export function useTarotCard(
  card: TarotCard | null, 
  options: UseTarotCardOptions = {}
) {
  const { 
    preloadImage = true, 
    generateReversed = true,
    autoReveal = false,
    revealDelay = 1500
  } = options;
  
  const [processedCard, setProcessedCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Process the card when it changes
  useEffect(() => {
    if (!card) {
      setProcessedCard(null);
      setIsLoading(false);
      return;
    }
    
    try {
      // Ensure the card has an image path
      const cardWithImage = hasImagePath(card) ? card : ensureCardImagePath(card);
      
      // Generate reversed status if needed
      if (generateReversed) {
        // Use a deterministic approach based on card ID to maintain consistency
        const hash = cardWithImage.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        // 22% chance of reversed (consistent with same card)
        const reversed = Math.abs(hash % 100) < 22;
        setIsReversed(reversed);
      }
      
      setProcessedCard(cardWithImage);
      
      // Preload the image if requested
      if (preloadImage && cardWithImage.imagePath) {
        setIsImageLoaded(false);
        
        preloadCardImage(cardWithImage.imagePath)
          .then((success) => {
            setIsImageLoaded(success);
          })
          .catch((err) => {
            console.error('Failed to preload card image:', err);
            setIsImageLoaded(false);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error processing tarot card:', err);
      setError(err instanceof Error ? err : new Error('Failed to process card'));
      setIsLoading(false);
    }
  }, [card, preloadImage, generateReversed]);
  
  // Handle auto-reveal if enabled
  useEffect(() => {
    if (autoReveal && !isRevealed && !isLoading && processedCard) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, revealDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoReveal, isRevealed, isLoading, processedCard, revealDelay]);
  
  // Function to manually reveal the card
  const revealCard = () => {
    setIsRevealed(true);
  };
  
  // Function to reset the card
  const resetCard = () => {
    setIsRevealed(false);
  };
  
  return {
    card: processedCard,
    isReversed,
    isLoading,
    isImageLoaded,
    isRevealed,
    error,
    revealCard,
    resetCard
  };
}
```

## Implementation Strategy

1. **Initial Phase (Days 1-2)**
   - Create a branch for frontend improvements
   - Fix the daily card component with proper error handling
   - Standardize tarot card data structure
   - Add error boundaries to critical components

2. **Middle Phase (Days 3-4)**
   - Enhance AnimatedTarotCard component
   - Improve image path resolution
   - Create custom hooks for common operations
   - Add responsive layout improvements

3. **Final Phase (Days 5-6)**
   - Standardize component props
   - Implement UI consistency improvements
   - Add accessibility enhancements
   - Conduct testing and optimization

## Conclusion

By implementing these frontend improvements, MysticArcana will gain:

1. **Improved Stability** - Better error handling, fallbacks, and data validation
2. **Enhanced User Experience** - More consistent UI, smoother animations, better accessibility
3. **Reduced Technical Debt** - Standardized components, proper TypeScript types, consistent patterns
4. **Better Mobile Experience** - Responsive layouts, optimized for different device sizes
5. **Maintainability** - Custom hooks, standardized props, and consistent patterns for easier future development

These improvements will significantly enhance the quality of the MysticArcana application while maintaining its mystical aesthetic and focusing on providing an engaging tarot card experience.