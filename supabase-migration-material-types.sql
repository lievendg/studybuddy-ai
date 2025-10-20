-- Migration: Add material_type and linked_study_material_id to study_materials table
-- Run this in Supabase SQL Editor to update existing databases

-- Step 1: Add new columns
ALTER TABLE study_materials
ADD COLUMN IF NOT EXISTS material_type TEXT NOT NULL DEFAULT 'study' CHECK (material_type IN ('study', 'exam')),
ADD COLUMN IF NOT EXISTS linked_study_material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL;

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_materials_type ON study_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_study_materials_linked ON study_materials(linked_study_material_id);

-- Step 3: Update existing materials to have 'study' type (already default, but explicit for clarity)
UPDATE study_materials
SET material_type = 'study'
WHERE material_type IS NULL;

-- Verification query
SELECT
  count(*) as total_materials,
  count(*) FILTER (WHERE material_type = 'study') as study_materials,
  count(*) FILTER (WHERE material_type = 'exam') as exam_materials
FROM study_materials;
