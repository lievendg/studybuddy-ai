# Testing Guide: Dual-Upload System & Claude Integration

## Overview
This guide provides step-by-step instructions for testing the newly implemented dual-upload system that allows separate uploading of study materials and exam materials.

**Last Updated:** October 18, 2025
**Features Tested:** Material type differentiation, multi-exam material loading, Claude API integration

---

## Prerequisites

1. **Development Server Running:**
   ```bash
   npm run dev
   ```
   App should be accessible at http://localhost:3000

2. **Test Materials Required:**
   - At least 1 PDF textbook (for study material)
   - At least 2 PDF exam documents (past exams, sample questions, answer keys)
   - PDFs should be readable and contain text (not just scanned images)

3. **Database Setup:**
   - Supabase project configured
   - Migration script applied (if upgrading from older version)

---

## Test Suite

### Test 1: Material Type Selection UI

**Objective:** Verify the upload interface correctly shows material type options

**Steps:**
1. Open http://localhost:3000
2. Sign in (or continue as guest)
3. Click "Upload PDF" or the upload area

**Expected Results:**
- ✅ Modal displays with two selectable buttons:
  - "Study Material" (blue theme, FileText icon)
  - "Exam Material" (purple theme, ClipboardList icon)
- ✅ Buttons are visually distinct with color coding
- ✅ Clicking each button highlights it with a ring border
- ✅ Description text appears under each button
- ✅ Selection persists while modal is open

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Upload Study Material

**Objective:** Verify study material uploads correctly

**Steps:**
1. Open upload modal
2. Select "Study Material" button
3. Choose a textbook PDF
4. Click "Upload PDF"
5. Wait for upload to complete

**Expected Results:**
- ✅ Upload progress shows
- ✅ PDF is processed and loaded
- ✅ Material appears in library with **blue "Study" badge**
- ✅ Main content area shows the PDF content
- ✅ No errors in browser console

**Check Console Logs:**
```
Processing PDF: [filename]
Loading material: [title] Type: study
```

**Status:** [ ] Pass [ ] Fail

---

### Test 3: Upload Exam Materials

**Objective:** Verify exam materials upload correctly

**Steps:**
1. Open upload modal
2. Select "Exam Material" button
3. Choose an exam PDF (e.g., "Past Exam 2024.pdf")
4. Click "Upload PDF"
5. Repeat for a second exam material

**Expected Results:**
- ✅ Each upload processes successfully
- ✅ Materials appear in library with **purple "Exam" badges**
- ✅ Exam materials do NOT replace the study material
- ✅ No errors in browser console

**Check Console Logs:**
```
Processing PDF: [filename]
Material uploaded successfully!
```

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Material Library Filtering

**Objective:** Verify library can filter by material type

**Steps:**
1. Click "My Library" (for authenticated users) or ensure you have materials uploaded
2. Observe the filter buttons at the top
3. Click "All" button
4. Click "Study Materials" button
5. Click "Exam Materials" button

**Expected Results:**
- ✅ "All" shows both study and exam materials
- ✅ "Study Materials" shows only items with blue "Study" badge
- ✅ "Exam Materials" shows only items with purple "Exam" badge
- ✅ Filter buttons highlight when active
- ✅ Count of materials updates based on filter

**Visual Check:**
- Study materials: Blue badge with "Study" text
- Exam materials: Purple badge with "Exam" text

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Multi-Exam Material Loading

**Objective:** Verify all exam materials load when a study material is selected

**Steps:**
1. Ensure you have:
   - 1 study material uploaded
   - 2+ exam materials uploaded
2. Open Material Library
3. Click on the study material to select it
4. Wait for loading to complete
5. Observe the header area

**Expected Results:**
- ✅ Study material loads in main content area
- ✅ Purple indicator badge appears in header showing "[X] Exam Materials Loaded"
- ✅ Badge shows correct count (e.g., "2 Exam Materials Loaded")
- ✅ Library modal closes

**Check Console Logs:**
```
Loading material: [Study Material Title] Type: study
Loading exam materials for study material: [material-id]
Found X exam materials
```

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Exam Materials NOT Loaded for Exam Material Selection

**Objective:** Verify exam materials are NOT loaded when selecting another exam material

