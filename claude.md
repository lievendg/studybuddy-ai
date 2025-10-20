# CLAUDE.MD - StudyBuddy AI Project Guide

## Project Overview
**Project Name:** StudyBuddy AI  
**Type:** React-based Study Assistant Application  
**Purpose:** Transform PDF textbooks into interactive learning experiences using Claude API for intelligent tutoring  
**Status:** In Development  

---

## 🚨 CRITICAL: Task Management Protocol

**BEFORE YOU WRITE ANY CODE:**
1. **ALWAYS check tasks.md first** - This is mandatory, not optional
2. **Mark tasks as completed** immediately when finished
3. **Add new tasks** as you discover them

```bash
# Your FIRST command in every session should be:
cat tasks.md
```

**This is the #1 rule for this project. No exceptions.**

---

## Quick Start Context

This is a React application that:
1. Accepts PDF textbook uploads
2. Processes and stores PDF content in React state
3. Uses Claude API to provide intelligent tutoring across three modes
4. Maintains full conversation context for continuous learning
5. Tracks progress without using localStorage (state only)

---

## ⚠️ IMPORTANT: Task Management Protocol

### Before Starting ANY Work:
1. **CHECK TASKS.MD FIRST** - Always review the current task list
2. **Mark completed tasks immediately** after finishing them
3. **Add newly discovered tasks** as you encounter them during development

```markdown
# Example tasks.md update:
- [x] Implement PDF upload component // COMPLETED 2025-10-16
- [ ] Add error handling for large PDFs // DISCOVERED: Need 50MB limit
- [ ] Create quiz difficulty adjustment // IN PROGRESS
```

### Task Management Rules:
- Never start coding without checking tasks.md
- Update task status in real-time
- Add context/notes when discovering new tasks
- Include blocker information if task is blocked
- Add priority levels (P0-Critical, P1-High, P2-Medium, P3-Low)

### Common Task Patterns:
```markdown
# Feature implementation
- [ ] Implement [feature name] component // P[0-3]

# Bug fix
- [ ] Fix: [description of issue] // P[0-3] - BUG

# Enhancement
- [ ] Enhance: [what to improve] // P[0-3] - ENHANCEMENT

# Research/Investigation
- [ ] Investigate: [what to research] // P[0-3] - RESEARCH

# Documentation
- [ ] Document: [what needs docs] // P[0-3] - DOCS

# Testing
- [ ] Test: [what to test] // P[0-3] - TEST

# Discovered during development
- [ ] [Task description] // P[0-3] - DISCOVERED: [where/why found]
```

---

## Technical Stack

```javascript
// Core Technologies
- React 18+ with Hooks (useState, useEffect, useReducer)
- Tailwind CSS for styling
- Claude API (claude-sonnet-4-20250514)
- PDF.js or pdf-lib for PDF parsing
- FileReader API for file handling
- No localStorage - all state management in React
- No backend required for MVP
```

---

## Project Architecture

### File Structure
```
StudyBuddyAI/
├── tasks.md                      // ⚠️ CHECK THIS FIRST BEFORE CODING
├── CLAUDE.MD                     // This file - project reference
├── README.md                     // Project documentation
├── package.json
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Header/
│   │   │   ├── FileUpload.jsx       // PDF upload handler
│   │   │   └── ProgressStats.jsx    // Session statistics display
│   │   ├── ModeSelector/
│   │   │   ├── LearnMode.jsx        // Guided learning interface
│   │   │   ├── ReviewMode.jsx       // Q&A interface
│   │   │   └── QuizMode.jsx         // Testing interface
│   │   ├── ContentDisplay/
│   │   │   ├── PDFViewer.jsx        // Display PDF excerpts
│   │   │   └── ExcerptCard.jsx      // Show relevant passages
│   │   └── Dashboard/
│   │       └── ProgressDashboard.jsx // Analytics and tracking
│   └── utils/
│       ├── claudeAPI.js             // API integration
│       ├── pdfProcessor.js          // PDF parsing logic
│       └── stateManager.js          // State management helpers
```

