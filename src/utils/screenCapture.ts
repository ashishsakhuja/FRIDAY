import html2canvas from 'html2canvas';

export async function captureScreen(): Promise<string> {
  try {
    // For web applications, we can only capture the current page
    // Note: Full screen capture requires browser extensions or desktop apps
    const canvas = await html2canvas(document.body, {
      height: window.innerHeight,
      width: window.innerWidth,
      useCORS: true,
      allowTaint: true,
      scale: 0.5, // Reduce size for API efficiency
    });
    
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Screen capture failed:', error);
    throw new Error('Unable to capture screen');
  }
}

export async function analyzeScreenWithGPT(screenshot: string, userQuery: string): Promise<string> {
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const API_URL = 'https://api.openai.com/v1/chat/completions';

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
            content: `You are FRIDAY, an advanced AI assistant like from Iron Man. You can see the user's screen and help them with what they're doing. Be helpful, intelligent, and slightly witty. Analyze the screen content and provide specific, actionable assistance based on what you see. Keep responses concise but informative.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userQuery
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshot
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an error analyzing your screen.';
  } catch (error) {
    console.error('Screen analysis error:', error);
    throw error;
  }
}