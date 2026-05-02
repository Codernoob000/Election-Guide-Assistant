export async function sendMessage(history, userMessage) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!API_KEY) {
    console.error('[ElectionBot] Missing VITE_GEMINI_API_KEY');
    return 'Configuration error: API key not found. Please contact support.';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  const body = {
    system_instruction: {
      parts: [{
        text: `You are ElectionBot, a neutral nonpartisan civic education assistant. 
        Your sole purpose is to help users understand election processes, voter registration, 
        election timelines, ballot procedures, and democratic participation worldwide. 
        Do not endorse any political party, candidate, or ideology. 
        Respond in the same language the user writes in. 
        If asked anything unrelated to elections, politely redirect. 
        Always note that procedures vary by country and state. 
        Keep responses concise, clear, and friendly.`
      }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ElectionBot] API error:', errorData);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from API');
    }

    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('[ElectionBot] sendMessage error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}
