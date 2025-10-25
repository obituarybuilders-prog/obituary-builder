const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // Get API key from environment variable (secure!)
    const API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!API_KEY) {
      console.error('ANTHROPIC_API_KEY environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Call Claude API
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
      console.error('Claude API Error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `API request failed: ${errorData.error?.message || 'Unknown error'}` 
        })
      };
    }

    const data = await response.json();

    // Return the generated text
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
    console.error('Error in generate-obituary function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate obituary',
        details: error.message 
      })
    };
  }
};
