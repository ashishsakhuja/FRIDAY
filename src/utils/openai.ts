const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export async function generateResponse(message: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are FRIDAY, an advanced AI assistant like from Iron Man. Be helpful, intelligent, and slightly witty. Keep responses concise and conversational. You have a female personality and should respond as FRIDAY would - professional but with personality.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}