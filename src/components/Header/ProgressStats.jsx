import { Target, Award, BookOpen } from 'lucide-react';
import { getAccuracy } from '../../utils/stateManager';

const ProgressStats = ({ progress }) => {
  const accuracy = getAccuracy(progress);

  return (
    <div className="flex items-center space-x-6 text-sm">
      {/* Questions Answered */}
      <div className="flex items-center space-x-2">
        <Target className="w-4 h-4 text-blue-600" />
        <span className="text-gray-600">Questions:</span>
        <span className="font-semibold text-gray-900">{progress.questionsAnswered}</span>
      </div>

      {/* Accuracy */}
      {progress.questionsAnswered > 0 && (
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">Accuracy:</span>
          <span className="font-semibold text-gray-900">{accuracy}%</span>
        </div>
      )}

      {/* Topics */}
      {progress.topicsStudied.length > 0 && (
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-yellow-600" />
          <span className="text-gray-600">Topics:</span>
          <span className="font-semibold text-gray-900">{progress.topicsStudied.length}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressStats;