### State Structure
```javascript
const [appState, setAppState] = useState({
  // PDF Data
  pdf: {
    content: null,        // Full extracted text
    metadata: {},         // Title, pages, etc.
    isLoaded: false,
    sections: []          // Parsed chapters/sections
  },
  
  // Current Session
  session: {
    mode: 'learn',        // 'learn' | 'review' | 'quiz'
    conversationHistory: [], // Full message history for Claude
    currentTopic: null,
    startTime: null
  },
  
  // Progress Tracking
  progress: {
    questionsAnswered: 0,
    correctAnswers: 0,
    topicsStudied: [],
    weakAreas: [],
    sessionTime: 0,
    conceptMastery: {}    // Topic -> mastery level
  },
  
  // Quiz State
  quiz: {
    currentQuestion: null,
    questionHistory: [],
    difficulty: 'medium',  // Adaptive
    score: 0
  }
});
```

---

## Claude API Integration

### Key Principles
1. **Always include full PDF content** in system message
2. **Maintain complete conversation history** in messages array
3. **Use mode-specific prompting** for each study mode
4. **Include progress data** for personalization

### API Call Pattern
```javascript
const callClaude = async (userMessage, mode) => {
  const { pdf, session, progress } = appState;
  
  // Build conversation history
  const messages = [
    {
      role: "system",
      content: `You are an expert tutor for this textbook:
        ${pdf.content}
        
        Student progress: ${JSON.stringify(progress)}
        Current mode: ${mode}
        
        Instructions for ${mode} mode:
        ${getModeInstructions(mode)}`
    },
    ...session.conversationHistory,
    {
      role: "user",
      content: userMessage
    }
  ];
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages
    })
  });
  
  const data = await response.json();
  
  // Update conversation history
  updateConversationHistory(userMessage, data.content[0].text);
  
  return data.content[0].text;
};
```

### Mode-Specific Prompts

#### Learn Mode
```javascript
const learnModePrompt = `
Act as a patient, expert tutor teaching from this textbook.
- Break down concepts step-by-step
- Use analogies and real-world examples
- Cite specific page numbers
- Adjust complexity based on student's progress
- Encourage deeper exploration
`;
```

#### Review Mode
```javascript
const reviewModePrompt = `
Act as a knowledgeable study partner.
- Answer questions using textbook content
- Always cite page/section references
- Provide relevant excerpts
- Suggest related topics
- Keep tone conversational
`;
```

#### Quiz Mode
```javascript
const quizModePrompt = `
Act as an adaptive test administrator.
- Generate questions at ${difficulty} level
- 70% open-ended, 20% fill-in-blank, 10% application
- Provide detailed feedback with textbook references
- Adjust difficulty based on performance
- Focus on weak areas: ${JSON.stringify(progress.weakAreas)}
`;
```

---

## Core Features Implementation

### 1. PDF Processing
```javascript
// utils/pdfProcessor.js
import * as pdfjsLib from 'pdfjs-dist';

export const processPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  
  const textContent = [];
  const metadata = {
    numPages: pdf.numPages,
    info: await pdf.getMetadata()
  };
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    textContent.push({
      pageNum: i,
      text: text.items.map(item => item.str).join(' ')
    });
  }
  
  return {
    fullText: textContent.map(p => p.text).join('\n'),
    pages: textContent,
    metadata
  };
};
```

### 2. Learn Mode Component
```javascript
// components/ModeSelector/LearnMode.jsx
const LearnMode = ({ appState, setAppState }) => {
  const [currentConcept, setCurrentConcept] = useState(null);
  const [explanation, setExplanation] = useState('');
  
  const requestExplanation = async (topic) => {
    const prompt = `Explain ${topic} step-by-step for a beginner.
                   Include examples and break down complex parts.`;
    
    const response = await callClaude(prompt, 'learn');
    setExplanation(response);
    
    // Update progress
    updateProgress({
      topicsStudied: [...appState.progress.topicsStudied, topic]
    });
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Topic selector and explanation display */}
    </div>
  );
};
```

### 3. Quiz Mode with Adaptive Difficulty
```javascript
// components/ModeSelector/QuizMode.jsx
const QuizMode = ({ appState, setAppState }) => {
  const generateQuestion = async () => {
    const { difficulty, weakAreas } = appState.quiz;
    
    const prompt = `Generate a ${difficulty} difficulty question.
                   Focus on topics: ${weakAreas.join(', ')}
                   Type: ${selectQuestionType()}`;
    
    const question = await callClaude(prompt, 'quiz');
    return question;
  };
  
  const evaluateAnswer = async (userAnswer) => {
    const prompt = `Evaluate this answer: "${userAnswer}"
                   Provide feedback and cite textbook pages.
                   Give partial credit if applicable.`;
    
    const feedback = await callClaude(prompt, 'quiz');
    
    // Adjust difficulty based on performance
    adjustDifficulty(feedback.isCorrect);
    
    return feedback;
  };
  
  const adjustDifficulty = (isCorrect) => {
    // Adaptive algorithm
    const { correctStreak, incorrectStreak } = appState.quiz;
    
    if (correctStreak >= 3) {
      setDifficulty('hard');
    } else if (incorrectStreak >= 2) {
      setDifficulty('easy');
    }
  };
};
```

