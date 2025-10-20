const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY,
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyBuddy AI Backend Running' });
});

// Claude API proxy endpoint
app.post('/api/claude', async (req, res) => {
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

    // Call Claude API
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
    res.json({
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
        message: 'Invalid API key. Please check your .env file.'
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
    res.status(500).json({
      success: false,
      error: 'UNKNOWN',
      message: error.message || 'Failed to process request'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('=====================================');
  console.log('StudyBuddy AI Backend Server');
  console.log('=====================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Claude API: http://localhost:${PORT}/api/claude`);
  console.log('=====================================');
  
  // Check if API key is configured
  if (!process.env.REACT_APP_CLAUDE_API_KEY) {
    console.warn('WARNING: REACT_APP_CLAUDE_API_KEY not found in .env file!');
  } else {
    console.log('API Key configured: Yes');
  }
});
