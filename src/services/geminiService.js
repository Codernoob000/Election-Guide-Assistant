import { GEMINI_API_URL, GEMINI_MODEL } from '../utils/constants';

/**
 * @description Sends a message to the Gemini API and returns the AI response
 * @param {string} userMessage - The new user message to send
 * @param {Array} [history=[]] - The conversation history array
 * @returns {Promise<{text: string, isOffTopic: boolean}>} The assistant's response object
 */
export async function sendMessageToGemini(userMessage, history = []) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    if (import.meta.env.DEV) {
      console.error('[ElectionBot] Missing VITE_GEMINI_API_KEY'); // eslint-disable-line no-console
    }
    throw new Error('Gemini API key not configured');
  }

  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `You are ElectionBot, a neutral nonpartisan civic education assistant. 
        Your sole purpose is to help users understand election processes, voter registration, 
        election timelines, ballot procedures, and democratic participation worldwide. 
        Do not endorse any political party, candidate, or ideology. 
        Respond in the same language the user writes in. 
        If asked anything unrelated to elections, politely redirect. 
        Always note that procedures vary by country and state. 
        Keep responses concise, clear, and friendly.`,
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'I understand. I am ElectionBot, your neutral civic education assistant. How can I help you today?',
        },
      ],
    },
    ...history.map(msg => ({
      // Gemini uses 'model' role for assistant messages, not 'assistant' or 'bot'
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Gemini API error: ${response.status}`;
      if (import.meta.env.DEV) {
        console.error('[ElectionBot] API error:', errorMessage); // eslint-disable-line no-console
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      return { text: '', isOffTopic: false };
    }

    const responseText = data.candidates[0].content.parts[0].text;
    return { text: responseText, isOffTopic: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[ElectionBot] sendMessage error:', error); // eslint-disable-line no-console
    }
    throw error;
  }
}

