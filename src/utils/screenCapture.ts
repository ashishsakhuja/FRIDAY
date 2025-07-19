import html2canvas from 'html2canvas';

export async function captureScreen(): Promise<string> {
  try {
    const canvas = await html2canvas(document.body, {
      height: window.innerHeight,
      width: window.innerWidth,
      useCORS: true,
      allowTaint: true,
      scale: 0.5, // Reduce size for API efficiency
    });
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Clean up canvas to free memory
    canvas.width = 0;
    canvas.height = 0;
    
    return dataUrl;
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
    const response_text = data.choices[0]?.message?.content || 'I apologize, but I encountered an error analyzing your screen.';
    
    // Clear the screenshot from memory after processing
    // The screenshot parameter will be garbage collected
    
    return response_text;
  } catch (error) {
    console.error('Screen analysis error:', error);
    throw error;
  }
}