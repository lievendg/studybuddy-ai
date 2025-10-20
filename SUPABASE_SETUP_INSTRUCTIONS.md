# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create a new account (or sign in with GitHub)
4. Click "New Project"
5. Fill in:
   - **Name**: StudyBuddy AI
   - **Database Password**: (generate a strong password - SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (sufficient for MVP)
6. Click "Create new project"
7. Wait 2-3 minutes for project to provision

## Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these two values:

```
Project URL: https://[your-project-id].supabase.co
anon/public key: eyJhbGc....[long string]
```

## Step 3: Add Credentials to .env File

Open your `.env` file and add these lines:

```env
# Keep your existing Claude API key
REACT_APP_CLAUDE_API_KEY=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

# Add these Supabase credentials
REACT_APP_SUPABASE_URL=https://[your-project-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc....[your-anon-key]
```

**IMPORTANT**: Replace the placeholder values with your actual credentials!

## Step 4: Set Up Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (in sidebar)
2. Click **New Query**
3. Copy and paste the SQL from `supabase-schema.sql` (I'll create this file for you)
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 5: Set Up Storage

1. Go to **Storage** in the Supabase sidebar
2. Click **Create a new bucket**
3. Fill in:
   - **Name**: `study-materials`
   - **Public bucket**: Toggle OFF (keep private)
   - **File size limit**: 50 MB
4. Click **Create bucket**

## Step 6: Configure Storage Policies

1. Click on the `study-materials` bucket you just created
2. Go to **Policies** tab
3. Click **New Policy**

### Create 4 Policies:

**Policy 1: Allow authenticated users to INSERT (upload)**
1. Click **New Policy** → **For full customization**
2. Fill in:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: Check ✅ **INSERT**
   - **Policy definition**: Paste this:
   ```sql
   (bucket_id = 'study-materials' AND auth.role() = 'authenticated')
   ```
3. Click **Review** → **Save policy**

**Policy 2: Allow users to SELECT (read) their own files**
1. Click **New Policy** → **For full customization**
2. Fill in:
   - **Policy name**: `Allow users to read own files`
   - **Allowed operation**: Check ✅ **SELECT**
   - **Policy definition**: Paste this:
   ```sql
   (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
   ```
3. Click **Review** → **Save policy**

**Policy 3: Allow users to UPDATE their own files**
1. Click **New Policy** → **For full customization**
2. Fill in:
   - **Policy name**: `Allow users to update own files`
   - **Allowed operation**: Check ✅ **UPDATE**
   - **Policy definition**: Paste this:
   ```sql
   (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
   ```
3. Click **Review** → **Save policy**

**Policy 4: Allow users to DELETE their own files**
1. Click **New Policy** → **For full customization**
2. Fill in:
   - **Policy name**: `Allow users to delete own files`
   - **Allowed operation**: Check ✅ **DELETE**
   - **Policy definition**: Paste this:
   ```sql
   (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
   ```
3. Click **Review** → **Save policy**

## Step 7: Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. **Email** should already be enabled (it's the default)
3. If not, toggle it ON
4. Scroll down to **Email Templates** and customize if desired (optional)

## Step 8: Verify Setup

After running all setup steps, verify everything is working:

```bash
# In your project terminal, test the connection:
cd /Users/ldg_mac/studybuddy-ai
npm run dev
```

The app should now:
- ✅ Connect to Supabase
- ✅ Allow user sign up/login
- ✅ Save study materials to database
- ✅ Upload PDFs to Supabase Storage
- ✅ Persist progress across sessions

## Troubleshooting

### Issue: "Invalid API key"
- Double-check your `.env` file has the correct `REACT_APP_SUPABASE_ANON_KEY`
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env`

### Issue: "Permission denied" when uploading
- Check that storage policies are created correctly
- Verify user is authenticated before uploading
- Check bucket name matches exactly: `study-materials`

### Issue: Database queries failing
- Verify all tables were created (check SQL Editor history)
- Check Row Level Security policies are set up
- Verify user is authenticated

### Issue: Can't sign up users
- Confirm Email provider is enabled in Authentication settings
- Check for any email confirmation requirements
- Look for errors in browser console

## Next Steps

Once setup is complete, I'll create:
- [x] Supabase client configuration (`src/utils/supabaseClient.js`)
- [ ] Authentication components (Login, Signup)
- [ ] Material library component
- [ ] Database integration for all features

**When you're done with setup, let me know and we'll continue!**
