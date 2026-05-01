/**
 * Gemini AI Service
 * Handles communication with the Google Gemini API for election-related chat.
 *
 * WARNING: VITE_ prefixed env vars are exposed in the client bundle.
 * In production, proxy API calls through a backend server to protect API keys.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are ElectionBot, a civic education assistant specializing in elections and democratic processes. 
You MUST:
- Only answer questions related to elections, voting, civic education, and democratic processes.
- If a question is off-topic, politely redirect the user to ask about elections, voting, or democracy.
- Provide accurate, nonpartisan, educational information.
- Reference the US election system as the primary example but acknowledge other democratic systems exist.
- Be concise but thorough.
- Never endorse any political party or candidate.
- Always encourage civic participation.

If the user asks about something unrelated to elections or civic education, respond with a polite message explaining your scope and suggest they ask an election-related question instead.`;

/**
 * Send a message to Gemini API and get a response
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<{text: string, isOffTopic: boolean}>}
 */
export async function sendMessageToGemini(userMessage, conversationHistory = []) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env file.');
  }

  const contents = [
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I am ElectionBot, a civic education assistant. I will only answer questions about elections, voting, and democratic processes. I will be nonpartisan, accurate, and educational.' }],
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return { text, isOffTopic: false };
}
