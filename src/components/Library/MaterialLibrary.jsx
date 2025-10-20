import { useState, useEffect } from 'react';
import { BookOpen, Trash2, FileText, Calendar, Loader, AlertCircle, Filter, X } from 'lucide-react';
import { getMaterials, deleteMaterial } from '../../utils/supabaseClient';

const MaterialLibrary = ({ user, onSelectMaterial, onClose, onUploadNew }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all'); // NEW: 'all', 'study', 'exam'

  useEffect(() => {
    loadMaterials();
  }, [user]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMaterials(user.id);
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load materials:', err);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId, filePath) => {
    if (!window.confirm('Are you sure you want to delete this material? This cannot be undone.')) {
      return;
    }

    try {
      setDeleting(materialId);
      await deleteMaterial(materialId, filePath);
      setMaterials(materials.filter(m => m.id !== materialId));
    } catch (err) {
      console.error('Failed to delete material:', err);
      alert('Failed to delete material. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSelect = (material) => {
    onSelectMaterial(material);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Filter materials based on selected filter
  const filteredMaterials = materials.filter(material => {
    if (filter === 'all') return true;
    return material.material_type === filter;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Study Materials</h2>
              <p className="text-sm text-gray-600">
                {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'}
                {filter !== 'all' && ` (${materials.length} total)`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onUploadNew}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Upload New PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close library"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('study')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'study'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Study Materials
            </button>
            <button
              onClick={() => setFilter('exam')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'exam'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Exam Materials
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading materials...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">{error}</p>
              <button
                onClick={loadMaterials}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : materials.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">No materials yet</p>
              <p className="text-gray-600 text-sm mb-4">
                Upload your first PDF to get started
              </p>
              <button
                onClick={onUploadNew}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Card Content */}
                <button
                  onClick={() => handleSelect(material)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      material.material_type === 'exam'
                        ? 'bg-purple-100'
                        : 'bg-blue-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        material.material_type === 'exam'
                          ? 'text-purple-600'
                          : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {material.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                          material.material_type === 'exam'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {material.material_type === 'exam' ? 'Exam' : 'Study'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {material.file_name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pages</span>
                      <span className="font-medium text-gray-900">
                        {material.num_pages || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium text-gray-900">
                        {formatFileSize(material.file_size)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t">
                      <span className="text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(material.created_at)}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Delete Button */}
                <div className="border-t px-4 py-3 bg-gray-50 rounded-b-lg">
                  <button
                    onClick={() => handleDelete(material.id, material.file_path)}
                    disabled={deleting === material.id}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === material.id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialLibrary;
