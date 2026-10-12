import React, { useState } from 'react';
import {
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  Globe,
  RefreshCw,
  X,
  HardDrive,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { getActiveFirebaseConfig } from '../../lib/firebase.ts';

interface AuthorizedDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain?: string;
  projectId?: string;
  onRetry?: () => void;
}

export const AuthorizedDomainModal: React.FC<AuthorizedDomainModalProps> = ({
  isOpen,
  onClose,
  domain: propDomain,
  projectId: propProjectId,
  onRetry,
}) => {
  const { connectGoogleDrive, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isOpen) return null;

  const currentDomain =
    propDomain || (typeof window !== 'undefined' ? window.location.hostname : 'taupe-cupcake-70b680.netlify.app');
  const activeConfig = getActiveFirebaseConfig();
  const currentProjectId = propProjectId || activeConfig.projectId;
  const consoleAuthSettingsUrl = `https://console.firebase.google.com/project/${currentProjectId}/authentication/settings`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRetrySignIn = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        await connectGoogleDrive();
      }
      onClose();
    } catch {
      // Error handled inside connectGoogleDrive
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Netlify Domain Authorization Required
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Firebase OAuth Error: <code className="bg-black/20 px-1 py-0.5 rounded text-[11px]">auth/unauthorized-domain</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-600">
          {/* Explanation Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-amber-900">
            <Globe className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Why did this happen?</span> Google Firebase protects your account by only allowing Google Sign-In from pre-authorized domains. Because your app is deployed on Netlify at <span className="font-semibold underline decoration-amber-400">{currentDomain}</span>, you need to add this domain once in your Firebase Console.
            </div>
          </div>

          {/* Quick Copy Domain Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Your Netlify Domain to Authorize</span>
              <span className="text-slate-400 font-normal">Firebase Project: {currentProjectId}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs text-slate-800 font-semibold select-all break-all shadow-inner">
                {currentDomain}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Domain'}</span>
              </button>
            </div>
          </div>

          {/* 3 Step Action Guide */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs tracking-wide uppercase text-[11px]">
              How to fix this (Takes ~30 seconds):
            </h3>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">
                    Open Firebase Console Settings
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Navigate to the Authentication settings for project <b>{currentProjectId}</b>.
                  </p>
                  <a
                    href={consoleAuthSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold gap-1.5"
                  >
                    <span>Open Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">
                    Add Authorized Domain
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Under the <b>&ldquo;Authorized domains&rdquo;</b> list, click <b>&ldquo;Add domain&rdquo;</b>, paste <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">{currentDomain}</code>, and click <b>Add</b>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">
                    Retry Sign-In
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Changes apply immediately! Click the button below to connect your Google Drive.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Offline / Local Storage Assurance */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-slate-500" />
              <span>
                <b>Local storage is active:</b> All marks, syllabus progress, and test papers continue saving locally. Google Drive is optional.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Continue with Local Storage
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveTab('settings');
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={handleRetrySignIn}
              disabled={isRetrying}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-300 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Connecting...' : 'Retry Google Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
