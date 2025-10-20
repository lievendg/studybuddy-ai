# Exam Guidance Enhancement for StudyBuddy AI

## Overview
Enhance Claude's tutoring by providing exam-specific context, learning objectives, and targeted preparation strategies.

## Benefits
✅ **Targeted Learning** - Focus on exactly what will be tested
✅ **Better Questions** - Quiz questions match exam format
✅ **Strategic Prep** - Know common pitfalls before the exam
✅ **Time Management** - Practice with realistic time constraints
✅ **Confidence** - Clear expectations reduce test anxiety

---

## Architecture

### Exam Configuration Flow
```
1. User uploads PDF textbook
2. User configures exam details
3. Exam config saved to state (or Supabase)
4. All Claude prompts include exam context
5. Quiz mode generates exam-aligned questions
6. Progress tracking shows exam readiness
```

---

## Implementation

### Phase 1: Exam Configuration Component

**Create src/components/ExamConfig/ExamConfigModal.jsx:**

```jsx
import { useState } from 'react';
import { FileText, Target, AlertCircle, Clock, Award, X } from 'lucide-react';

const ExamConfigModal = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [config, setConfig] = useState({
    examType: currentConfig?.examType || 'mixed',
    learningObjectives: currentConfig?.learningObjectives || [],
    difficultyLevel: currentConfig?.difficultyLevel || 'intermediate',
    commonPitfalls: currentConfig?.commonPitfalls || [],
    timeConstraints: currentConfig?.timeConstraints || null,
    specialInstructions: currentConfig?.specialInstructions || '',
    ...currentConfig
  });

  const [objectiveInput, setObjectiveInput] = useState('');
  const [pitfallInput, setPitfallInput] = useState('');

  const handleAddObjective = () => {
    if (objectiveInput.trim()) {
      setConfig({
        ...config,
        learningObjectives: [...config.learningObjectives, objectiveInput.trim()]
      });
      setObjectiveInput('');
    }
  };

  const handleRemoveObjective = (index) => {
    setConfig({
      ...config,
      learningObjectives: config.learningObjectives.filter((_, i) => i !== index)
    });
  };

  const handleAddPitfall = () => {
    if (pitfallInput.trim()) {
      setConfig({
        ...config,
        commonPitfalls: [...config.commonPitfalls, pitfallInput.trim()]
      });
      setPitfallInput('');
    }
  };

  const handleRemovePitfall = (index) => {
    setConfig({
      ...config,
      commonPitfalls: config.commonPitfalls.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Exam Configuration</h2>
              <p className="text-sm text-gray-600">Help Claude prepare you for your specific exam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Exam Type
            </label>
            <select
              value={config.examType}
              onChange={(e) => setConfig({ ...config, examType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="essay">Essay Questions</option>
              <option value="short-answer">Short Answer</option>
              <option value="practical">Practical/Lab Exam</option>
              <option value="mixed">Mixed Format</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Quiz questions will match this format
            </p>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Learning Objectives
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                  placeholder="e.g., Understand cellular respiration process"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddObjective}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {config.learningObjectives.length > 0 && (
                <div className="space-y-2 mt-3">
                  {config.learningObjectives.map((objective, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm text-gray-900">{objective}</span>
                      <button
                        onClick={() => handleRemoveObjective(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              What specific topics or skills must you master for this exam?
            </p>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-600" />
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfig({ ...config, difficultyLevel: level })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-all ${
                    config.difficultyLevel === level
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Common Pitfalls */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              Common Pitfalls & Tricky Areas
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={pitfallInput}
                  onChange={(e) => setPitfallInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPitfall()}
                  placeholder="e.g., Students often confuse mitosis and meiosis"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddPitfall}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Add
                </button>
              </div>
              {config.commonPitfalls.length > 0 && (
                <div className="space-y-2 mt-3">
                  {config.commonPitfalls.map((pitfall, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm text-gray-900">{pitfall}</span>
                      <button
                        onClick={() => handleRemovePitfall(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              What mistakes do students commonly make on this exam?
            </p>
          </div>

          {/* Time Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-purple-600" />
              Time Constraints (minutes)
            </label>
            <input
              type="number"
              value={config.timeConstraints || ''}
              onChange={(e) => setConfig({
                ...config,
                timeConstraints: e.target.value ? parseInt(e.target.value) : null
              })}
              placeholder="e.g., 60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              How long do you have for this exam? (Optional - helps with practice pacing)
            </p>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Special Instructions or Notes
            </label>
            <textarea
              value={config.specialInstructions}
              onChange={(e) => setConfig({ ...config, specialInstructions: e.target.value })}
              rows={4}
              placeholder="e.g., Open book exam, formulas provided, focus on conceptual understanding rather than memorization"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Any other details about the exam format, materials allowed, or emphasis areas?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamConfigModal;
```

