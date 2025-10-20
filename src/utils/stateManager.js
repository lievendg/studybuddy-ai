// State Management Utilities
// Helper functions for managing application state

// Update conversation history
export const updateConversationHistory = (currentHistory, userMessage, assistantMessage) => {
  return [
    ...currentHistory,
    {
      role: 'user',
      content: userMessage
    },
    {
      role: 'assistant',
      content: assistantMessage
    }
  ];
};

// Update progress after answering a question
export const updateProgress = (currentProgress, action) => {
  const { type, data } = action;
  
  switch (type) {
    case 'QUESTION_ANSWERED':
      return {
        ...currentProgress,
        questionsAnswered: currentProgress.questionsAnswered + 1,
        correctAnswers: data.isCorrect 
          ? currentProgress.correctAnswers + 1 
          : currentProgress.correctAnswers,
        weakAreas: data.isCorrect 
          ? currentProgress.weakAreas 
          : addWeakArea(currentProgress.weakAreas, data.topic)
      };
    
    case 'TOPIC_STUDIED':
      return {
        ...currentProgress,
        topicsStudied: [...new Set([...currentProgress.topicsStudied, data.topic])],
        conceptMastery: {
          ...currentProgress.conceptMastery,
          [data.topic]: (currentProgress.conceptMastery[data.topic] || 0) + 1
        }
      };
    
    case 'RESET_SESSION':
      return {
        questionsAnswered: 0,
        correctAnswers: 0,
        topicsStudied: [],
        weakAreas: [],
        sessionTime: 0,
        conceptMastery: {}
      };
    
    default:
      return currentProgress;
  }
};

// Add topic to weak areas (max 5)
const addWeakArea = (weakAreas, topic) => {
  if (weakAreas.includes(topic)) return weakAreas;
  const newWeakAreas = [...weakAreas, topic];
  return newWeakAreas.slice(-5); // Keep only last 5
};

// Switch modes
export const switchMode = (appState, newMode) => {
  return {
    ...appState,
    session: {
      ...appState.session,
      mode: newMode,
      currentTopic: null
    }
  };
};

// Reset PDF and start over
export const resetApp = () => {
  return {
    pdf: {
      content: null,
      metadata: {},
      isLoaded: false,
      sections: []
    },
    session: {
      mode: 'learn',
      conversationHistory: [],
      currentTopic: null,
      startTime: new Date()
    },
    progress: {
      questionsAnswered: 0,
      correctAnswers: 0,
      topicsStudied: [],
      weakAreas: [],
      sessionTime: 0,
      conceptMastery: {}
    }
  };
};

// Calculate session duration
export const getSessionDuration = (startTime) => {
  const now = new Date();
  const diff = now - new Date(startTime);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes - (hours * 60);
    return hours + 'h ' + remainingMinutes + 'm';
  }
  return minutes + 'm';
};

// Calculate accuracy percentage
export const getAccuracy = (progress) => {
  if (progress.questionsAnswered === 0) return 0;
  return Math.round((progress.correctAnswers / progress.questionsAnswered) * 100);
};

export default {
  updateConversationHistory,
  updateProgress,
  switchMode,
  resetApp,
  getSessionDuration,
  getAccuracy
};