### 4. Progress Tracking
```javascript
// utils/progressTracker.js
export const updateProgress = (appState, action) => {
  const { type, data } = action;
  
  switch (type) {
    case 'QUESTION_ANSWERED':
      return {
        ...appState,
        progress: {
          ...appState.progress,
          questionsAnswered: appState.progress.questionsAnswered + 1,
          correctAnswers: data.isCorrect 
            ? appState.progress.correctAnswers + 1 
            : appState.progress.correctAnswers
        }
      };
    
    case 'TOPIC_STUDIED':
      const mastery = calculateMastery(data.topic, data.performance);
      return {
        ...appState,
        progress: {
          ...appState.progress,
          conceptMastery: {
            ...appState.progress.conceptMastery,
            [data.topic]: mastery
          }
        }
      };
  }
};
```

---

## Important Constraints & Guidelines

### Must Follow
1. **NO localStorage** - All data in React state only
2. **Include full PDF content** in every Claude API call
3. **Maintain conversation history** for context continuity
4. **Handle errors gracefully** with user-friendly messages
5. **Use Tailwind CSS** utility classes only (no custom CSS)

### Performance Considerations
```javascript
// Optimize large PDF handling
const optimizePDFContent = (content) => {
  // For API calls, truncate if > 100k tokens
  const MAX_TOKENS = 100000;
  if (content.length > MAX_TOKENS) {
    // Implement smart truncation based on current topic
    return truncateAroundTopic(content, currentTopic);
  }
  return content;
};

// Debounce API calls
const debouncedApiCall = debounce(callClaude, 500);
```

### Error Handling
```javascript
const errorHandlers = {
  PDF_TOO_LARGE: "File exceeds 50MB. Please use a smaller file.",
  PDF_PARSE_ERROR: "Unable to read PDF. Please check file format.",
  API_ERROR: "Connection issue. Please retry.",
  RATE_LIMIT: "Too many requests. Please wait a moment.",
  NO_CONTENT: "Please upload a PDF textbook first."
};

// Wrap all API calls
try {
  const response = await callClaude(prompt, mode);
  return response;
} catch (error) {
  console.error('API Error:', error);
  showUserMessage(errorHandlers[error.code] || errorHandlers.API_ERROR);
}
```

---

## UI/UX Patterns

### Tailwind Classes Structure
```jsx
// Main container
<div className="min-h-screen bg-gray-50">
  
  // Header
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  
  // Mode tabs
  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
    <button className="flex-1 py-2 px-4 rounded-md bg-white shadow-sm">
  
  // Content area
  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    
  // Cards
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
  
  // Progress indicators
  <div className="relative pt-1">
    <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
      <div className="bg-indigo-600 transition-all duration-300"
           style={{width: `${progress}%`}}>
```

### Responsive Design
```jsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  // Collapsible sidebar on tablet
  <div className="hidden md:block lg:col-span-1">
  // Main content area
  <div className="col-span-1 md:col-span-1 lg:col-span-2">
```

---

## Testing Checklist

### Functionality Tests
- [ ] PDF upload (various sizes, formats)
- [ ] Text extraction accuracy
- [ ] Mode switching preserves state
- [ ] API calls include full context
- [ ] Progress tracking updates correctly
- [ ] Quiz difficulty adjusts properly
- [ ] Error messages display appropriately

### Performance Tests
- [ ] Large PDF handling (>100 pages)
- [ ] API response time (<3 seconds)
- [ ] State updates don't cause re-renders
- [ ] Memory usage stays reasonable

### User Experience Tests
- [ ] Mobile responsive design
- [ ] Keyboard navigation works
- [ ] Loading states show properly
- [ ] Feedback is immediate and clear

### Task Discovery Protocol
When testing reveals issues:
1. **Document in tasks.md immediately**
2. **Add priority level** (P0-P3)
3. **Link to test case** that revealed the issue