**Steps:**
1. Open Material Library
2. Click on an exam material (purple badge)
3. Observe the header area

**Expected Results:**
- ✅ Exam material loads in main content area
- ✅ NO purple "Exam Materials Loaded" badge appears
- ✅ Console does NOT show "Loading exam materials..." message

**Check Console Logs:**
```
Loading material: [Exam Material Title] Type: exam
// Should NOT see: "Loading exam materials for study material..."
```

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Claude API Integration - Learn Mode

**Objective:** Verify Claude receives exam materials in Learn Mode

**Steps:**
1. Load a study material (this should load exam materials too)
2. Verify purple badge shows exam materials loaded
3. Switch to "Learn Mode" tab
4. Type a question: "How should I structure my answers?"
5. Submit the question

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Console shows: `📚 Using X exam material(s) for context`
- ✅ Response appears (even if in mock mode)
- ✅ No API errors

**Check Console Logs:**
```
📚 Using 2 exam material(s) for context
[Mock Mode] Simulating Claude API call...
// OR
Calling Claude API...
```

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Claude API Integration - Quiz Mode

**Objective:** Verify Claude uses exam materials to format quiz questions

**Steps:**
1. Ensure study material is loaded with exam materials
2. Switch to "Quiz Mode" tab
3. Click "Start Quiz"
4. Wait for question generation
5. Answer the question
6. Wait for feedback
7. Click "Next Question"

**Expected Results:**
- ✅ Console shows: `📚 Using X exam material(s) for context` for each API call
- ✅ Question appears in the quiz interface
- ✅ Feedback appears after answering
- ✅ New question loads successfully
- ✅ No errors during the flow

**Check Console Logs (should appear 3 times: start, evaluate, next):**
```
📚 Using 2 exam material(s) for context
```

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Claude API Integration - Review Mode

**Objective:** Verify Claude can reference exam materials in Review Mode

**Steps:**
1. Ensure study material is loaded with exam materials
2. Switch to "Review Mode" tab
3. Ask a question: "What topics should I focus on based on past exams?"
4. Submit the question

**Expected Results:**
- ✅ Console shows: `📚 Using X exam material(s) for context`
- ✅ Response appears (mock or real)
- ✅ No errors

**Check Console Logs:**
```
📚 Using 2 exam material(s) for context
```

**Status:** [ ] Pass [ ] Fail

---

### Test 10: Mock Mode Exam Materials Notification

**Objective:** Verify mock mode shows exam materials are available

**Steps:**
1. Ensure `.env` file does NOT have valid Claude API key (to trigger mock mode)
2. Load a study material with exam materials
3. Go to any mode (Learn/Review/Quiz)
4. Interact with Claude (ask question or start quiz)

**Expected Results:**
- ✅ Mock mode warning appears
- ✅ Response includes note: `Note: This is a mock response. In production with real Claude API, I would analyze the X exam material(s) provided...`
- ✅ Mock mode indicator visible in UI

**Status:** [ ] Pass [ ] Fail

---

### Test 11: Database Migration (Existing Databases Only)

**Objective:** Verify migration script works for existing databases

**Prerequisites:**
- Existing Supabase database with old schema (without material_type column)

**Steps:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `supabase-migration-material-types.sql`
4. Paste and run in SQL Editor
5. Check if query succeeds

**Expected Results:**
- ✅ Query executes successfully
- ✅ No errors in Supabase console
- ✅ Columns added: `material_type`, `linked_study_material_id`
- ✅ Indexes created: `idx_study_materials_type`, `idx_study_materials_linked`
- ✅ Existing materials default to `material_type = 'study'`

**Verification Query:**
```sql
SELECT id, title, material_type FROM study_materials;
```

**Status:** [ ] Pass [ ] Fail [ ] N/A (new database)

---

### Test 12: Guest User Workflow

**Objective:** Verify dual-upload works for guest users

**Steps:**
1. Do NOT sign in (remain as guest)
2. Upload a study material
3. Upload an exam material
4. Select the study material from "Change PDF" dropdown

**Expected Results:**
- ✅ Both uploads work
- ✅ Materials appear in dropdown
- ✅ Study materials and exam materials are differentiated
- ✅ Selecting study material loads exam materials (if applicable)

