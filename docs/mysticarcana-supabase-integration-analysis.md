# MysticArcana Supabase Integration Analysis

## Current Supabase Implementation

MysticArcana uses Supabase as its primary backend service for:
1. User authentication and authorization
2. Database storage for tarot cards, readings, and user data
3. Storage of premium content and user history

## Identified Issues

### 1. Environment Variable Inconsistencies

The application inconsistently references Supabase environment variables:

```javascript
// In Netlify Functions:
const supabaseUrl = process.env.VITE_SUPABASE_URL; // INCORRECT - using frontend prefix
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// In frontend components:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // CORRECT
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // CORRECT
```

This inconsistency causes connection failures in serverless functions.

### 2. Client Initialization Issues

There are multiple Supabase client initializations throughout the codebase with inconsistent approaches:

```javascript
// In some files:
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(supabaseUrl, supabaseKey);

// In other files:
import { supabaseClient } from "../lib/supabase";
```

This leads to:
- Potential security issues with exposed service roles
- Inconsistent authentication state
- Duplicate client instances

### 3. Missing Error Handling

Most Supabase queries lack proper error handling:

```javascript
// Example of poor error handling:
const { data, error } = await supabase
  .from('tarot_cards')
  .select('*')
  .order('RANDOM()')
  .limit(1)
  .single();

// Error is checked but not properly handled
if (error) throw error;
```

Without proper fallbacks, this leads to crashed components and white screens.

### 4. Authentication/Authorization Flow Issues

The authentication flow has several weak points:
- Inconsistent checking of user roles for premium features
- No clear separation between public and authenticated endpoints
- Missing session refresh logic
- Incomplete error states for unauthorized access

### 5. Daily Tarot Card Specific Issues

In the `daily-tarot.js` Netlify function:
- Service role key might be missing from environment variables
- Inconsistent environment variable references
- Missing error handling for database connection issues
- Potential type mismatches between card data from Supabase and frontend expectations

## Recommended Solutions

### 1. Standardize Environment Variables

```javascript
// For Netlify Functions:
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For Frontend components:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

Ensure these variables are correctly set in:
- `.env` file for local development
- Netlify environment variables for production

### 2. Centralize Supabase Client Creation

```javascript
// lib/supabase.ts - Frontend client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// lib/supabase-admin.ts - Server client (for Netlify Functions)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### 3. Implement Proper Error Handling

For Netlify Functions:
```javascript
try {
  const { data: card, error } = await supabaseAdmin
    .from('tarot_cards')
    .select('*')
    .order('RANDOM()')
    .limit(1)
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to retrieve tarot card',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }

  // Proceed with card data...
} catch (err) {
  console.error('Server error:', err);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Internal server error' }),
  };
}
```

For Frontend components:
```typescript
const fetchDailyCard = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/daily-tarot');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch daily card');
    }
    
    const data = await response.json();
    setCard(data.card);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An unknown error occurred');
    console.error('Error fetching daily card:', err);
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Fix Authentication Flow

```typescript
// Custom hook for auth state
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user has premium access
          try {
            const { data, error } = await supabaseClient
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            setIsPremium(!!data && data.status === 'active');
          } catch (err) {
            console.error('Error checking premium status:', err);
            setIsPremium(false);
          }
        } else {
          setIsPremium(false);
        }
        
        setIsLoading(false);
      }
    );

    // Initial session check
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, isPremium, isLoading, error };
};
```

### 5. Fix Daily Tarot Card Implementation

In `daily-tarot.js`:
```javascript
// Properly handle environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables for Supabase connection');
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Server configuration error' }),
  };
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event, context) => {
  try {
    // Parse request body if it exists
    const body = event.body ? JSON.parse(event.body) : {};
    const { user_id } = body;

    // Get random tarot card from database with proper error handling
    const { data: card, error: cardError } = await supabase
      .from('tarot_cards')
      .select('*')
      .order('RANDOM()')
      .limit(1)
      .single();

    if (cardError) {
      console.error('Supabase error fetching card:', cardError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to retrieve tarot card',
          details: process.env.NODE_ENV === 'development' ? cardError.message : undefined
        }),
      };
    }

    // Ensure card has expected format for frontend
    const processedCard = {
      id: card.id,
      name: card.name,
      arcana: card.arcana,
      suit: card.suit,
      meaningUpright: card.meaning_upright || card.meaningUpright,
      meaningReversed: card.meaning_reversed || card.meaningReversed,
      keywords: card.keywords || [],
      imagePath: `/images/tarot/decks/rider-waite/${card.id}.webp`,
      // Add other necessary fields
    };

    // If user_id is provided, save this reading to user history
    if (user_id) {
      const { error: readingError } = await supabase.from('user_readings').insert({
        user_id,
        card_id: card.id,
        reading_type: 'daily',
        created_at: new Date().toISOString(),
      });

      if (readingError) {
        console.error('Error saving reading history:', readingError);
        // Continue despite history error
      }
    }

    // Return the processed card data
    return {
      statusCode: 200,
      body: JSON.stringify({
        card: processedCard,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Error in daily-tarot function:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get daily tarot card' }),
    };
  }
};
```

## Implementation Steps

1. **Audit Environment Variables**
   - Check all Supabase references in the codebase
   - Update Netlify environment variables
   - Create a standardized .env file

2. **Centralize Supabase Clients**
   - Create proper client files for frontend and backend
   - Update all imports to use standardized clients

3. **Fix Daily Tarot Function**
   - Update environment variable references
   - Add proper error handling
   - Ensure consistent data format

4. **Enhance Error Handling**
   - Add try/catch blocks to all Supabase operations
   - Create meaningful error messages
   - Implement UI fallbacks for error states

5. **Test and Validate**
   - Test authentication flow
   - Verify daily card functionality
   - Ensure premium features are properly protected

## Conclusion

The Supabase integration issues are primarily caused by inconsistent environment variable usage, multiple client initializations, and inadequate error handling. By standardizing the approach to Supabase connections and properly handling errors, the application can achieve a more stable and reliable user experience.

The daily tarot card feature, which is critical for the MVP, can be fixed by ensuring proper environment configuration and implementing robust error handling in both the Netlify function and frontend components.