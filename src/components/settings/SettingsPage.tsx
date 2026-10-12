import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  HardDrive,
  Download,
  Upload,
  Sparkles,
  Trash2,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Sliders,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Lock,
  Key,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldAlert,
  Globe,
  Copy,
  Check,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { DEFAULT_SUBJECTS } from '../../lib/storage.ts';
import {
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  resetCustomFirebaseConfig,
} from '../../lib/firebase.ts';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    isDriveConnected,
    driveUserEmail,
    connectGoogleDrive,
    disconnectGoogleDrive,
    isDriveSyncing,
    syncAllPendingFilesToDrive,
    loadDemoRecords,
    removeSampleData,
    resetAllData,
    resetTopicsToOfficialSyllabus,
    exportDatabaseBackup,
    importDatabaseBackup,
    authDomainError,
    setAuthDomainError,
  } = useApp();

  const [syllabusResetMsg, setSyllabusResetMsg] = useState(false);
  const [sampleRemovedMsg, setSampleRemovedMsg] = useState(false);

  const [studentName, setStudentName] = useState(settings.studentName);
  const [examDate, setExamDate] = useState(settings.examDate);
  const [examYear, setExamYear] = useState(String(settings.examYear));
  const [targetMaths, setTargetMaths] = useState(String(settings.targetMarks.combined_maths || 75));
  const [targetPhysics, setTargetPhysics] = useState(String(settings.targetMarks.physics || 75));
  const [targetChem, setTargetChem] = useState(String(settings.targetMarks.chemistry || 75));
  const [weakThreshold, setWeakThreshold] = useState(settings.weakTopicThreshold);
  const [onlyApproved, setOnlyApproved] = useState(settings.showOnlyApprovedMarksInDashboard);
  const [lang, setLang] = useState(settings.preferredLanguage);

  // Password state for Older Brother
  const [requirePassword, setRequirePassword] = useState(settings.isPasswordRequiredForAdmin ?? true);
  const [newPasswordInput, setNewPasswordInput] = useState(settings.adminPassword || 'al2027');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [passwordSavedMsg, setPasswordSavedMsg] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Firebase / Netlify domain settings state
  const activeFirebaseCfg = getActiveFirebaseConfig();
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(activeFirebaseCfg.apiKey);
  const [customProjectId, setCustomProjectId] = useState(activeFirebaseCfg.projectId);
  const [customAuthDomain, setCustomAuthDomain] = useState(activeFirebaseCfg.authDomain);
  const [customAppId, setCustomAppId] = useState(activeFirebaseCfg.appId);
  const [firebaseSavedMsg, setFirebaseSavedMsg] = useState(false);
  const [copiedSettingsDomain, setCopiedSettingsDomain] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: studentName.trim(),
      examDate,
      examYear: parseInt(examYear, 10) || 2026,
      targetMarks: {
        combined_maths: parseFloat(targetMaths) || 75,
        physics: parseFloat(targetPhysics) || 75,
        chemistry: parseFloat(targetChem) || 75,
      },
      weakTopicThreshold: weakThreshold,
      showOnlyApprovedMarksInDashboard: onlyApproved,
      preferredLanguage: lang,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const ok = importDatabaseBackup(reader.result as string);
        if (ok) {
          setImportStatus('Backup restored successfully!');
        } else {
          setImportStatus('Failed to restore backup: Invalid JSON format.');
        }
        setTimeout(() => setImportStatus(null), 3000);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-slate-700" />
          <span>Application Settings &amp; Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure candidate profile, target cutoffs, Google Drive storage integration, and data backups.
        </p>
      </div>

      {/* Student Profile & Targets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center">
          <User className="w-4 h-4 mr-1.5 text-blue-600" />
          <span>Student Candidate Profile &amp; Targets</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GCE A/L Examination Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam Target Year</label>
              <input
                type="number"
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-medium"
                required
              />
            </div>
          </div>

          {/* Target Marks for Each Subject */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="block text-xs font-bold text-slate-800">
              Subject Target Marks (% Required for Top District Rank)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Combined Mathematics Target %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetMaths}
                  onChange={(e) => setTargetMaths(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Physics Target %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetPhysics}
                  onChange={(e) => setTargetPhysics(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Chemistry Target %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetChem}
                  onChange={(e) => setTargetChem(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Weak Topic Threshold & Official Marks Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Weak Topic Warning Threshold: {weakThreshold}%
              </label>
              <input
                type="range"
                min="35"
                max="65"
                step="5"
                value={weakThreshold}
                onChange={(e) => setWeakThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Topics with average scores below this percentage will generate critical revision alerts.
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
              <input
                type="checkbox"
                id="onlyApproved"
                checked={onlyApproved}
                onChange={(e) => setOnlyApproved(e.target.checked)}
                className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="onlyApproved" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold block text-slate-900">
                  Strict Audit: Count Only Approved Marks in Dashboard
                </span>
                <span className="text-[11px] text-slate-500">
                  When checked, unverified student marks remain provisional until older sibling approves.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Settings updated successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-200"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>

      {/* Older Brother Security & Passcode Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <Lock className="w-4 h-4 mr-1.5 text-indigo-600" />
              <span>Older Brother Security &amp; Access Passcode</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Protect reviewer powers so younger brother cannot approve his own marks or bypass changes requested.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
            <input
              type="checkbox"
              id="requirePasswordToggle"
              checked={requirePassword}
              onChange={(e) => setRequirePassword(e.target.checked)}
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="requirePasswordToggle" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold block text-slate-900">
                Require Passcode to switch to Older Brother (Admin / Reviewer) mode
              </span>
              <span className="text-[11px] text-slate-500">
                When enabled, switching role in the navigation bar will prompt for the password.
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Older Brother Passcode
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showSettingsPassword ? 'text' : 'password'}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full pl-9 pr-10 py-2.5 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  title={showSettingsPassword ? 'Hide password' : 'Show password'}
                >
                  {showSettingsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  updateSettings({
                    adminPassword: newPasswordInput.trim() || 'al2027',
                    isPasswordRequiredForAdmin: requirePassword,
                  });
                  setPasswordSavedMsg(true);
                  setTimeout(() => setPasswordSavedMsg(false), 2500);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-200 transition-colors"
              >
                Save Passcode Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewPasswordInput('al2027');
                  updateSettings({ adminPassword: 'al2027' });
                  setPasswordSavedMsg(true);
                  setTimeout(() => setPasswordSavedMsg(false), 2500);
                }}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                title="Reset to default password al2027"
              >
                Reset to &lsquo;al2027&rsquo;
              </button>
            </div>
          </div>

          {passwordSavedMsg && (
            <div className="text-xs font-bold text-emerald-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Passcode updated successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Google Drive Integration Hub */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <HardDrive className="w-4 h-4 mr-1.5 text-blue-600" />
              <span>Google Drive Cloud Storage Integration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely backs up marked answer papers and marking schemes into your personal Google Drive.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isDriveConnected ? (
              <button
                onClick={disconnectGoogleDrive}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
              >
                Disconnect Drive
              </button>
            ) : (
              <button
                onClick={connectGoogleDrive}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs shadow-blue-200"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>

        {/* Current Connection Status */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            isDriveConnected
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isDriveConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">
                {isDriveConnected ? 'Connected to Google Drive' : 'Google Drive Not Connected'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isDriveConnected
                  ? `Authorized user: ${driveUserEmail || 'Active'} • Target Folder: A/L Progress Tracker`
                  : 'Click "Sign In with Google" above to grant permission.'}
              </div>
            </div>
          </div>

          {isDriveConnected && (
            <button
              onClick={syncAllPendingFilesToDrive}
              disabled={isDriveSyncing}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isDriveSyncing ? 'animate-spin' : ''}`} />
              <span>{isDriveSyncing ? 'Syncing...' : 'Sync Pending Files'}</span>
            </button>
          )}
        </div>

        {/* Domain Authorization Notice for External / Netlify Hosting */}
        {!isDriveConnected && (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <Globe className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Deploying on Netlify or External Domain?</span>
                    <span className="text-[10px] font-mono bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                      auth/unauthorized-domain
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Firebase OAuth requires domains like{' '}
                    <code className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-amber-200">
                      {typeof window !== 'undefined' ? window.location.hostname : 'taupe-cupcake-70b680.netlify.app'}
                    </code>{' '}
                    to be listed under <b>Authorized domains</b> in your Firebase project.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const host = typeof window !== 'undefined' ? window.location.hostname : '';
                  setAuthDomainError({
                    domain: host,
                    projectId: activeFirebaseCfg.projectId,
                    consoleUrl: `https://console.firebase.google.com/project/${activeFirebaseCfg.projectId}/authentication/settings`,
                  });
                }}
                className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Fix Guide (30s)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
              <span className="text-[11px] text-amber-900 font-medium">Current Domain:</span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-amber-200 font-semibold text-slate-800 select-all">
                {typeof window !== 'undefined' ? window.location.hostname : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.hostname : '');
                    setCopiedSettingsDomain(true);
                    setTimeout(() => setCopiedSettingsDomain(false), 2000);
                  }
                }}
                className="px-2 py-0.5 bg-white hover:bg-slate-50 text-slate-700 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
              >
                {copiedSettingsDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSettingsDomain ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={`https://console.firebase.google.com/project/${activeFirebaseCfg.projectId}/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-800 font-semibold underline decoration-blue-300"
              >
                <span>Open Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Advanced Firebase Settings Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowFirebaseConfig(!showFirebaseConfig)}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {showFirebaseConfig
                ? 'Hide Custom Firebase Project Settings'
                : 'Advanced: Configure Custom Firebase Project (Optional)'}
            </span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            Project: {activeFirebaseCfg.projectId}
          </span>
        </div>

        {showFirebaseConfig && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs animate-fade-in">
            <div className="text-[11px] text-slate-600">
              If deploying outside AI Studio to your own Netlify or Cloud hosting account, you can optionally override the Firebase configuration here.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Firebase Project ID
                </label>
                <input
                  type="text"
                  value={customProjectId}
                  onChange={(e) => setCustomProjectId(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2 bg-white"
                  placeholder="e.g. my-study-tracker"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Firebase API Key
                </label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2 bg-white"
                  placeholder="AIza..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={customAuthDomain}
                  onChange={(e) => setCustomAuthDomain(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2 bg-white"
                  placeholder="my-project.firebaseapp.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={customAppId}
                  onChange={(e) => setCustomAppId(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2 bg-white"
                  placeholder="1:123456789:web:abcdef..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  resetCustomFirebaseConfig();
                }}
                className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                Reset to Default Config
              </button>

              <div className="flex items-center gap-2">
                {firebaseSavedMsg && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Saved! Reloading...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    saveCustomFirebaseConfig({
                      projectId: customProjectId.trim(),
                      apiKey: customApiKey.trim(),
                      authDomain: customAuthDomain.trim(),
                      appId: customAppId.trim(),
                    });
                    setFirebaseSavedMsg(true);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  Save &amp; Reload App
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Folder Hierarchy Documentation */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800">
            Target Google Drive Folder Hierarchy:
          </div>
          <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto">
{`A/L Progress Tracker/
├── Combined Mathematics/
│   └── 2026/
│       └── <Date>_<PaperName>_Attempt1_marked_paper.pdf
├── Physics/
│   └── 2026/
└── Chemistry/
    └── 2026/`}
          </pre>
          <p className="text-[11px] text-slate-500">
            Filenames include the examination date, sanitized paper title, attempt number, and document type.
            Drive File IDs and <code>webViewLink</code> references are automatically saved for easy in-app access.
          </p>
        </div>
      </div>

      {/* Backup, Restore & Demo Data */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center">
          <Download className="w-4 h-4 mr-1.5 text-slate-600" />
          <span>Data Preservation, Backup &amp; Reset</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Download Backup */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h3 className="text-xs font-bold text-slate-800">Export Full Backup</h3>
            <p className="text-[11px] text-slate-500">
              Downloads a complete JSON snapshot containing all papers, marks, homework, sessions, and audits.
            </p>
            <button
              onClick={exportDatabaseBackup}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h3 className="text-xs font-bold text-slate-800">Restore Backup</h3>
            <p className="text-[11px] text-slate-500">
              Upload a previously exported JSON backup file to restore records.
            </p>
            <label className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              <span>Upload File</span>
              <input
                type="file"
                accept="application/json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
            {importStatus && (
              <span className="text-[10px] font-bold text-emerald-600 block text-center">
                {importStatus}
              </span>
            )}
          </div>

          {/* Sync Official Syllabus */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <h3 className="text-xs font-bold text-blue-900">Official A/L Syllabus</h3>
            <p className="text-[11px] text-slate-500">
              Update all 45 syllabus lessons for Combined Maths, Physics &amp; Chemistry with Sinhala titles.
            </p>
            <button
              onClick={() => {
                resetTopicsToOfficialSyllabus();
                setSyllabusResetMsg(true);
                setTimeout(() => setSyllabusResetMsg(false), 2500);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Sync All Lessons</span>
            </button>
            {syllabusResetMsg && (
              <span className="text-[10px] font-bold text-emerald-600 block text-center">
                Syllabus lessons updated!
              </span>
            )}
          </div>

          {/* Demo Data & Reset */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h3 className="text-xs font-bold text-slate-800">Sample Records &amp; Reset</h3>
            <p className="text-[11px] text-slate-500">
              Remove mock data to start clean, or purge all records.
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  removeSampleData();
                  setSampleRemovedMsg(true);
                  setTimeout(() => setSampleRemovedMsg(false), 2500);
                }}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Remove Sample Data</span>
              </button>
              <div className="flex space-x-1.5">
                <button
                  onClick={loadDemoRecords}
                  className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  <span>Load Samples</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Permanently clear all student data and reset to blank state?')) {
                      resetAllData();
                    }
                  }}
                  className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Clear all student data"
                >
                  Clear All
                </button>
              </div>
            </div>
            {sampleRemovedMsg && (
              <span className="text-[10px] font-bold text-amber-600 block text-center">
                Sample data removed!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
