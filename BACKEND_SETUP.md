# StudyBuddy AI - Backend Setup Guide

## Overview

The StudyBuddy AI backend is an Express server that proxies requests to the Claude API. This solves CORS issues and keeps your API key secure on the server.

## Architecture

```
Frontend (React) → Backend (Express) → Claude API
     :3000              :5000           Anthropic
```

## Setup Instructions

### 1. Install Dependencies

Already done! The following packages are installed:
- `express` - Web server
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `@anthropic-ai/sdk` - Official Anthropic SDK
- `concurrently` - Run frontend and backend together

### 2. Configure API Key

Make sure your `.env` file has your Claude API key:

```env
REACT_APP_CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here
```

### 3. Run the Application

You have three options:

#### Option 1: Run Everything Together (Recommended)
```bash
npm run dev
```
This starts both the backend server (port 5000) and React app (port 3000).

#### Option 2: Run Separately
```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm start
```

#### Option 3: Frontend Only (Mock Mode)
```bash
npm start
```
Frontend will use mock responses if backend is not running.

## API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```
Returns server status.

### Claude Proxy
```
POST http://localhost:5000/api/claude
Content-Type: application/json

{
  "messages": [...],
  "system": "...",
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096
}
```

## How It Works

1. **Frontend** sends requests to `/api/claude` (proxied to backend)
2. **Backend** receives request, adds API key, calls Claude
3. **Claude API** processes and returns response
4. **Backend** forwards response to frontend
5. **Frontend** displays the result to user

## Benefits

✅ **No CORS Issues** - Backend makes the API call, not the browser
✅ **Secure API Key** - Key stays on the server, never exposed to browser
✅ **Easy Deployment** - Deploy backend to Vercel/Netlify/Heroku
✅ **Error Handling** - Centralized error handling and logging
✅ **Mock Mode Fallback** - Frontend works without backend for development

## Troubleshooting

### "Connection refused" error
- Backend server is not running
- Run `npm run server` or `npm run dev`

### "Invalid API key" error  
- Check `.env` file has correct API key
- Restart backend server after updating `.env`

### Frontend using mock mode
- Backend is not running on port 5000
- Check console for "Using mock mode" warning

### Port 5000 already in use
- Change PORT in backend: `PORT=5001 npm run server`
- Update proxy in `package.json` to match

## Production Deployment

### Deploy Backend (Example: Heroku)
```bash
# Add Procfile
echo "web: node server/index.js" > Procfile

# Deploy
git push heroku main

# Set environment variable
heroku config:set REACT_APP_CLAUDE_API_KEY=your-key
```

### Deploy Frontend (Example: Vercel)
```bash
# Update API endpoint in claudeAPI.js to use production backend URL
# Deploy
vercel deploy
```

## Next Steps

- Add rate limiting
- Add request logging
- Add authentication
- Add caching for repeated queries
- Add usage analytics

---

**Note:** Never commit your `.env` file or expose your API key!
