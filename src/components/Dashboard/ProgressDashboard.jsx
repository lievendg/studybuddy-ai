import { BarChart3, TrendingUp, Award, Clock, Target, BookOpen } from 'lucide-react';
import { getSessionDuration, getAccuracy } from '../../utils/stateManager';

const ProgressDashboard = ({ appState }) => {
  const { progress, session, pdf } = appState;
  const accuracy = getAccuracy(progress);
  const sessionTime = getSessionDuration(session.startTime);

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label}</span>
          <span>{value} / {max}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-indigo-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Progress Dashboard</h2>
            <p className="text-sm text-gray-600">Track your learning journey</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              title="Questions Answered"
              value={progress.questionsAnswered}
              color="#6366f1"
              subtitle="Total attempts"
            />
            <StatCard
              icon={Award}
              title="Accuracy"
              value={`${accuracy}%`}
              color="#10b981"
              subtitle={`${progress.correctAnswers} correct`}
            />
            <StatCard
              icon={BookOpen}
              title="Topics Studied"
              value={progress.topicsStudied.length}
              color="#f59e0b"
              subtitle="Unique topics"
            />
            <StatCard
              icon={Clock}
              title="Session Time"
              value={sessionTime}
              color="#8b5cf6"
              subtitle="Active learning"
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                Performance Overview
              </h3>
              <div className="space-y-4">
                <ProgressBar
                  label="Quiz Accuracy"
                  value={progress.correctAnswers}
                  max={progress.questionsAnswered || 1}
                  color="#10b981"
                />
                <ProgressBar
                  label="Topics Explored"
                  value={progress.topicsStudied.length}
                  max={20}
                  color="#6366f1"
                />
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Textbook Progress</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{pdf.metadata.name || 'PDF loaded'}</span>
                    <span className="text-gray-500">{pdf.metadata.numPages || 0} pages</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topics Studied */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                Recent Topics
              </h3>
              {progress.topicsStudied.length > 0 ? (
                <div className="space-y-2">
                  {progress.topicsStudied.slice(-5).reverse().map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3" />
                      <span className="text-sm text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No topics studied yet</p>
                  <p className="text-xs mt-1">Start learning to see your progress!</p>
                </div>
              )}
            </div>
          </div>

          {/* Weak Areas */}
          {progress.weakAreas.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-600" />
                Areas to Review
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {progress.weakAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-3" />
                    <span className="text-sm text-red-900">{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                These topics need more practice. Try reviewing them in Review Mode or Quiz Mode.
              </p>
            </div>
          )}

          {/* Concept Mastery */}
          {Object.keys(progress.conceptMastery).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Concept Mastery
              </h3>
              <div className="space-y-3">
                {Object.entries(progress.conceptMastery).map(([topic, level], index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{topic}</span>
                      <span className="font-medium">Level {level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(level * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {progress.questionsAnswered === 0 && progress.topicsStudied.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Your Learning Journey
              </h3>
              <p className="text-gray-600 mb-6">
                Your progress will appear here as you use Learn, Review, and Quiz modes
              </p>
              <div className="flex justify-center space-x-3">
                <div className="text-sm text-gray-500">
                  Try: <span className="font-medium text-blue-600">Learn Mode</span> to explore concepts
                </div>
                <div className="text-gray-300">"</div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-purple-600">Quiz Mode</span> to test knowledge
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
