exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    const API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: errorData.error?.message || 'Unknown error'
        })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: data.content[0].text
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate obituary',
        details: error.message 
      })
    };
  }
};
