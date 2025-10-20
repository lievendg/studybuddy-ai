import { useState, useEffect } from 'react';
import { Library, Settings, FileText, BookOpen, MessageSquare, Brain, BarChart3 } from 'lucide-react';
import FileUpload from './components/Header/FileUpload';
import LearnMode from './components/ModeSelector/LearnMode';
import ReviewMode from './components/ModeSelector/ReviewMode';
import QuizMode from './components/ModeSelector/QuizMode';
import ProgressDashboard from './components/Dashboard/ProgressDashboard';
import ProgressStats from './components/Header/ProgressStats';
import AuthModal from './components/Auth/AuthModal';
import UserProfile from './components/Auth/UserProfile';
import MaterialLibrary from './components/Library/MaterialLibrary';
import InstallPrompt from './components/PWA/InstallPrompt';
import ExamConfigModal from './components/ExamConfig/ExamConfigModal';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { switchMode } from './utils/stateManager';
import { onAuthStateChange, isSupabaseConfigured, getMaterials } from './utils/supabaseClient';

function App() {
  const [appState, setAppState] = useState({
    pdf: {
      content: null,
      metadata: {},
      isLoaded: false,
      sections: [],
      materialId: null,
      filePath: null,
      materialType: null // NEW: Track if current material is 'study' or 'exam'
    },
    examMaterials: [], // NEW: Array of all loaded exam materials for reference
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
    },
    examConfig: null  // Exam configuration from modal
  });

  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showExamConfig, setShowExamConfig] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showUpload, setShowUpload] = useState(false); // NEW: Control upload screen visibility

  // Check authentication status on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, running in local-only mode');
      setAuthChecked(true);
      return;
    }

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user || null);
      setAuthChecked(true);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleModeChange = (newMode) => {
    setAppState(prev => switchMode(prev, newMode));
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setUser(null);
    // Reset app state on sign out
    setAppState({
      pdf: {
        content: null,
        metadata: {},
        isLoaded: false,
        sections: [],
        materialId: null,
        filePath: null
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
      },
      examConfig: null
    });
  };

  const handleSaveExamConfig = (config) => {
    setAppState(prev => ({
      ...prev,
      examConfig: config
    }));
    console.log('Exam config saved:', config);
  };

  const handleSelectMaterial = async (material) => {
    try {
      console.log('Loading material:', material.title, 'Type:', material.material_type);

      // If this is a study material, also load all associated exam materials
      let examMaterialsToLoad = [];
      if (material.material_type === 'study' && user) {
        console.log('Loading exam materials for study material:', material.id);
        try {
          const allMaterials = await getMaterials(user.id);
          // Get all exam materials (optionally filter by linked_study_material_id in future)
          examMaterialsToLoad = allMaterials.filter(m => m.material_type === 'exam');
          console.log(`Found ${examMaterialsToLoad.length} exam materials`);
        } catch (err) {
          console.warn('Failed to load exam materials:', err);
          // Continue without exam materials
        }
      }

      // Process PDF text if we have it
      setAppState(prev => ({
        ...prev,
        pdf: {
          content: material.content_text,
          metadata: {
            ...material.metadata,
            name: material.file_name,
            size: (material.file_size / 1024 / 1024).toFixed(2) + ' MB',
            uploadDate: material.created_at,
            title: material.title
          },
          isLoaded: true,
          materialId: material.id,
          filePath: material.file_path,
          materialType: material.material_type,
          pages: [] // We don't store pages in DB, only full text
        },
        examMaterials: examMaterialsToLoad, // Store exam materials for Claude to reference
        session: {
          mode: 'learn',
          conversationHistory: [],
          currentTopic: null,
          startTime: new Date()
        }
      }));

      setShowLibrary(false);
    } catch (error) {
      console.error('Failed to load material:', error);
      alert('Failed to load material. Please try again.');
    }
  };

  const handleChangePDF = () => {
    if (user) {
      setShowLibrary(true);
    } else {
      window.location.reload();
    }
  };

  const handleUploadNew = () => {
    // Clear the current PDF and show upload screen
    setAppState(prev => ({
      ...prev,
      pdf: {
        content: null,
        metadata: {},
        isLoaded: false,
        sections: [],
        materialId: null,
        filePath: null,
        materialType: null
      },
      examMaterials: []
    }));
    setShowLibrary(false);
    setShowUpload(true);
  };

  // Show loading state while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show library view
  if (showLibrary && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sage-50">
        <MaterialLibrary
          user={user}
          onSelectMaterial={handleSelectMaterial}
          onClose={() => setShowLibrary(false)}
          onUploadNew={handleUploadNew}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sage-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm shadow-soft-md border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-sage-600 bg-clip-text text-transparent">StudyBuddy AI</h1>
            <div className="flex items-center space-x-3">
              {appState.pdf.isLoaded && (
                <ProgressStats progress={appState.progress} />
              )}

              {/* Exam Materials Indicator */}
              {appState.pdf.isLoaded && appState.examMaterials.length > 0 && (
                <Badge variant="sage" className="flex items-center space-x-2 px-3 py-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {appState.examMaterials.length} Exam Material{appState.examMaterials.length !== 1 ? 's' : ''}
                  </span>
                </Badge>
              )}

              {/* Exam Config Button */}
              {appState.pdf.isLoaded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExamConfig(true)}
                  className="relative"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Exam Setup</span>
                  {appState.examConfig && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-sage-500 rounded-full" />
                  )}
                </Button>
              )}

              {/* Library Button (for authenticated users) */}
              {user && appState.pdf.isLoaded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLibrary(true)}
                >
                  <Library className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Library</span>
                </Button>
              )}

              {/* Change PDF Button */}
              {appState.pdf.isLoaded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChangePDF}
                >
                  Change PDF
                </Button>
              )}

              {/* Auth Section */}
              {isSupabaseConfigured() && (
                <>
                  {user ? (
                    <UserProfile user={user} onSignOut={handleSignOut} />
                  ) : (
                    <Button
                      onClick={() => setShowAuthModal(true)}
                      size="sm"
                    >
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {appState.pdf.isLoaded && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-2 py-3">
              <Button
                variant={appState.session.mode === 'learn' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('learn')}
                className={appState.session.mode === 'learn' ? 'shadow-soft-md' : ''}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learn
              </Button>
              <Button
                variant={appState.session.mode === 'review' ? 'sage' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('review')}
                className={appState.session.mode === 'review' ? 'shadow-soft-md' : ''}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Review
              </Button>
              <Button
                variant={appState.session.mode === 'quiz' ? 'warm' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('quiz')}
                className={appState.session.mode === 'quiz' ? 'shadow-soft-md' : ''}
              >
                <Brain className="w-4 h-4 mr-2" />
                Quiz
              </Button>
              <Button
                variant={appState.session.mode === 'dashboard' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('dashboard')}
                className={appState.session.mode === 'dashboard' ? 'shadow-soft-md' : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Progress
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        {!appState.pdf.isLoaded || showUpload ? (
          <FileUpload
            appState={appState}
            setAppState={setAppState}
            user={user}
            onUploadComplete={() => setShowUpload(false)}
            onOpenLibrary={() => {
              setShowUpload(false);
              setShowLibrary(true);
            }}
          />
        ) : (
          <div className="h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft-lg border border-gray-200/60 overflow-hidden">
            <ErrorBoundary>
              {appState.session.mode === 'learn' && (
                <LearnMode appState={appState} setAppState={setAppState} />
              )}
              {appState.session.mode === 'review' && (
                <ReviewMode appState={appState} setAppState={setAppState} />
              )}
              {appState.session.mode === 'quiz' && (
                <QuizMode appState={appState} setAppState={setAppState} />
              )}
              {appState.session.mode === 'dashboard' && (
                <ProgressDashboard appState={appState} />
              )}
            </ErrorBoundary>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <ErrorBoundary>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </ErrorBoundary>

      {/* Exam Config Modal */}
      <ErrorBoundary>
        <ExamConfigModal
          isOpen={showExamConfig}
          onClose={() => setShowExamConfig(false)}
          onSave={handleSaveExamConfig}
          currentConfig={appState.examConfig}
        />
      </ErrorBoundary>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;
