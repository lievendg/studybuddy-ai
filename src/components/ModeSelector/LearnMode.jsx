import { useState } from 'react';
import { callClaude } from '../../utils/claudeAPI';
import { updateConversationHistory } from '../../utils/stateManager';
import { BookOpen, Send, Loader } from 'lucide-react';

const LearnMode = ({ appState, setAppState }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isMockMode, setIsMockMode] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setLoading(true);

    // Add user message to display
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      // Call Claude API
      const response = await callClaude(
        userMessage,
        'learn',
        appState.pdf.content,
        appState.session.conversationHistory,
        appState.progress,
        appState.examConfig,
        appState.examMaterials
      );

      if (response.success) {
        // Check if mock mode
        if (response.isMock) {
          setIsMockMode(true);
        }

        // Add assistant response to display
        setMessages([...newMessages, { role: 'assistant', content: response.message }]);

        // Update app state with new conversation history
        setAppState(prev => ({
          ...prev,
          session: {
            ...prev.session,
            conversationHistory: updateConversationHistory(
              prev.session.conversationHistory,
              userMessage,
              response.message
            )
          }
        }));
      } else {
        // Handle error
        setMessages([...newMessages, {
          role: 'error',
          content: response.message
        }]);
      }
    } catch (error) {
      setMessages([...newMessages, {
        role: 'error',
        content: 'Failed to get response. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Learn Mode</h2>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Ask questions and explore concepts</p>
            </div>
          </div>
          {isMockMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md px-2 sm:px-3 py-1 ml-2">
              <p className="text-xs text-yellow-800 font-medium">
                <span className="hidden sm:inline">Mock Mode - Add API key to .env for real AI</span>
                <span className="sm:hidden">Mock</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 sm:space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start Learning!
            </h3>
            <p className="text-gray-600 mb-6">
              Ask me anything about your textbook
            </p>
            <div className="max-w-md mx-auto space-y-2 text-left">
              <p className="text-sm text-gray-500">Try asking:</p>
              <button
                onClick={() => setUserInput('Explain the main concepts in Chapter 1')}
                className="block w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700"
              >
                "Explain the main concepts in Chapter 1"
              </button>
              <button
                onClick={() => setUserInput('What are the key takeaways from this material?')}
                className="block w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700"
              >
                "What are the key takeaways from this material?"
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={'max-w-[85%] sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ' +
                  (msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.role === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900')
                }
              >
                <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <Loader className="w-5 h-5 text-gray-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t bg-white px-3 sm:px-6 py-3 sm:py-4 safe-area-bottom">
        <div className="flex space-x-2 sm:space-x-3">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || loading}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center touch-target"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 hidden sm:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default LearnMode;