Example:
```markdown
# tasks.md update after testing
- [ ] Fix: PDF parsing fails for scanned documents // P1 - DISCOVERED during test case #3
- [ ] Add: Loading spinner for API calls >2sec // P2 - UX test revealed missing feedback
- [ ] Optimize: Memory leak in conversation history // P0 - Performance test failed
```

---

## Common Issues & Solutions

### Issue: Claude loses context between questions
**Solution:** Always include full conversation history
```javascript
messages: [...session.conversationHistory, newMessage]
```

### Issue: PDF parsing fails silently
**Solution:** Add comprehensive error handling
```javascript
try {
  const result = await processPDF(file);
  if (!result.fullText) throw new Error('NO_CONTENT');
} catch (error) {
  showError(error);
}
```

### Issue: Quiz questions repeat
**Solution:** Track question history
```javascript
const questionHistory = appState.quiz.questionHistory;
const prompt = `Generate new question. 
                Avoid these topics: ${questionHistory.slice(-5)}`;
```

---

## Development Workflow

### 1. Always Start Here
```bash
# FIRST: Check current tasks
cat tasks.md

# Review what needs to be done before coding
# Identify your task and any dependencies
```

### 2. Development Commands
```bash
# Start development
npm start

# Build for production
npm run build

# Run tests
npm test

# Check Tailwind classes
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

### 3. Task Updates During Development
```bash
# When completing a task
echo "- [x] Task name // COMPLETED $(date +%Y-%m-%d)" >> tasks.md

# When discovering a new task
echo "- [ ] New task description // DISCOVERED: reason" >> tasks.md

# When blocking on something
echo "- [ ] Task name // BLOCKED: waiting for X" >> tasks.md
```

---

## Future Enhancements
- Voice input for questions
- Collaborative study sessions
- Offline mode with cached content
- Export study notes
- Integration with learning management systems
- Multi-language support
- Advanced analytics dashboard

---

## Quick Reference

### Task Management Commands
```bash
# Quick check of current tasks
grep "\[ \]" tasks.md  # Show open tasks
grep "\[x\]" tasks.md  # Show completed tasks
grep "P0\|P1" tasks.md # Show high priority tasks
grep "BLOCKED" tasks.md # Show blocked tasks

# Quick task updates
# Mark complete
sed -i 's/\[ \] Task name/\[x\] Task name \/\/ COMPLETED 2025-10-16/' tasks.md

# Add new task
echo "- [ ] New feature: implement X // P2 - DISCOVERED" >> tasks.md
```

### State Updates
```javascript
// Always use functional updates for state
setAppState(prev => ({
  ...prev,
  session: {
    ...prev.session,
    mode: newMode
  }
}));
```

### API Response Parsing
```javascript
const claudeResponse = data.content[0].text;
// Parse for page references
const pageRefs = claudeResponse.match(/page (\d+)/gi);
// Parse for feedback
const isCorrect = claudeResponse.includes('correct');
```

### Component Props Pattern
```javascript
// Pass only needed state slices
<LearnMode 
  pdfContent={appState.pdf.content}
  progress={appState.progress}
  onProgressUpdate={updateProgress}
/>
```

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Primary Contact:** Development Team

## Remember
- **ALWAYS CHECK TASKS.MD BEFORE STARTING WORK**
- **Update tasks.md in real-time** (mark completed, add discovered)
- This is an educational tool - prioritize learning effectiveness
- Keep Claude API costs in mind - implement caching where possible
- User experience > feature complexity
- Test with real textbooks early and often
- Document new discoveries and blockers immediately in tasks.md

---

## Task Management Summary

### The Three Rules:
1. **CHECK** - Always check tasks.md before starting
2. **UPDATE** - Mark completed tasks immediately
3. **DISCOVER** - Add new tasks as you find them

### Task Status Indicators:
```markdown
- [ ] Open task
- [x] Completed task // COMPLETED 2025-10-16
- [ ] Blocked task // BLOCKED: waiting for API key
- [ ] In progress // IN PROGRESS: 50% done
- [ ] New discovery // DISCOVERED: found during PDF testing
```

### Priority Levels:
- P0: Critical - System breaking
- P1: High - Core functionality
- P2: Medium - Important features
- P3: Low - Nice to have

**Remember: A well-maintained tasks.md is the backbone of successful development!**