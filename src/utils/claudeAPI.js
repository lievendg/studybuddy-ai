// Claude API Integration
// Handles all communication with the backend API (which proxies to Claude)

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

// Mode-specific system prompts
export const getModePrompt = (mode, pdfContent, progress, examConfig = null, examMaterials = []) => {
  let baseContext = `You are an expert tutor helping a student learn from their textbook.

STUDY MATERIAL (Main Content):
${pdfContent}

STUDENT PROGRESS:
- Topics studied: ${progress.topicsStudied.join(', ') || 'None yet'}
- Questions answered: ${progress.questionsAnswered}
- Accuracy: ${progress.questionsAnswered > 0 ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100) : 0}%
- Weak areas: ${progress.weakAreas.join(', ') || 'None identified'}
`;

  // Add exam materials context if available
  if (examMaterials && examMaterials.length > 0) {
    baseContext += `\n\n📚 EXAM MATERIALS (Reference for Question Format & Style):
You have access to ${examMaterials.length} exam material(s) to understand the question format, difficulty, and style expected.

`;
    examMaterials.forEach((exam, index) => {
      baseContext += `
${index + 1}. "${exam.title || exam.file_name}"
   Pages: ${exam.num_pages || 'N/A'}
   Content Preview (first 3000 chars):
   ${exam.content_text ? exam.content_text.substring(0, 3000) : 'No content available'}
   ${exam.content_text && exam.content_text.length > 3000 ? '...[content truncated]' : ''}

`;
    });

    baseContext += `
IMPORTANT INSTRUCTIONS FOR USING EXAM MATERIALS:
- Use these exam materials to understand the EXPECTED QUESTION FORMAT
- Match the difficulty level shown in these exam materials
- Pay attention to how questions are phrased and structured
- Notice which topics are emphasized in the exam materials
- Align your quiz questions with the style and format of these exams
- Reference specific question patterns you see in the exam materials
`;
  }

  // Add exam configuration context if available
  if (examConfig) {
    baseContext += `\n\n📋 EXAM PREPARATION CONTEXT:

Exam Type: ${examConfig.examType}
Difficulty Level: ${examConfig.difficultyLevel}

${examConfig.learningObjectives && examConfig.learningObjectives.length > 0 ? `
Learning Objectives (What the student MUST know):
${examConfig.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}
` : ''}

${examConfig.commonPitfalls && examConfig.commonPitfalls.length > 0 ? `
⚠️  Common Pitfalls to Avoid:
${examConfig.commonPitfalls.map((pitfall, i) => `${i + 1}. ${pitfall}`).join('\n')}
` : ''}

${examConfig.timeConstraints ? `
⏱️  Time Constraint: ${examConfig.timeConstraints} minutes
(Consider pacing in your explanations and practice questions)
` : ''}

${examConfig.specialInstructions ? `
Special Instructions:
${examConfig.specialInstructions}
` : ''}

IMPORTANT: All your teaching should be aligned with these exam requirements. Focus on the learning objectives, warn about common pitfalls, and prepare the student specifically for this ${examConfig.examType} exam.
`;
  }

  const modeInstructions = {
    learn: `
MODE: LEARN - Guided Learning
Your role: Patient, expert tutor teaching from the textbook

Instructions:
- Break down concepts step-by-step
- Use analogies and real-world examples
- Always cite specific page numbers from the textbook
- Adjust complexity based on student's progress
- Encourage deeper exploration with follow-up questions
- When student asks "Tell me more", provide detailed explanations
- Focus on understanding over memorization
`,
    review: `
MODE: REVIEW - Q&A and Material Lookup
Your role: Knowledgeable study partner

Instructions:
- Answer questions using ONLY the textbook content
- Always cite page/section references
- Provide relevant excerpts from the text
- Suggest related topics they might want to review
- Keep tone conversational and supportive
- If the answer isn't in the textbook, say so clearly
`,
    quiz: `
MODE: QUIZ - Adaptive Testing
Your role: Adaptive test administrator

Instructions:
- Generate questions at ${examConfig?.difficultyLevel || 'appropriate'} difficulty level
${examConfig ? `- Match the ${examConfig.examType} exam format` : '- Question type distribution: 70% open-ended, 20% fill-in-blank, 10% application'}
- Provide detailed feedback with textbook references
- Focus on weak areas: ${progress.weakAreas.join(', ') || (examConfig?.learningObjectives.length ? 'learning objectives' : 'all topics')}
${examConfig?.learningObjectives?.length ? `- Prioritize these learning objectives:\n  ${examConfig.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n  ')}` : ''}
- After each answer, explain WHY it's correct/incorrect
- Include page numbers for all explanations
- Adjust difficulty based on performance
${examConfig?.commonPitfalls?.length ? `- Test understanding of common pitfalls` : ''}
`
  };

  return baseContext + (modeInstructions[mode] || modeInstructions.learn);
};

// Check if we should use mock mode (when no API key or in development)
const shouldUseMockMode = () => {
  try {
    const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;
    return !apiKey || apiKey === 'your_api_key_here' || apiKey.includes('your-actual');
  } catch {
    return true;
  }
};

// Main API call function
export const callClaude = async (userMessage, mode, pdfContent, conversationHistory, progress, examConfig = null, examMaterials = []) => {
  // Use mock mode if no valid API key
  if (shouldUseMockMode()) {
    console.warn('Using mock mode - no valid API key found');
    return mockClaudeCall(userMessage, mode, pdfContent, examConfig, examMaterials);
  }

  try {
    // Build the messages array
    const messages = [
      // Include conversation history
      ...conversationHistory,
      // Add new user message
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Log exam materials usage
    if (examMaterials && examMaterials.length > 0) {
      console.log(`📚 Using ${examMaterials.length} exam material(s) for context`);
    }

    // Call backend API (proxy to Claude)
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        system: getModePrompt(mode, pdfContent, progress, examConfig, examMaterials),
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      message: data.message,
      usage: data.usage // Token usage for tracking
    };
    
  } catch (error) {
    console.error('Claude API Error:', error);
    
    // Handle specific error types
    if (error.message.includes('API_KEY')) {
      return {
        success: false,
        error: 'API_KEY_MISSING',
        message: 'Please configure your Claude API key in .env file'
      };
    }
    
    if (error.message.includes('rate_limit')) {
      return {
        success: false,
        error: 'RATE_LIMIT',
        message: 'Too many requests. Please wait a moment and try again.'
      };
    }
    
    if (error.message.includes('overloaded')) {
      return {
        success: false,
        error: 'OVERLOADED',
        message: 'Claude is currently overloaded. Please try again in a moment.'
      };
    }
    
    return {
      success: false,
      error: 'UNKNOWN',
      message: error.message || 'Failed to connect to Claude API'
    };
  }
};

// Mock mode for testing without API
const mockClaudeCall = async (userMessage, mode, pdfContent, examConfig = null, examMaterials = []) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const pdfPreview = pdfContent ? pdfContent.substring(0, 200) : 'No PDF content';
  const examNote = examConfig ? `\n\n📋 **Exam Mode**: Preparing for ${examConfig.examType} exam at ${examConfig.difficultyLevel} level` : '';
  const examMaterialsNote = examMaterials && examMaterials.length > 0
    ? `\n\n📚 **Exam Materials Loaded**: Using ${examMaterials.length} exam material(s) as reference for question format and style`
    : '';

  const mockResponses = {
    learn: `Great question! Let me help you understand this concept.

Based on your textbook (first 200 chars: "${pdfPreview}..."), here's a step-by-step explanation:

1. **Key Concept**: This topic is fundamental to understanding the broader subject
2. **Why It Matters**: It connects to other important concepts you'll learn
3. **Real-World Example**: Think of it like [analogy]

**Reference**: See pages 15-20 in your textbook for more details.

Would you like me to explain any part in more detail?${examNote}${examMaterialsNote}

*[Note: This is a MOCK response for testing. Add your Claude API key to .env to use real AI]*`,
    review: `Based on your textbook content, here's the answer:

${userMessage.toLowerCase().includes('what') ? 'The main concept is...' : 'To answer your question...'}

**Key Points:**
- Point 1 from the textbook
- Point 2 with supporting details
- Point 3 connecting to other topics

**Pages Referenced**: 5, 12, 18

Related topics you might want to review:
- Related Topic A
- Related Topic B

*[Note: This is a MOCK response. Add your Claude API key to use real AI]*`,
    quiz: `**Question**: What is the primary function of X in the context of Y?

Please provide your answer in 2-3 sentences, explaining both the function and its significance.

*[Note: This is a MOCK quiz question. Add your Claude API key for real adaptive quizzes]*`
  };

  return {
    success: true,
    message: mockResponses[mode] || mockResponses.learn,
    usage: { input_tokens: 100, output_tokens: 150 },
    isMock: true
  };
};

export default {
  callClaude,
  getModePrompt,
  mockClaudeCall
};
