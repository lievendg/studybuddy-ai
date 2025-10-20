-- StudyBuddy AI Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STUDY MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size BIGINT,
  num_pages INTEGER,
  content_text TEXT, -- Full extracted text
  metadata JSONB, -- PDF metadata (author, subject, etc.)
  material_type TEXT NOT NULL DEFAULT 'study' CHECK (material_type IN ('study', 'exam')), -- NEW: Material type
  linked_study_material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL, -- NEW: Link exam materials to study materials
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_study_materials_user ON study_materials(user_id);
CREATE INDEX idx_study_materials_created ON study_materials(created_at DESC);
CREATE INDEX idx_study_materials_type ON study_materials(material_type); -- NEW: Index for material type
CREATE INDEX idx_study_materials_linked ON study_materials(linked_study_material_id); -- NEW: Index for linked materials

-- ============================================
-- 2. STUDY SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('learn', 'review', 'quiz')),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_material ON study_sessions(material_id);
CREATE INDEX idx_study_sessions_start ON study_sessions(start_time DESC);

-- ============================================
-- 3. PROGRESS TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  topics_studied TEXT[], -- Array of topic names
  weak_areas TEXT[], -- Array of weak topic names
  concept_mastery JSONB DEFAULT '{}', -- {"topic_name": mastery_score}
  last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id) -- One progress record per user per material
);

-- Indexes
CREATE INDEX idx_progress_user ON progress_tracking(user_id);
CREATE INDEX idx_progress_material ON progress_tracking(material_id);
CREATE INDEX idx_progress_last_studied ON progress_tracking(last_studied DESC);

-- ============================================
-- 4. CONVERSATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('learn', 'review', 'quiz')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversation_user ON conversation_history(user_id);
CREATE INDEX idx_conversation_session ON conversation_history(session_id);
CREATE INDEX idx_conversation_material ON conversation_history(material_id);
CREATE INDEX idx_conversation_created ON conversation_history(created_at);

-- ============================================
-- 5. EXAM CONFIGURATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exam_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  learning_objectives TEXT[], -- Array of objectives
  difficulty_level TEXT DEFAULT 'intermediate',
  common_pitfalls TEXT[], -- Array of pitfalls
  time_constraints INTEGER, -- Minutes
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id) -- One exam config per user per material
);

-- Indexes
CREATE INDEX idx_exam_config_user ON exam_configurations(user_id);
CREATE INDEX idx_exam_config_material ON exam_configurations(material_id);

-- ============================================
-- 6. QUIZ RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  user_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  feedback TEXT,
  difficulty TEXT DEFAULT 'medium',
  topic TEXT, -- Which topic was tested
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_material ON quiz_results(material_id);
CREATE INDEX idx_quiz_results_session ON quiz_results(session_id);
CREATE INDEX idx_quiz_results_topic ON quiz_results(topic);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: STUDY MATERIALS
-- ============================================

-- Users can view their own materials
CREATE POLICY "Users can view own materials"
  ON study_materials FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own materials
CREATE POLICY "Users can insert own materials"
  ON study_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own materials
CREATE POLICY "Users can update own materials"
  ON study_materials FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own materials
CREATE POLICY "Users can delete own materials"
  ON study_materials FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: STUDY SESSIONS
-- ============================================

CREATE POLICY "Users can view own sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: PROGRESS TRACKING
-- ============================================

CREATE POLICY "Users can view own progress"
  ON progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON progress_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON progress_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: CONVERSATION HISTORY
-- ============================================

CREATE POLICY "Users can view own conversations"
  ON conversation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversation_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: EXAM CONFIGURATIONS
-- ============================================

CREATE POLICY "Users can view own exam configs"
  ON exam_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam configs"
  ON exam_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam configs"
  ON exam_configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam configs"
  ON exam_configurations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: QUIZ RESULTS
-- ============================================

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz results"
  ON quiz_results FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_study_materials_updated_at
  BEFORE UPDATE ON study_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at
  BEFORE UPDATE ON progress_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_configurations_updated_at
  BEFORE UPDATE ON exam_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKET SETUP (Run separately in Storage UI)
-- ============================================

-- This is for reference - create this in Storage UI:
-- Bucket name: study-materials
-- Public: NO (private)
-- File size limit: 50 MB
-- Allowed MIME types: application/pdf

-- Storage policies (create in Storage Policies UI):

-- Policy 1: Allow authenticated users to upload
-- (bucket_id = 'study-materials' AND auth.role() = 'authenticated')

-- Policy 2: Allow users to read their own files
-- (bucket_id = 'study-materials' AND auth.uid() = owner)

-- Policy 3: Allow users to update their own files
-- (bucket_id = 'study-materials' AND auth.uid() = owner)

-- Policy 4: Allow users to delete their own files
-- (bucket_id = 'study-materials' AND auth.uid() = owner)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these after setup to verify everything works:

-- 1. Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 3. Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================
-- SUCCESS!
-- ============================================

-- If you see no errors above, your database is ready!
-- Next steps:
-- 1. Create the storage bucket in Supabase Storage UI
-- 2. Set up storage policies
-- 3. Test authentication flow
-- 4. Start integrating with React app
