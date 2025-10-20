import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after 30 seconds, or when user has uploaded a PDF
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install prompt`);

    setDeferredPrompt(null);
    setShowPrompt(false);

    // Store that user has seen the prompt
    localStorage.setItem('installPromptShown', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if user has dismissed before
  if (localStorage.getItem('installPromptDismissed') === 'true') {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Install StudyBuddy</h3>
            <p className="text-sm text-gray-600">Study offline anytime</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-700">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Works offline
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Faster loading
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Native app experience
        </div>
      </div>

      <button
        onClick={handleInstall}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Install App
      </button>
    </div>
  );
};

export default InstallPrompt;
