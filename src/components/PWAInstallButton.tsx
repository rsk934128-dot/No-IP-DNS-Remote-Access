import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'nav' | 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'nav',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const installed = await install();
    if (installed) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  // Android / Chrome / Desktop PWA install
  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer ${className}`}
          title="Install No-IP App to Device"
        >
          {installSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Installed!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>Install App</span>
            </>
          )}
        </button>
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer ${className}`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#ff6600]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/pwa-192x192.png"
                  alt="No-IP App Icon"
                  className="w-12 h-12 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-base text-[#0a2540] dark:text-white">
                    Install No-IP App
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add to your iPhone / iPad Home Screen
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ff6600] text-white flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  <p>
                    Tap the <strong className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white"><Share className="w-3 h-3" /> Share</strong> button at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ff6600] text-white flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <p>
                    Scroll down and select <strong className="font-semibold text-slate-900 dark:text-white">"Add to Home Screen"</strong> (+ icon).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ff6600] text-white flex items-center justify-center font-bold text-[11px]">
                    3
                  </span>
                  <p>
                    Tap <strong className="font-semibold text-emerald-600 dark:text-emerald-400">"Add"</strong> in the top right corner.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#0a2540] dark:bg-slate-800 hover:bg-[#07192c] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback banner for standard browsers to preview app installability
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer ${className}`}
        title="Install Web App on Mobile or Desktop"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#ff6600]" />
        <span>Install App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/pwa-192x192.png"
                alt="No-IP App Icon"
                className="w-12 h-12 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="font-bold text-base text-[#0a2540] dark:text-white">
                  Install No-IP App
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick Mobile & Desktop Access
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <p>
                <strong>Chrome / Edge / Android:</strong> Click the install icon in your address bar or browser menu to install directly.
              </p>
              <p>
                <strong>iPhone / iPad Safari:</strong> Tap Share <Share className="w-3 h-3 inline" /> and choose <strong>"Add to Home Screen"</strong>.
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#0a2540] dark:bg-slate-800 hover:bg-[#07192c] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
