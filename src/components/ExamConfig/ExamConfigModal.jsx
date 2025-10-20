import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FileText, Target, AlertCircle, Clock, Award, X } from 'lucide-react';

const MAX_OBJECTIVE_LENGTH = 500;
const MAX_PITFALL_LENGTH = 500;
const MAX_OBJECTIVES_COUNT = 20;
const MAX_PITFALLS_COUNT = 20;

const ExamConfigModal = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [config, setConfig] = useState({
    examType: 'mixed',
    learningObjectives: [],
    difficultyLevel: 'intermediate',
    commonPitfalls: [],
    timeConstraints: null,
    specialInstructions: '',
    ...currentConfig
  });

  const [objectiveInput, setObjectiveInput] = useState('');
  const [pitfallInput, setPitfallInput] = useState('');

  // Update config when currentConfig changes (for edit mode)
  useEffect(() => {
    if (currentConfig) {
      setConfig({
        examType: 'mixed',
        learningObjectives: [],
        difficultyLevel: 'intermediate',
        commonPitfalls: [],
        timeConstraints: null,
        specialInstructions: '',
        ...currentConfig
      });
    }
  }, [currentConfig]);

  // ESC key handler for closing modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleAddObjective = () => {
    const sanitized = objectiveInput.trim().slice(0, MAX_OBJECTIVE_LENGTH);
    if (sanitized && config.learningObjectives.length < MAX_OBJECTIVES_COUNT) {
      setConfig({
        ...config,
        learningObjectives: [...config.learningObjectives, sanitized]
      });
      setObjectiveInput('');
    } else if (config.learningObjectives.length >= MAX_OBJECTIVES_COUNT) {
      alert(`Maximum ${MAX_OBJECTIVES_COUNT} learning objectives allowed.`);
    }
  };

  const handleRemoveObjective = (index) => {
    setConfig({
      ...config,
      learningObjectives: config.learningObjectives.filter((_, i) => i !== index)
    });
  };

  const handleAddPitfall = () => {
    const sanitized = pitfallInput.trim().slice(0, MAX_PITFALL_LENGTH);
    if (sanitized && config.commonPitfalls.length < MAX_PITFALLS_COUNT) {
      setConfig({
        ...config,
        commonPitfalls: [...config.commonPitfalls, sanitized]
      });
      setPitfallInput('');
    } else if (config.commonPitfalls.length >= MAX_PITFALLS_COUNT) {
      alert(`Maximum ${MAX_PITFALLS_COUNT} pitfalls allowed.`);
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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-config-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 id="exam-config-title" className="text-xl font-semibold text-gray-900">Exam Configuration</h2>
              <p className="text-sm text-gray-600">Optimize Claude for your specific exam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObjective();
                    }
                  }}
                  placeholder="e.g., Understand cellular respiration process"
                  maxLength={MAX_OBJECTIVE_LENGTH}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Learning objective input"
                />
                <button
                  onClick={handleAddObjective}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPitfall();
                    }
                  }}
                  placeholder="e.g., Students often confuse mitosis and meiosis"
                  maxLength={MAX_PITFALL_LENGTH}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Common pitfall input"
                />
                <button
                  onClick={handleAddPitfall}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 whitespace-nowrap"
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
        <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
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

ExamConfigModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentConfig: PropTypes.shape({
    examType: PropTypes.string,
    learningObjectives: PropTypes.arrayOf(PropTypes.string),
    difficultyLevel: PropTypes.string,
    commonPitfalls: PropTypes.arrayOf(PropTypes.string),
    timeConstraints: PropTypes.number,
    specialInstructions: PropTypes.string
  })
};

export default ExamConfigModal;
