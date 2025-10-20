# 📱 Vercel Deployment Guide - StudyBuddy AI

This guide will help you deploy StudyBuddy AI to Vercel and make it accessible on mobile devices.

---

## 🚀 Quick Deploy (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### Step 3: Deploy

From the project root directory:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time) or Yes (redeployment)
- **What's your project's name?** → studybuddy-ai (or your choice)
- **In which directory is your code located?** → ./ (press Enter)
- **Want to modify settings?** → No (press Enter)

### Step 4: Configure Environment Variables

After deployment, add your environment variables:

```bash
# Add Claude API Key
vercel env add REACT_APP_CLAUDE_API_KEY

# Or alternative name
vercel env add ANTHROPIC_API_KEY

# Add Supabase URL (if using Supabase)
vercel env add REACT_APP_SUPABASE_URL

# Add Supabase Anon Key (if using Supabase)
vercel env add REACT_APP_SUPABASE_ANON_KEY
```

For each command:
1. Paste the actual value when prompted
2. Select **Production** when asked which environment
3. Press Enter to confirm

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

Your app will be live at: `https://studybuddy-ai.vercel.app` (or your custom domain)

---

## 🌐 Using Vercel Dashboard (Alternative)

### 1. Push to GitHub

First, ensure your code is on GitHub:

```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/studybuddy-ai.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3. Add Environment Variables

In the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `REACT_APP_CLAUDE_API_KEY` | Your Claude API key | Production |
| `ANTHROPIC_API_KEY` | Your Claude API key (backup) | Production |
| `REACT_APP_SUPABASE_URL` | Your Supabase URL | Production |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key | Production |

3. Click **Save**

### 4. Deploy

Click **"Deploy"** and wait for the build to complete.

---

## 📱 Mobile Access

Once deployed, your app will be accessible on mobile:

### iOS (Safari/Chrome)
1. Open the Vercel URL in Safari
2. Tap the **Share** button
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "StudyBuddy AI"
5. Tap **Add**

The app will now appear on your home screen as a PWA!

### Android (Chrome)
1. Open the Vercel URL in Chrome
2. Tap the **menu** (three dots)
3. Tap **"Add to Home Screen"**
4. Name it "StudyBuddy AI"
5. Tap **Add**

The app will now appear on your home screen as a PWA!

---

## 🔧 Configuration Files

The following files have been created for Vercel deployment:

### `vercel.json`
Main configuration file for Vercel deployment settings.

### `api/claude.js`
Serverless function that handles Claude API requests.

### `api/health.js`
Health check endpoint to verify the API is running.

### `.vercelignore`
Specifies which files to exclude from deployment.

---

## 🧪 Testing Your Deployment

### 1. Test Health Endpoint

```bash
curl https://YOUR_VERCEL_URL/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "StudyBuddy AI Backend Running on Vercel",
  "timestamp": "2025-10-19T..."
}
```

### 2. Test in Browser

Visit your Vercel URL and:
1. Upload a PDF
2. Try asking a question in Learn mode
3. Test Quiz mode
4. Check if authentication works (if using Supabase)

### 3. Test on Mobile

1. Open the URL on your phone
2. Add to home screen
3. Test the PWA functionality
4. Verify all features work properly

---

## 🔐 Security Best Practices

### 1. Never Commit Secrets

Ensure `.env` is in `.gitignore`:

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. Use Environment Variables

All sensitive data should be stored in Vercel environment variables:
- API keys
- Database credentials
- Secret tokens

### 3. Enable CORS Properly

The serverless functions already include CORS headers. If you need to restrict origins:

In `api/claude.js`, change:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

To:
```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://YOUR_VERCEL_URL');
```

---

## 📊 Monitoring & Analytics

### View Deployment Logs

```bash
vercel logs
```

### View Function Logs

In Vercel Dashboard:
1. Go to your project
2. Click **"Deployments"**
3. Select a deployment
4. Click **"Functions"** tab
5. View logs for `/api/claude` and `/api/health`

### Monitor Usage

1. Go to **Settings** → **Usage**
2. Monitor:
   - Function executions
   - Bandwidth usage
   - Build minutes

---

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

To disable auto-deploy:
1. Go to **Settings** → **Git**
2. Configure deployment branches

---

## 🐛 Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs --follow
```

**Common issues:**
- Missing dependencies in `package.json`
- Environment variables not set
- Build timeout (increase in settings)

### API Returns 500 Error

**Check function logs in Vercel dashboard**

Common causes:
- Missing API key environment variable
- Invalid API key
- CORS issues

### App Doesn't Load on Mobile

**Check:**
1. Is the deployment successful?
2. Are static files being served?
3. Check browser console for errors
4. Verify PWA manifest is accessible

### Supabase Connection Issues

**Verify:**
1. Supabase URL is correct
2. Anon key is correct
3. RLS policies allow public access where needed
4. CORS is configured in Supabase

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `studybuddy.ai`)
4. Follow DNS configuration instructions

### Configure DNS

Add these records to your DNS provider:

**For root domain (studybuddy.ai):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 💡 Performance Tips

### 1. Optimize Images
All images should be optimized before deployment.

### 2. Use Environment-Specific Builds

In `vercel.json`, you can specify different builds for different environments.

### 3. Enable Edge Caching

Vercel automatically caches static assets at the edge for better performance.

### 4. Monitor Bundle Size

```bash
npm run build
```

Check the build output for bundle size warnings.

---

## 🆘 Need Help?

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Report issues in your repository
- **Community**: Vercel Discord server

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] API endpoints tested
- [ ] Mobile PWA tested on iOS and Android
- [ ] Supabase connection working (if applicable)
- [ ] PDF upload working
- [ ] All modes (Learn, Review, Quiz) functional
- [ ] Authentication working (if applicable)
- [ ] Custom domain configured (optional)
- [ ] Analytics/monitoring set up
- [ ] Error tracking configured

---

## 🎉 You're Live!

Share your app:
- **URL**: `https://studybuddy-ai.vercel.app`
- **QR Code**: Generate one in Vercel dashboard under **Domains**

Your StudyBuddy AI is now accessible on any device, anywhere! 🚀