### Phase 2: Integrate into App

**Update src/App.js to include exam config:**

```jsx
import { useState } from 'react';
import ExamConfigModal from './components/ExamConfig/ExamConfigModal';
import { Settings } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState({
    pdf: { /* ... */ },
    session: { /* ... */ },
    progress: { /* ... */ },
    examConfig: null  // NEW: Store exam configuration
  });

  const [showExamConfig, setShowExamConfig] = useState(false);

  const handleSaveExamConfig = (config) => {
    setAppState(prev => ({
      ...prev,
      examConfig: config
    }));
    console.log('Exam config saved:', config);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">StudyBuddy AI</h1>
            <div className="flex items-center space-x-6">
              {appState.pdf.isLoaded && (
                <>
                  <ProgressStats progress={appState.progress} />

                  {/* Exam Config Button */}
                  <button
                    onClick={() => setShowExamConfig(true)}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Exam Setup</span>
                    {appState.examConfig && (
                      <span className="w-2 h-2 bg-green-600 rounded-full" />
                    )}
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Change PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Rest of component... */}

      {/* Exam Config Modal */}
      <ExamConfigModal
        isOpen={showExamConfig}
        onClose={() => setShowExamConfig(false)}
        onSave={handleSaveExamConfig}
        currentConfig={appState.examConfig}
      />
    </div>
  );
}
```

### Phase 3: Enhanced Claude Prompts

**Update src/utils/claudeAPI.js with exam-aware prompts:**

```javascript
const getModePrompt = (mode, pdfContent, progress, examConfig) => {
  // Base system prompt
  let basePrompt = `You are an expert AI tutor helping a student study from this textbook:

${pdfContent}

Student's current progress:
- Questions answered: ${progress.questionsAnswered}
- Accuracy: ${getAccuracy(progress)}%
- Topics studied: ${progress.topicsStudied.join(', ')}
${progress.weakAreas.length > 0 ? `- Weak areas: ${progress.weakAreas.join(', ')}` : ''}`;

  // Add exam configuration context if available
  if (examConfig) {
    basePrompt += `\n\n📋 EXAM PREPARATION CONTEXT:

Exam Type: ${examConfig.examType}
Difficulty Level: ${examConfig.difficultyLevel}

${examConfig.learningObjectives.length > 0 ? `
Learning Objectives (What the student MUST know):
${examConfig.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}
` : ''}

${examConfig.commonPitfalls.length > 0 ? `
⚠️ Common Pitfalls to Avoid:
${examConfig.commonPitfalls.map((pitfall, i) => `${i + 1}. ${pitfall}`).join('\n')}
` : ''}

${examConfig.timeConstraints ? `
⏱️ Time Constraint: ${examConfig.timeConstraints} minutes
(Consider pacing in your explanations and practice questions)
` : ''}

${examConfig.specialInstructions ? `
Special Instructions:
${examConfig.specialInstructions}
` : ''}

IMPORTANT: All your teaching should be aligned with these exam requirements. Focus on the learning objectives, warn about common pitfalls, and prepare the student specifically for this ${examConfig.examType} exam.`;
  }

  // Mode-specific instructions
  const modeInstructions = {
    learn: `
MODE: Learn Mode - Interactive Teaching

Your role:
- Teach concepts step-by-step with clear explanations
- Use analogies and real-world examples
- Break down complex topics into digestible parts
- Always cite specific page numbers from the textbook
- Adjust complexity based on student's current level
${examConfig ? `- Emphasize content aligned with learning objectives
- Proactively warn about common exam pitfalls
- Connect concepts to likely exam questions` : ''}

