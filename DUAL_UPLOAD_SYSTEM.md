# Dual Upload System: Study Materials vs Exam Materials

## Overview

StudyBuddy AI now supports TWO types of PDF uploads:

1. **Study Materials** 📘 - Main textbooks, lecture notes, course content
2. **Exam Materials** 📝 - Past exams, sample questions, answer keys, study guides

This allows Claude to access BOTH types of content when generating questions, making quiz questions more relevant and aligned with actual exam formats.

---

## How It Works

### Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Study Material     │         │  Exam Material       │
│  (Textbook)         │         │  (Past Exam)         │
│                     │         │                      │
│  - Main content     │         │  - Question formats  │
│  - Concepts         │         │  - Difficulty levels │
│  - Explanations     │         │  - Answer keys       │
└─────────────────────┘         └──────────────────────┘
         │                               │
         └───────────┬───────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Claude API     │
            │                 │
            │  Combines both  │
            │  for context    │
            └────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Quiz Questions │
            │  - Aligned with │
            │    exam format  │
            │  - Proper       │
            │    difficulty   │
            └────────────────┘
```

###  Database Schema

```sql
CREATE TABLE study_materials (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT,
  file_name TEXT,
  content_text TEXT,
  material_type TEXT DEFAULT 'study' CHECK (material_type IN ('study', 'exam')),
  linked_study_material_id UUID REFERENCES study_materials(id),
  ...
);
```

**Key Fields:**
- `material_type`: `'study'` or `'exam'`
- `linked_study_material_id`: Links exam materials to their corresponding study material

---

## Setup Instructions

### Step 1: Update Database Schema

Run the migration in your Supabase SQL Editor:

```bash
# In Supabase Dashboard -> SQL Editor
cat supabase-migration-material-types.sql
```

Or copy and run this SQL:

```sql
ALTER TABLE study_materials
ADD COLUMN IF NOT EXISTS material_type TEXT NOT NULL DEFAULT 'study' CHECK (material_type IN ('study', 'exam')),
ADD COLUMN IF NOT EXISTS linked_study_material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_study_materials_type ON study_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_study_materials_linked ON study_materials(linked_study_material_id);
```

### Step 2: Verify Migration

```sql
SELECT
  count(*) as total_materials,
  count(*) FILTER (WHERE material_type = 'study') as study_materials,
  count(*) FILTER (WHERE material_type = 'exam') as exam_materials
FROM study_materials;
```

### Step 3: Test the Feature

1. **Start the app**: `npm run dev`
2. **Navigate to upload page**
3. **See two options**:
   - Study Material (blue)
   - Exam Material (purple)
4. **Select type and upload**
5. **View in library** - see type badges

---

## User Workflow

### Uploading Study Material

1. Click "Upload New PDF" or start fresh
2. **Select "Study Material"** (blue button)
3. Upload textbook/lecture notes
4. Material saved with `material_type: 'study'`

### Uploading Exam Material

1. Click "Upload New PDF"
2. **Select "Exam Material"** (purple button)
3. Upload past exam/sample questions
4. Material saved with `material_type: 'exam'`

### Viewing Materials

**Material Library** shows:
- Filter buttons: "All" | "Study Materials" | "Exam Materials"
- Color-coded badges:
  - 🔵 Blue badge = Study Material
  - 🟣 Purple badge = Exam Material

---

## How Claude Uses Exam Materials

### Current Implementation

When you select a study material, Claude receives:
```javascript
// Only the study material content
{
  content: studyMaterial.content_text
}
```

### Planned Enhancement (Next Step)

When in Quiz mode, Claude will receive:
```javascript
{
  studyMaterial: mainTextbook.content_text,
  examMaterials: [
    pastExam1.content_text,
    pastExam2.content_text,
    sampleQuestions.content_text
  ]
}
```

**Claude's Prompt Will Include:**
```
STUDY MATERIAL (Main Content):
[Full textbook content]

EXAM MATERIALS (Question References):
1. Past Exam 2023:
[Past exam questions and answers]

2. Sample Questions:
[Sample questions from study guide]

