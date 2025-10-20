import { useState, useRef } from 'react';
import { processPDF } from '../../utils/pdfProcessor';
import { uploadPDF, saveMaterial } from '../../utils/supabaseClient';
import { Upload, FileText, AlertCircle, Library } from 'lucide-react';

const FileUpload = ({ appState, setAppState, user, onUploadComplete, onOpenLibrary }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [materialType, setMaterialType] = useState('study'); // NEW: track material type
  const inputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

 // Process the uploaded file
const handleFile = async (file) => {
  setError('');

  // Validate file type
  if (file.type !== 'application/pdf') {
    setError('Please upload a PDF file');
    return;
  }

  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    setError('File size must be less than 50MB');
    return;
  }

  setUploading(true);

  try {
    // Process the PDF and extract text
    console.log('Starting PDF processing...');
    const pdfData = await processPDF(file);
    console.log('PDF processed successfully');
    console.log(`Extracted ${pdfData.fullText.length} characters from ${pdfData.metadata.numPages} pages`);

    let materialId = null;
    let filePath = null;

    // If user is authenticated, save to Supabase
    if (user) {
      try {
        console.log('Uploading PDF to Supabase Storage...');
        filePath = await uploadPDF(file, user.id);
        console.log('PDF uploaded to storage:', filePath);

        // Save material metadata to database
        console.log('Saving material metadata to database...');
        const material = await saveMaterial({
          user_id: user.id,
          title: pdfData.metadata.title,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          num_pages: pdfData.metadata.numPages,
          content_text: pdfData.fullText,
          metadata: pdfData.metadata,
          material_type: materialType // NEW: Include material type
        });
        materialId = material.id;
        console.log('Material saved to database:', materialId);
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Continue with local-only mode if Supabase fails
        setError('Note: File saved locally only. Database save failed.');
      }
    }

    // Update app state with processed PDF data
    setAppState(prev => ({
      ...prev,
      pdf: {
        file: file,
        content: pdfData.fullText,
        pages: pdfData.pages,
        metadata: {
          ...pdfData.metadata,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadDate: new Date().toISOString(),
          textLength: pdfData.fullText.length,
          wordCount: pdfData.fullText.split(/\s+/).filter(word => word.length > 0).length
        },
        isLoaded: true,
        materialId: materialId, // Store material ID for progress tracking
        filePath: filePath
      }
    }));

    console.log('PDF uploaded and processed successfully:', file.name);

    // Call completion callback if provided
    if (onUploadComplete) {
      onUploadComplete();
    }
  } catch (err) {
    setError('Failed to process PDF. Please try again.');
    console.error('Upload/processing error:', err);
  } finally {
    setUploading(false);
  }
};

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Open file dialog
  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Study Material
          </h2>
          <p className="text-sm text-gray-600">
            Upload a PDF file to start your study session
          </p>

          {/* My Library button for authenticated users */}
          {user && onOpenLibrary && (
            <div className="mt-4">
              <button
                onClick={onOpenLibrary}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Library className="w-4 h-4" />
                <span>My Library</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                or upload a new material below
              </p>
            </div>
          )}
        </div>

        {/* Material Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of material are you uploading?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMaterialType('study')}
              className={`p-4 border-2 rounded-lg transition-all ${
                materialType === 'study'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <FileText className={`w-6 h-6 ${materialType === 'study' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`font-semibold mb-1 ${materialType === 'study' ? 'text-blue-900' : 'text-gray-900'}`}>
                Study Material
              </h3>
              <p className="text-xs text-gray-600">
                Textbooks, lecture notes, course content
              </p>
            </button>

            <button
              onClick={() => setMaterialType('exam')}
              className={`p-4 border-2 rounded-lg transition-all ${
                materialType === 'exam'
                  ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className={`w-6 h-6 ${materialType === 'exam' ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`font-semibold mb-1 ${materialType === 'exam' ? 'text-purple-900' : 'text-gray-900'}`}>
                Exam Material
              </h3>
              <p className="text-xs text-gray-600">
                Past exams, sample questions, answer keys
              </p>
            </button>
          </div>

          {materialType === 'exam' && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                <strong>Note:</strong> Exam materials help Claude understand question formats and create more relevant quiz questions.
              </p>
            </div>
          )}
        </div>

        {/* Drag and Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleChange}
          />

          {uploading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600">Processing PDF...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {dragActive ? 'Drop your PDF here' : 'Drag and drop your PDF here'}
              </p>
              <p className="text-sm text-gray-600 mb-4">or</p>
              <button
                onClick={onButtonClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                PDF files only, up to 50MB
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;