Teaching style:
- Patient and encouraging
- Socratic method: Ask guiding questions
- Build on student's existing knowledge
- Celebrate progress and correct mistakes gently`,

    review: `
MODE: Review Mode - Q&A Study Partner

Your role:
- Answer student questions clearly and accurately
- Always reference specific textbook sections
- Provide relevant excerpts when helpful
- Suggest related topics to explore
${examConfig ? `- Frame answers in context of exam objectives
- Point out when a question touches on a common pitfall
- Recommend exam-relevant follow-up questions` : ''}

Communication style:
- Conversational and friendly
- Direct and concise
- Use examples from the textbook
- Encourage deeper exploration`,

    quiz: `
MODE: Quiz Mode - Adaptive Testing

Your role:
- Generate ${examConfig?.examType || 'mixed format'} questions at ${examConfig?.difficultyLevel || 'intermediate'} difficulty
- Provide detailed, constructive feedback on answers
- Always cite textbook pages in explanations
- Track performance and adjust difficulty
${examConfig ? `- Focus questions on learning objectives
- Include questions that test understanding of common pitfalls
- Match the actual exam format (${examConfig.examType})
- Consider time constraints (${examConfig.timeConstraints || 'N/A'} min)` : ''}

Question distribution:
${examConfig?.examType === 'multiple-choice' ? '- All multiple choice with 4 options' : ''}
${examConfig?.examType === 'essay' ? '- Essay questions with clear rubrics' : ''}
${examConfig?.examType === 'short-answer' ? '- Short answer questions (2-3 sentences)' : ''}
${examConfig?.examType === 'practical' ? '- Application/problem-solving questions' : ''}
${!examConfig || examConfig.examType === 'mixed' ? `- 40% conceptual understanding
- 30% application/problem-solving
- 20% recall/definitions
- 10% analysis/synthesis` : ''}

Feedback style:
- Specific and actionable
- Explain WHY answers are correct/incorrect
- Provide partial credit when appropriate
- Reference textbook pages for review
${examConfig ? '- Relate feedback to exam objectives' : ''}`
  };

  return basePrompt + '\n\n' + modeInstructions[mode];
};

// Update callClaude function to pass examConfig
export const callClaude = async (userMessage, mode, pdfContent, progress, examConfig = null) => {
  const systemPrompt = getModePrompt(mode, pdfContent, progress, examConfig);

  // ... rest of API call logic
};
```

### Phase 4: Update Mode Components

**Update QuizMode.jsx to show exam context:**

```jsx
const QuizMode = ({ appState, setAppState }) => {
  const { examConfig } = appState;

  return (
    <div className="flex flex-col h-full">
      {/* Exam Context Banner */}
      {examConfig && (
        <div className="bg-purple-50 border-b border-purple-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Exam Prep Mode: {examConfig.examType.replace('-', ' ').toUpperCase()}
                </p>
                <p className="text-xs text-purple-700">
                  {examConfig.learningObjectives.length} objectives •
                  {examConfig.difficultyLevel} difficulty
                  {examConfig.timeConstraints && ` • ${examConfig.timeConstraints} min`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExamConfig(true)}
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Rest of QuizMode component */}
    </div>
  );
};
```

---

## Example Exam Configurations

### Biology Midterm
```javascript
{
  examType: 'mixed',
  learningObjectives: [
    'Explain cellular respiration and photosynthesis processes',
    'Differentiate between mitosis and meiosis',
    'Describe DNA structure and replication',
    'Understand Mendelian genetics and Punnett squares'
  ],
  difficultyLevel: 'intermediate',
  commonPitfalls: [
    'Students confuse electron acceptors in cellular respiration',
    'Mixing up prophase stages in mitosis vs meiosis',
    'Forgetting to account for crossing over in genetic problems'
  ],
  timeConstraints: 90,
  specialInstructions: 'Formulas and diagrams will be provided. Focus on conceptual understanding and application.'
}
```