**Note:** Guest users don't have persistent storage, so materials are session-only.

**Status:** [ ] Pass [ ] Fail

---

### Test 13: Mobile Responsiveness

**Objective:** Verify dual-upload UI works on mobile viewports

**Steps:**
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Test upload modal on small screen
4. Test material library on small screen

**Expected Results:**
- ✅ Material type buttons stack or resize properly
- ✅ Text remains readable
- ✅ Badges don't overflow
- ✅ Filter buttons accessible
- ✅ No horizontal scrolling

**Status:** [ ] Pass [ ] Fail

---

### Test 14: Error Handling

**Objective:** Verify graceful error handling

**Test Cases:**

**A) Invalid PDF Upload**
- Upload a non-PDF file
- Expected: Error message, upload fails gracefully

**B) Large PDF (>50MB)**
- Upload very large PDF
- Expected: Warning or processing message

**C) Network Error During Upload**
- Disconnect network mid-upload
- Expected: Error message, retry option

**D) Supabase Connection Failure**
- Temporarily disable Supabase connection
- Expected: Graceful fallback, user-friendly error

**Status:** [ ] Pass [ ] Fail

---

## Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Material Type Selection UI | [ ] | |
| 2 | Upload Study Material | [ ] | |
| 3 | Upload Exam Materials | [ ] | |
| 4 | Material Library Filtering | [ ] | |
| 5 | Multi-Exam Material Loading | [ ] | |
| 6 | Exam Materials NOT Loaded | [ ] | |
| 7 | Claude API - Learn Mode | [ ] | |
| 8 | Claude API - Quiz Mode | [ ] | |
| 9 | Claude API - Review Mode | [ ] | |
| 10 | Mock Mode Notification | [ ] | |
| 11 | Database Migration | [ ] | |
| 12 | Guest User Workflow | [ ] | |
| 13 | Mobile Responsiveness | [ ] | |
| 14 | Error Handling | [ ] | |

**Overall Status:** [ ] All Pass [ ] Some Failures [ ] Testing In Progress

---

## Known Issues & Limitations

1. **Token Usage:** Exam materials are limited to 3000 characters per material to manage API token usage. Very large exam documents will be truncated.

2. **Material Linking:** The `linked_study_material_id` field is not yet exposed in the UI. This is a future enhancement for associating specific exam materials with specific study materials.

3. **Exam Material Selection:** Currently ALL exam materials are loaded when a study material is selected. Future versions may allow selective loading.

4. **Guest User Persistence:** Guest users' materials are not persisted to the database and will be lost on page reload.

---

## Troubleshooting

### Issue: Exam materials not loading
**Check:**
- Browser console for errors
- Material type is set to 'exam' in database
- User is authenticated (for persistent storage)

### Issue: Console shows "Found 0 exam materials"
**Check:**
- At least one material with `material_type = 'exam'` exists
- User ID matches the materials' `user_id`
- Materials are not soft-deleted

### Issue: Claude API not receiving exam materials
**Check:**
- Console log shows `📚 Using X exam material(s) for context`
- `appState.examMaterials` is not empty (check React DevTools)
- API call includes examMaterials parameter

### Issue: Migration script fails
**Check:**
- Column already exists (re-run safe with IF NOT EXISTS)
- Permissions are correct
- Syntax is valid for PostgreSQL

---

## Developer Console Commands

Useful commands for debugging:

```javascript
// Check current app state
console.log(window.appState);

// Check loaded exam materials
console.log(window.appState?.examMaterials);

// Force reload materials (in React DevTools)
// Find MaterialLibrary component and trigger loadMaterials()

// Check Supabase connection
// Go to Network tab, filter by "supabase"
```

---

## Next Steps After Testing

1. **Document Findings:** Note any issues in the test results table
2. **Report Bugs:** Create issues for any failing tests
3. **Performance Testing:** Monitor API token usage with multiple exam materials
4. **User Acceptance Testing:** Have actual users test the workflow
5. **Production Deployment:** Plan rollout strategy including database migration

---

## Questions or Issues?

If you encounter issues not covered in this guide, check:
- `/DUAL_UPLOAD_SYSTEM.md` - Feature documentation
- `/CLAUDE.MD` - Project architecture
- Browser console logs
- Supabase dashboard logs
