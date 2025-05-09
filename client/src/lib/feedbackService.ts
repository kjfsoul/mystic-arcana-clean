/**
 * Feedback Service
 * 
 * Handles submitting user feedback for tarot readings
 */

interface FeedbackPayload {
  cardId: string;
  choice: string;
  userId?: string;
  readingType?: string;
}

interface FeedbackResponse {
  success: boolean;
  message: string;
}

/**
 * Saves user feedback about a tarot reading to the API
 * @param payload The feedback data to submit
 * @returns Promise with the API response
 */
export const saveFeedbackToApi = async (payload: FeedbackPayload): Promise<FeedbackResponse> => {
  try {
    const response = await fetch('/.netlify/functions/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        readingType: payload.readingType || 'daily',
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to submit feedback: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};