### Calculus Final
```javascript
{
  examType: 'short-answer',
  learningObjectives: [
    'Compute derivatives using all rules (chain, product, quotient)',
    'Apply integration techniques (substitution, parts, partial fractions)',
    'Solve optimization problems',
    'Understand fundamental theorem of calculus'
  ],
  difficultyLevel: 'advanced',
  commonPitfalls: [
    'Forgetting chain rule on composite functions',
    'Sign errors in integration by parts',
    'Not checking endpoints in optimization problems',
    'Confusing definite and indefinite integrals'
  ],
  timeConstraints: 120,
  specialInstructions: 'Calculator allowed. Show all work for partial credit. 60% computation, 40% word problems.'
}
```

### History Essay Exam
```javascript
{
  examType: 'essay',
  learningObjectives: [
    'Analyze causes of World War I',
    'Compare economic policies of Roosevelt and Hoover',
    'Evaluate impact of Civil Rights Movement',
    'Synthesize themes across time periods'
  ],
  difficultyLevel: 'intermediate',
  commonPitfalls: [
    'Students write narratives instead of analytical essays',
    'Failing to use specific historical evidence',
    'Not addressing counter-arguments',
    'Poor thesis statements'
  ],
  timeConstraints: 180,
  specialInstructions: 'Choose 3 of 5 essay prompts. Open note. Must cite at least 3 primary sources per essay.'
}
```

---

## Supabase Integration (if using database)

**Add to existing exam_configurations table:**

```sql
CREATE TABLE exam_configurations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  material_id uuid REFERENCES study_materials(id),
  exam_type text NOT NULL,
  learning_objectives text[],
  difficulty_level text,
  common_pitfalls text[],
  time_constraints integer,
  special_instructions text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_exam_config_material ON exam_configurations(material_id);
```

**Save/Load functions:**

```javascript
// src/utils/examConfigDB.js
import { supabase } from './supabaseClient';

export const saveExamConfig = async (materialId, config) => {
  const { data, error } = await supabase
    .from('exam_configurations')
    .upsert({
      material_id: materialId,
      ...config,
      updated_at: new Date()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getExamConfig = async (materialId) => {
  const { data, error } = await supabase
    .from('exam_configurations')
    .select('*')
    .eq('material_id', materialId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore "not found"
  return data;
};
```

---

## Progress Tracking Enhancements

**Show exam readiness in ProgressDashboard.jsx:**

```jsx
{examConfig && (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Target className="w-5 h-5 mr-2 text-green-600" />
      Exam Readiness
    </h3>

    {/* Learning Objectives Progress */}
    <div className="space-y-3">
      {examConfig.learningObjectives.map((objective, index) => {
        const isCovered = progress.topicsStudied.some(topic =>
          objective.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(objective.toLowerCase())
        );

        return (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isCovered ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {isCovered && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${isCovered ? 'text-gray-900' : 'text-gray-500'}`}>
              {objective}
            </span>
          </div>
        );
      })}
    </div>

    {/* Overall Readiness Score */}
    <div className="mt-6 pt-6 border-t">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Overall Readiness</span>
        <span className="text-sm font-bold text-gray-900">
          {calculateReadiness(examConfig, progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
          style={{ width: `${calculateReadiness(examConfig, progress)}%` }}
        />
      </div>
    </div>
  </div>
)}
```

---

## Benefits Summary

### For Students:
- **Focused Study** - No wasted time on irrelevant topics
- **Exam Confidence** - Know exactly what to expect
- **Better Preparation** - Practice with realistic questions
- **Avoid Mistakes** - Learn common pitfalls before the exam

### For Claude:
- **Context-Aware Teaching** - Tailored to specific exam format
- **Targeted Questions** - Quiz matches actual exam style
- **Relevant Examples** - Focus on testable concepts
- **Strategic Feedback** - Address common misconceptions

---

## Next Steps

1. **Implement ExamConfigModal component**
2. **Update App.js to show Exam Setup button**
3. **Enhance Claude prompts with exam context**
4. **Add exam readiness tracking to dashboard**
5. **Test with real exam scenarios**
6. **Optional: Save to Supabase for persistence**

**Ready to implement? This will significantly boost exam preparation effectiveness!**
