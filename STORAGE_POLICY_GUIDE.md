# Storage Policy Setup - Quick Visual Guide

## The Issue You Encountered

Storage policies in Supabase use a **GUI form**, not raw SQL. The syntax error happens when you try to paste SQL directly.

---

## Correct Way: Use the GUI Form

### For Each Policy, Follow These Steps:

#### Step 1: Click "New Policy"
- Go to Storage → `study-materials` bucket → Policies tab
- Click **"New Policy"** button

#### Step 2: Choose "For full customization"
- You'll see two options
- Click **"For full customization"**

#### Step 3: Fill in the Form

The form has these fields:

```
┌─────────────────────────────────────────┐
│  Policy name: [Enter name here]         │
├─────────────────────────────────────────┤
│  Allowed operation:                     │
│  ☐ SELECT                               │
│  ☐ INSERT                               │
│  ☐ UPDATE                               │
│  ☐ DELETE                               │
├─────────────────────────────────────────┤
│  Target roles: public                   │
├─────────────────────────────────────────┤
│  USING expression (for SELECT):         │
│  [SQL goes here]                        │
├─────────────────────────────────────────┤
│  WITH CHECK expression (for others):    │
│  [SQL goes here]                        │
└─────────────────────────────────────────┘
```

#### Step 4: Click "Review" then "Save policy"

---

## All 4 Policies to Create

### Policy 1: INSERT (Upload)

**Form values:**
- **Policy name**: `Allow authenticated uploads`
- **Allowed operation**: ✅ Check **INSERT** only
- **WITH CHECK expression**: Paste this SQL:
  ```sql
  (bucket_id = 'study-materials' AND auth.role() = 'authenticated')
  ```

---

### Policy 2: SELECT (Read)

**Form values:**
- **Policy name**: `Allow users to read own files`
- **Allowed operation**: ✅ Check **SELECT** only
- **USING expression**: Paste this SQL:
  ```sql
  (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
  ```

**What this does**: Only allows users to read files in folders named with their own user ID

---

### Policy 3: UPDATE (Modify)

**Form values:**
- **Policy name**: `Allow users to update own files`
- **Allowed operation**: ✅ Check **UPDATE** only
- **WITH CHECK expression**: Paste this SQL:
  ```sql
  (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
  ```

---

### Policy 4: DELETE (Remove)

**Form values:**
- **Policy name**: `Allow users to delete own files`
- **Allowed operation**: ✅ Check **DELETE** only
- **USING expression**: Paste this SQL:
  ```sql
  (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
  ```

---

## How the Policies Work

### File Path Structure
When a user uploads a file, it's stored as:
```
study-materials/
  └── [user-id]/
      └── [timestamp]-[filename].pdf
```

Example:
```
study-materials/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── 1729267890123-biology-textbook.pdf
```

### Policy Logic

**Policy 1 (INSERT)**:
- Any authenticated user can upload
- Files will be organized by their user ID automatically

**Policies 2-4 (SELECT/UPDATE/DELETE)**:
- `storage.foldername(name)[1]` extracts the first folder (user ID)
- `auth.uid()::text` is the current user's ID
- Only matches if the folder name equals the user's ID
- Users can only read/update/delete their own files

---

## After Creating All 4 Policies

You should see something like this in the Policies tab:

```
┌─────────────────────────────────────────────────────┐
│ Policies for study-materials                        │
├─────────────────────────────────────────────────────┤
│ ✅ Allow authenticated uploads         [INSERT]     │
│ ✅ Allow users to read own files       [SELECT]     │
│ ✅ Allow users to update own files     [UPDATE]     │
│ ✅ Allow users to delete own files     [DELETE]     │
└─────────────────────────────────────────────────────┘
```

---

## Testing the Policies

1. Go to http://localhost:3000
2. Sign up for an account
3. Upload a PDF
4. Check the browser console - you should see:
   ```
   PDF uploaded to storage: [user-id]/[timestamp]-[filename].pdf
   Material saved to database: [material-id]
   ```
5. Go to Supabase Storage → `study-materials` bucket
6. You should see a folder with your user ID
7. Inside that folder, your PDF!

---

## Troubleshooting

### "new row violates row-level security policy"
- **Fix**: Check that all 4 policies are created
- Verify the SQL is pasted correctly (no extra characters)
- Make sure you checked the right operation checkbox

### "Policy already exists"
- **Fix**: Each policy name must be unique
- If you need to recreate, delete the old one first

### Files uploading to wrong location
- **Fix**: Check that FileUpload.jsx uses `userId` in the path:
  ```javascript
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  ```

---

## Quick Checklist

Before moving on, verify:

- [ ] Created bucket named exactly `study-materials`
- [ ] Bucket is set to **private** (not public)
- [ ] Created all 4 policies (INSERT, SELECT, UPDATE, DELETE)
- [ ] Each policy has the correct SQL pasted
- [ ] SQL has no syntax errors (check for missing parentheses)
- [ ] Tested by uploading a file from the app
- [ ] File appears in Supabase Storage under your user ID folder

---

## Need Help?

If you're still getting errors:

1. **Screenshot the error** - exact error message helps
2. **Check Supabase logs** - Storage → Logs tab
3. **Verify SQL** - Make sure you're using the FORM fields, not raw SQL
4. **Test auth** - Make sure you're signed in when uploading

Your app is running at: **http://localhost:3000**

Let me know if you hit any other issues! 🚀
