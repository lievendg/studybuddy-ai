-- Script to Update Existing Materials with Material Type
-- Run this in Supabase SQL Editor if you have existing materials

-- ============================================
-- STEP 1: Check your current materials
-- ============================================

-- See all current materials
SELECT id, title, file_name, material_type, created_at
FROM study_materials
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Update specific materials to be 'exam' type
-- ============================================

-- Option A: Update by title (if you know the title)
UPDATE study_materials
SET material_type = 'exam'
WHERE title LIKE '%exam%' OR title LIKE '%test%' OR title LIKE '%quiz%';

-- Option B: Update by filename pattern
UPDATE study_materials
SET material_type = 'exam'
WHERE file_name LIKE '%exam%' OR file_name LIKE '%test%';

-- Option C: Update specific materials by ID
UPDATE study_materials
SET material_type = 'exam'
WHERE id IN (
  'paste-uuid-here',
  'paste-another-uuid-here'
);

-- ============================================
-- STEP 3: Verify the updates
-- ============================================

-- Count materials by type
SELECT material_type, COUNT(*) as count
FROM study_materials
GROUP BY material_type;

-- See updated materials
SELECT id, title, material_type
FROM study_materials
ORDER BY material_type, title;

-- ============================================
-- NOTES:
-- ============================================

-- Default behavior:
-- - All existing materials default to 'study' type
-- - You only need to update the ones that should be 'exam' type

-- Material types:
-- - 'study' = Textbooks, lecture notes, course content
-- - 'exam' = Past exams, sample questions, answer keys

-- After updating:
-- - Refresh the app (F5)
-- - Open "My Library"
-- - You should see colored badges (blue=study, purple=exam)
