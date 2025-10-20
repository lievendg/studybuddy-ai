import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { callClaude } from '../../utils/claudeAPI';
import { updateConversationHistory, updateProgress } from '../../utils/stateManager';
import { Brain, Send, Loader, CheckCircle, XCircle, Sparkles, Award, Trophy, Medal } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

// Grading thresholds based on exam guidance
const GRADING_THRESHOLDS = {
  DISTINCTION: 90, // 90%+ = Pass with Distinction
  MERIT: 76,       // 76%-90% = Pass with Merit
  PASS: 55,        // 55%-75% = Pass
  FAIL: 0          // Below 55% = Fail
};

// Calculate grade level based on percentage
const getGradeLevel = (percentage) => {
  if (percentage >= GRADING_THRESHOLDS.DISTINCTION) {
    return {
      level: 'DISTINCTION',
      label: 'Pass with Distinction',
      color: 'from-sage-500 to-green-600',
      badgeVariant: 'sage',
      icon: Trophy
    };
  } else if (percentage >= GRADING_THRESHOLDS.MERIT) {
    return {
      level: 'MERIT',
      label: 'Pass with Merit',
      color: 'from-primary-500 to-blue-600',
      badgeVariant: 'default',
      icon: Award
    };
  } else if (percentage >= GRADING_THRESHOLDS.PASS) {
    return {
      level: 'PASS',
      label: 'Pass',
      color: 'from-warm-500 to-orange-600',
      badgeVariant: 'warm',
      icon: Medal
    };
  } else {
    return {
      level: 'FAIL',
      label: 'Not Yet Passing',
      color: 'from-secondary-400 to-gray-600',
      badgeVariant: 'secondary',
      icon: null
    };
  }
};

