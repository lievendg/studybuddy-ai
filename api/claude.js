const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.REACT_APP_CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }
  return new Anthropic({ apiKey });
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system, model, max_tokens } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    console.log('Received Claude API request:', {
      messageCount: messages.length,
      systemLength: system?.length || 0,
      model: model || 'default'
    });

    // Initialize client and call Claude API
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: max_tokens || 4096,
      system: system,
      messages: messages
    });

    console.log('Claude API response received:', {
      contentLength: response.content[0]?.text?.length || 0,
      usage: response.usage
    });

    // Return response
    return res.status(200).json({
      success: true,
      message: response.content[0].text,
      usage: response.usage
    });

  } catch (error) {
    console.error('Claude API Error:', error);

    // Handle specific error types
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'API_KEY_INVALID',
        message: 'Invalid API key. Please check your environment variables.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please wait a moment.'
      });
    }

    if (error.status === 529) {
      return res.status(529).json({
        success: false,
        error: 'OVERLOADED',
        message: 'Claude is currently overloaded. Please try again.'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'UNKNOWN',
      message: error.message || 'Failed to process request'
    });
  }
};