INSTRUCTIONS:
- Generate quiz questions that match the format and difficulty of the exam materials
- Focus on topics that appear in both study and exam materials
- Use exam materials to understand expected question formats
- Ensure answers align with how exam materials are graded
```

---

## Benefits

### For Students
✅ **More relevant practice questions** - Matches actual exam format
✅ **Better difficulty calibration** - Understands exam-level expectations
✅ **Targeted preparation** - Focuses on exam-tested topics
✅ **Format familiarity** - Practice with actual question styles

### For Claude
✅ **Better context** - Understands both content AND assessment style
✅ **Aligned difficulty** - Generates appropriately challenging questions
✅ **Format awareness** - Matches question types to exam format
✅ **Topic prioritization** - Focuses on exam-relevant material

---

## Next Steps

### Remaining Tasks

1. **✅ Database Schema** - COMPLETE
2. **✅ Upload UI** - COMPLETE
3. **✅ Material Library** - COMPLETE
4. **🔄 Claude API Integration** - IN PROGRESS
5. **⏳ Linking Materials** - PENDING
6. **⏳ Testing** - PENDING

### To Complete Claude Integration

Need to modify `/src/utils/claude API.js`:

```javascript
// Current
export const callClaude = async (userMessage, mode, pdfContent, ...) => {
  const prompt = getModePrompt(mode, pdfContent, ...);
  // ...
}

// Enhanced
export const callClaude = async (userMessage, mode, pdfContent, examMaterials, ...) => {
  const prompt = getModePrompt(mode, pdfContent, examMaterials, ...);
  // ...
}

export const getModePrompt = (mode, pdfContent, examMaterials, ...) => {
  let baseContext = `Study Material:\n${pdfContent}`;

  if (examMaterials && examMaterials.length > 0) {
    baseContext += `\n\nExam Materials:\n`;
    examMaterials.forEach((exam, i) => {
      baseContext += `\n${i + 1}. ${exam.title}:\n${exam.content}\n`;
    });
  }

  // Rest of prompt...
}
```

### To Add Material Linking

Allow users to link exam materials to specific study materials:

```javascript
// In upload flow:
if (materialType === 'exam') {
  // Show dropdown: "Which study material is this exam for?"
  <select onChange={(e) => setLinkedMaterialId(e.target.value)}>
    {studyMaterials.map(m => (
      <option value={m.id}>{m.title}</option>
    ))}
  </select>
}
```

---

## Examples

### Example Use Case 1: Biology Final Exam

**Study Material:**
- Upload: "Campbell Biology Textbook Chapter 5-8"
- Type: Study Material
- Content: Detailed explanations of cellular processes

**Exam Material:**
- Upload: "Biology 101 Final Exam 2023"
- Type: Exam Material
- Link to: Campbell Biology Textbook
- Content: 50 multiple choice + 5 essay questions

**Result in Quiz Mode:**
- Claude generates questions matching the 2023 exam format
- Difficulty aligns with actual exam questions
- Topics prioritized based on what was tested

### Example Use Case 2: Calculus Midterm

**Study Material:**
- "Calculus Early Transcendentals Ch 1-6"

**Exam Materials:**
- "Midterm Practice Problems with Solutions"
- "Past Midterm 2022"
- "Professor's Sample Questions"

**Result:**
- Quiz questions mirror the professor's style
- Difficulty matches past exams
- Answer format expectations clear

---

## File Changes

### Modified Files
- `supabase-schema.sql` - Added material_type and linked_study_material_id
- `src/components/Header/FileUpload.jsx` - Added material type selector
- `src/components/Library/MaterialLibrary.jsx` - Added filtering and badges

### New Files
- `supabase-migration-material-types.sql` - Migration script
- `DUAL_UPLOAD_SYSTEM.md` - This documentation

---

## Troubleshooting

### Issue: Don't see material type selector

**Solution**: Clear cache and reload
```bash
# Hard reload
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Issue: Old materials don't have badges

**Solution**: Run migration script - defaults to 'study' type
```sql
UPDATE study_materials SET material_type = 'study' WHERE material_type IS NULL;
```

### Issue: Filter buttons not working

**Solution**: Check browser console for errors. Ensure latest code deployed.

---

## API Reference

### Upload Material

```javascript
const material = await saveMaterial({
  user_id: userId,
  title: "My Textbook",
  file_name: "textbook.pdf",
  content_text: extractedText,
  material_type: 'study' | 'exam',  // NEW
  linked_study_material_id: uuid | null  // NEW (optional)
});
```

### Get Materials by Type

```javascript
const materials = await getMaterials(userId);
const studyMaterials = materials.filter(m => m.material_type === 'study');
const examMaterials = materials.filter(m => m.material_type === 'exam');
```

### Get Linked Exam Materials

```javascript
const examMaterials = materials.filter(
  m => m.material_type === 'exam' && m.linked_study_material_id === studyMaterialId
);
```

---

## Future Enhancements

1. **Auto-linking** - AI suggests which exam materials match which study materials
2. **Exam insights** - Analytics on question distribution, difficulty, topics
3. **Multi-material quizzes** - Combine multiple exams for comprehensive practice
4. **Question bank** - Extract and categorize questions from exam materials
5. **Answer key validation** - Check student answers against exam answer keys

---

**Last Updated**: 2025-10-18
**Version**: 1.0
**Status**: Ready for Testing
