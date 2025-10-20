# Supabase Integration Plan for StudyBuddy AI

## Overview
Migrate from local state to Supabase for persistent storage, user authentication, and multi-device access.

## Benefits
✅ **Persistent Storage** - Study materials saved in the cloud
✅ **User Accounts** - Each user has their own library
✅ **Multi-Device** - Access from phone, tablet, laptop
✅ **Study History** - Track progress over time
✅ **Material Library** - Build collection of PDFs
✅ **Collaboration** - Share materials with classmates (future)

---

## Database Schema

### 1. Users Table (provided by Supabase Auth)
```sql
-- Handled by Supabase Auth automatically
users (
  id uuid primary key,
  email text,
  created_at timestamp
)
```

### 2. Study Materials Table
```sql
CREATE TABLE study_materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,  -- Supabase Storage URL
  content text NOT NULL,    -- Extracted PDF text
  metadata jsonb,           -- {numPages, wordCount, uploadDate}
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_materials_user ON study_materials(user_id);
```

### 3. Study Sessions Table
```sql
CREATE TABLE study_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  material_id uuid REFERENCES study_materials(id),
  mode text NOT NULL,  -- 'learn', 'review', 'quiz'
  started_at timestamp DEFAULT now(),
  ended_at timestamp,
  duration_minutes integer,
  topics_studied text[],
  questions_answered integer DEFAULT 0,
  correct_answers integer DEFAULT 0
);
```

### 4. Progress Tracking Table
```sql
CREATE TABLE progress_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  material_id uuid REFERENCES study_materials(id),
  topic text NOT NULL,
  mastery_level integer DEFAULT 0,
  last_studied timestamp,
  times_reviewed integer DEFAULT 0,
  weak_area boolean DEFAULT false
);
```

### 5. Conversation History Table
```sql
CREATE TABLE conversation_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES study_sessions(id),
  role text NOT NULL,  -- 'user' or 'assistant'
  content text NOT NULL,
  created_at timestamp DEFAULT now()
);
```

### 6. Exam Configurations Table
```sql
CREATE TABLE exam_configurations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id uuid REFERENCES study_materials(id),
  exam_type text,  -- 'multiple-choice', 'essay', 'practical', 'mixed'
  learning_objectives text[],
  difficulty_level text,  -- 'beginner', 'intermediate', 'advanced'
  common_pitfalls text[],
  time_constraints integer,  -- minutes
  special_instructions text,
  created_at timestamp DEFAULT now()
);
```

---

## Implementation Steps

### Phase 1: Setup Supabase (Week 1)

**1. Create Supabase Project**
```bash
# Go to https://supabase.com
# Create new project
# Get your project URL and anon key
```

**2. Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

**3. Create Supabase Client**
```javascript
// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**4. Update .env**
```env
REACT_APP_SUPABASE_URL=your-project-url.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Phase 2: Authentication (Week 1-2)

**1. Create Auth Components**
```javascript
// src/components/Auth/Login.jsx
// src/components/Auth/SignUp.jsx
// src/components/Auth/Profile.jsx
```

**2. Add Auth to App.js**
```javascript
const [session, setSession] = useState(null)

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session)
    }
  )

  return () => subscription.unsubscribe()
}, [])
```

### Phase 3: PDF Storage (Week 2)

**1. Upload PDFs to Supabase Storage**
```javascript
// src/utils/pdfStorage.js
export const uploadPDF = async (file, userId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file)
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

**2. Save Metadata to Database**
```javascript
export const saveMaterial = async (pdfData, userId) => {
  const { data, error } = await supabase
    .from('study_materials')
    .insert({
      user_id: userId,
      title: pdfData.metadata.title,
      file_name: pdfData.metadata.name,
      file_url: pdfData.fileUrl,
      content: pdfData.fullText,
      metadata: pdfData.metadata
    })
    .select()
  
  if (error) throw error
  return data[0]
}
```

### Phase 4: Progress Sync (Week 2-3)

**1. Save Progress to Database**
```javascript
export const saveProgress = async (sessionId, progress) => {
  const { error } = await supabase
    .from('progress_tracking')
    .upsert({
      session_id: sessionId,
      topics_studied: progress.topicsStudied,
      questions_answered: progress.questionsAnswered,
      correct_answers: progress.correctAnswers,
      weak_areas: progress.weakAreas
    })
  
  if (error) throw error
}
```

**2. Load User's Materials**
```javascript
export const getUserMaterials = async (userId) => {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### Phase 5: Material Library (Week 3)

**1. Create Library Component**
```javascript
// src/components/Library/MaterialLibrary.jsx
const MaterialLibrary = ({ userId }) => {
  const [materials, setMaterials] = useState([])
  
  useEffect(() => {
    loadMaterials()
  }, [userId])
  
  const loadMaterials = async () => {
    const data = await getUserMaterials(userId)
    setMaterials(data)
  }
  
  return (
    <div>
      {materials.map(material => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </div>
  )
}
```

---

## File Structure After Integration

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   └── Profile.jsx
│   ├── Library/
│   │   ├── MaterialLibrary.jsx
│   │   ├── MaterialCard.jsx
│   │   └── MaterialUpload.jsx
│   └── ... (existing components)
├── utils/
│   ├── supabaseClient.js
│   ├── pdfStorage.js
│   ├── progressSync.js
│   └── ... (existing utils)
```

---

## Migration Strategy

### Option 1: Gradual Migration (Recommended)
1. Keep local state working
2. Add Supabase as optional
3. Sync local → database when user creates account
4. Eventually phase out local-only mode

### Option 2: Full Migration
1. Require authentication
2. All features use database
3. No local-only option

---

## Cost Estimate

**Supabase Free Tier:**
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth

**Perfect for MVP and testing!**

**Pro Tier ($25/month):**
- 8GB database
- 100GB file storage
- Needed when you have ~1000+ active users

---

## Next Steps

1. Create Supabase account
2. Set up database tables (run SQL above)
3. Install Supabase client
4. Implement authentication
5. Migrate PDF storage
6. Add progress syncing

**Want me to start implementing this? I can begin with Phase 1!**
