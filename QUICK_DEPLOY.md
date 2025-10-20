# ⚡ Quick Deploy to Vercel - 5 Minutes

## Prerequisites
- Vercel account (free): https://vercel.com/signup
- GitHub account (if using Git method)
- Claude API key from Anthropic
- Supabase project (optional, for auth/storage)

---

## 🚀 Method 1: CLI Deploy (Fastest)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

Press Enter for all prompts (accepts defaults).

### 4. Add Environment Variables
```bash
vercel env add REACT_APP_CLAUDE_API_KEY
# Paste your API key when prompted
# Select: Production
```

Repeat for other variables:
```bash
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
```

### 5. Deploy to Production
```bash
vercel --prod
```

**Done! 🎉** Your app is live at the URL shown.

---

## 🌐 Method 2: GitHub + Dashboard (Easiest)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Deploy to Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/studybuddy-ai.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your **studybuddy-ai** repo
4. Click **"Import"**

### 3. Configure Build
- Framework: **Create React App** (auto-detected)
- Build Command: `npm run build`
- Output Directory: `build`
- Click **"Deploy"**

### 4. Add Environment Variables
While deploying or after:
1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - `REACT_APP_CLAUDE_API_KEY` → Your API key
   - `REACT_APP_SUPABASE_URL` → Your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` → Your Supabase key

### 5. Redeploy
1. Go to **Deployments**
2. Click **"Redeploy"** on the latest deployment

**Done! 🎉** Your app is live!

---

## 📱 Add to Mobile Home Screen

### iOS (Safari)
1. Open your Vercel URL in Safari
2. Tap **Share** (box with arrow)
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"**

### Android (Chrome)
1. Open your Vercel URL in Chrome
2. Tap **Menu** (⋮)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**

Now it's a full-screen app! ✨

---

## ✅ Quick Test

Visit your deployment URL and test:
1. Upload a PDF ✓
2. Ask a question in Learn mode ✓
3. Try Quiz mode ✓
4. Check grading levels ✓

---

## 🆘 Troubleshooting

### Build Failed?
- Check Vercel logs: `vercel logs`
- Ensure all dependencies in `package.json`

### API Not Working?
- Verify environment variables are set
- Check `/api/health` endpoint
- Review function logs in Vercel dashboard

### App Won't Load?
- Clear browser cache
- Check browser console for errors
- Verify deployment is "Ready"

---

## 🎯 What You Get

✅ **Live URL**: https://studybuddy-ai-XXXXX.vercel.app
✅ **HTTPS**: Automatic SSL certificate
✅ **CDN**: Global edge network
✅ **Mobile PWA**: Works offline
✅ **Auto-deploy**: Pushes to GitHub auto-deploy
✅ **Serverless**: Claude API runs on Vercel Functions
✅ **Free tier**: Good for development and moderate use

---

## 📊 Vercel Free Tier Limits

- **Bandwidth**: 100GB/month
- **Function Executions**: 100GB-hours
- **Build Minutes**: 6000 minutes/month
- **Deployments**: Unlimited

Perfect for StudyBuddy AI! 🎓

---

Need detailed instructions? See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