const QuizMode = ({ appState, setAppState }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Debounce timer ref
  const debounceTimer = useRef(null);

  // Calculate current grade
  const percentage = appState.progress.questionsAnswered > 0
    ? Math.round((appState.progress.correctAnswers / appState.progress.questionsAnswered) * 100)
    : 0;
  const gradeInfo = getGradeLevel(percentage);

  const startQuiz = async () => {
    setQuizStarted(true);
    setLoading(true);

    try {
      const response = await callClaude(
        'Generate a quiz question based on the textbook content.',
        'quiz',
        appState.pdf.content,
        [],
        appState.progress,
        appState.examConfig,
        appState.examMaterials
      );

      if (response.success) {
        if (response.isMock) {
          setIsMockMode(true);
        }
        setCurrentQuestion(response.message);
      }
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Core submit logic without debouncing
  const submitAnswerCore = useCallback(async () => {
    if (!userInput.trim() || loading) return;

    const userAnswer = userInput.trim();
    setLoading(true);

    try {
      const evaluationPrompt = `Question: ${currentQuestion}

Student's Answer: ${userAnswer}

Please evaluate this answer and provide:
1. Is it correct? (Yes/No/Partial)
2. Detailed feedback
3. Page references from the textbook
4. The correct answer if they got it wrong`;

      const response = await callClaude(
        evaluationPrompt,
        'quiz',
        appState.pdf.content,
        appState.session.conversationHistory,
        appState.progress,
        appState.examConfig,
        appState.examMaterials
      );

      if (response.success) {
        setFeedback(response.message);
        setUserInput('');

        // Update progress
        const isCorrect = response.message.toLowerCase().includes('correct: yes');
        setAppState(prev => ({
          ...prev,
          session: {
            ...prev.session,
            conversationHistory: updateConversationHistory(
              prev.session.conversationHistory,
              userAnswer,
              response.message
            )
          },
          progress: updateProgress(prev.progress, {
            type: 'QUESTION_ANSWERED',
            data: { isCorrect, topic: 'general' }
          })
        }));
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setLoading(false);
    }
  }, [userInput, loading, currentQuestion, appState, setAppState]);

  // Debounced submit function
  const submitAnswer = useCallback(() => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      submitAnswerCore();
    }, 300); // 300ms debounce
  }, [submitAnswerCore]);

  const nextQuestion = async () => {
    setFeedback(null);
    setUserInput('');
    setLoading(true);

    try {
      const response = await callClaude(
        'Generate a new quiz question. Make it different from previous questions.',
        'quiz',
        appState.pdf.content,
        appState.session.conversationHistory,
        appState.progress,
        appState.examConfig,
        appState.examMaterials
      );

      if (response.success) {
        setCurrentQuestion(response.message);
      }
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Allow Enter key to create new lines in textarea
  // Submit only happens when user clicks the Submit button

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-warm-50/50 to-white">
      <div className="border-b border-gray-200/60 px-6 py-5 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-warm-100 rounded-lg mr-3">
              <Brain className="w-6 h-6 text-warm-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quiz Mode</h2>
              <p className="text-sm text-secondary-600">Test your knowledge with adaptive questions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {appState.progress.questionsAnswered > 0 && (
              <>
                <Badge variant="warm" className="px-3 py-1.5">
                  Score: {appState.progress.correctAnswers}/{appState.progress.questionsAnswered}
                  {' '}
                  ({percentage}%)
                </Badge>
                <Badge variant={gradeInfo.badgeVariant} className="px-3 py-1.5 flex items-center gap-2">
                  {gradeInfo.icon && <gradeInfo.icon className="w-4 h-4" />}
                  {gradeInfo.label}
                </Badge>
              </>
            )}
            {isMockMode && (
              <Badge variant="accent">
                Mock Mode
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!quizStarted ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 bg-warm-100 rounded-2xl mb-6">
              <Brain className="w-20 h-20 text-warm-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Ready to Test Your Knowledge?
            </h3>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              Answer adaptive questions based on your textbook and track your progress
            </p>

            {/* Grading Information */}
            <Card className="max-w-md mx-auto mb-8 shadow-soft-md">
              <CardHeader>
                <CardTitle className="text-base text-center">Grading Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-sage-600" />
                    <span className="text-sm font-medium">Pass with Distinction</span>
                  </div>
                  <Badge variant="sage" className="text-xs">90%+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium">Pass with Merit</span>
                  </div>
                  <Badge variant="default" className="text-xs">76-90%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-warm-600" />
                    <span className="text-sm font-medium">Pass</span>
                  </div>
                  <Badge variant="warm" className="text-xs">55-75%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4" /> {/* Spacer */}
                    <span className="text-sm font-medium text-secondary-600">Not Yet Passing</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">&lt;55%</Badge>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={startQuiz}
              size="lg"
              variant="warm"
              className="shadow-soft-lg hover:shadow-soft-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Grade Progress Indicator */}
            {appState.progress.questionsAnswered > 0 && (
              <Card className="shadow-soft-md bg-gradient-to-r from-warm-50 to-primary-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {gradeInfo.icon && <gradeInfo.icon className="w-5 h-5 text-gray-700" />}
                      <span className="font-semibold text-gray-900">Current Grade: {gradeInfo.label}</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradeInfo.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                    {/* Threshold markers */}
                    <div className="absolute top-0 left-[55%] w-0.5 h-full bg-warm-700 opacity-40" />
                    <div className="absolute top-0 left-[76%] w-0.5 h-full bg-primary-700 opacity-40" />
                    <div className="absolute top-0 left-[90%] w-0.5 h-full bg-sage-700 opacity-40" />
                  </div>

                  <div className="flex justify-between text-xs text-secondary-600 mt-2">
                    <span>0%</span>
                    <span className="text-warm-700">Pass: 55%</span>
                    <span className="text-primary-700">Merit: 76%</span>
                    <span className="text-sage-700">Distinction: 90%</span>
                    <span>100%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question */}
            {currentQuestion && (
              <Card className="shadow-soft-md">
                <CardHeader>
                  <CardTitle className="text-base text-secondary-600 font-medium">Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{currentQuestion}</p>
                </CardContent>
              </Card>
            )}

            {/* Answer Input or Feedback */}
            {!feedback ? (
              <Card className="shadow-soft-md">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Your Answer
                    </label>
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer here... (Press Enter for new lines)"
                      rows="6"
                      disabled={loading}
                      className="text-base"
                    />
                  </div>
                  <Button
                    onClick={submitAnswer}
                    disabled={!userInput.trim() || loading}
                    variant="warm"
                    className="w-full shadow-soft-md"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Feedback */}
                <Card className={
                  feedback.toLowerCase().includes('correct: yes')
                    ? 'bg-gradient-to-br from-sage-50 to-green-50 border-sage-200 shadow-soft-lg'
                    : 'bg-gradient-to-br from-accent-50 to-red-50 border-accent-200 shadow-soft-lg'
                }>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {feedback.toLowerCase().includes('correct: yes') ? (
                        <>
                          <div className="p-2 bg-sage-100 rounded-lg mr-3">
                            <CheckCircle className="w-6 h-6 text-sage-700" />
                          </div>
                          <h3 className="text-xl font-semibold text-sage-900">Correct!</h3>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-accent-100 rounded-lg mr-3">
                            <XCircle className="w-6 h-6 text-accent-700" />
                          </div>
                          <h3 className="text-xl font-semibold text-accent-900">Not Quite</h3>
                        </>
                      )}
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{feedback}</p>
                  </CardContent>
                </Card>

                {/* Next Question Button */}
                <Button
                  onClick={nextQuestion}
                  disabled={loading}
                  variant="warm"
                  size="lg"
                  className="w-full shadow-soft-md"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Next Question'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

QuizMode.propTypes = {
  appState: PropTypes.shape({
    pdf: PropTypes.shape({
      content: PropTypes.string,
      metadata: PropTypes.object,
      isLoaded: PropTypes.bool
    }).isRequired,
    session: PropTypes.shape({
      mode: PropTypes.string,
      conversationHistory: PropTypes.array,
      currentTopic: PropTypes.string
    }).isRequired,
    progress: PropTypes.shape({
      questionsAnswered: PropTypes.number,
      correctAnswers: PropTypes.number,
      topicsStudied: PropTypes.array,
      weakAreas: PropTypes.array,
      conceptMastery: PropTypes.object
    }).isRequired,
    examConfig: PropTypes.object
  }).isRequired,
  setAppState: PropTypes.func.isRequired
};

export default QuizMode;
