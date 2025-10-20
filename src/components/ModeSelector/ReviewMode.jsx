import { useState } from 'react';
import { callClaude } from '../../utils/claudeAPI';
import { updateConversationHistory } from '../../utils/stateManager';
import { Search, Send, Loader, Book } from 'lucide-react';

const ReviewMode = ({ appState, setAppState }) => {
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
      // Call Claude API in review mode
      const response = await callClaude(
        userMessage,
        'review',
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

  const suggestedQuestions = [
    'What are the main topics covered in this textbook?',
    'Can you summarize Chapter 1?',
    'What does [term] mean?',
    'Where can I find information about [topic]?'
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Search className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Review Mode</h2>
              <p className="text-sm text-gray-600">Search and review material from your textbook</p>
            </div>
          </div>
          {isMockMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-1">
              <p className="text-xs text-yellow-800 font-medium">
                Mock Mode - Add API key to .env for real AI
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Review Your Material
            </h3>
            <p className="text-gray-600 mb-6">
              Ask questions or search for specific topics in your textbook
            </p>
            <div className="max-w-md mx-auto space-y-2 text-left">
              <p className="text-sm text-gray-500 mb-3">Suggested questions:</p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setUserInput(question)}
                  className="block w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={'max-w-3xl px-4 py-3 rounded-lg ' +
                  (msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : msg.role === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900')
                }
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-lg">
              <Loader className="w-5 h-5 text-gray-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t bg-white px-6 py-4">
        <div className="flex space-x-3">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or search for a topic..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="2"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ReviewMode;
