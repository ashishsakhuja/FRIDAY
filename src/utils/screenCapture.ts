import html2canvas from 'html2canvas';

export async function captureScreen(fullPage: boolean = false): Promise<string> {
  try {
    // Capture the entire page or just the viewport
    const element = fullPage ? document.documentElement : document.body;
    const canvas = await html2canvas(element, {
      height: fullPage ? document.documentElement.scrollHeight : window.innerHeight,
      width: fullPage ? document.documentElement.scrollWidth : window.innerWidth,
      useCORS: true,
      allowTaint: true,
      scale: 0.3, // Further reduce size for efficiency
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
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

export async function analyzeScreenWithGPT(screenshot: string, userQuery: string, isDynamic: boolean = false): Promise<string> {
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
            content: isDynamic 
              ? `You are FRIDAY, an advanced AI assistant like from Iron Man. You're continuously monitoring the user's screen to provide proactive assistance. Analyze what the user is currently working on and offer helpful suggestions, improvements, or assistance. Be concise, relevant, and only speak up when you have genuinely useful insights. Don't be overly chatty - only provide value-added suggestions.`
              : `You are FRIDAY, an advanced AI assistant like from Iron Man. You can see the user's screen and help them with what they're doing. Be helpful, intelligent, and slightly witty. Analyze the screen content and provide specific, actionable assistance based on what you see. Keep responses concise but informative.`
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
    
    // Immediately clear screenshot reference for garbage collection
    screenshot = '';
    
    return response_text;
  } catch (error) {
    console.error('Screen analysis error:', error);
    throw error;
  }
}