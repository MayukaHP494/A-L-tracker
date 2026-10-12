import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  UserCheck,
  HardDrive,
  Bell,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { getDaysUntilExam, formatSLDate } from '../../lib/storage.ts';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const {
    currentUser,
    activeRole,
    switchRole,
    settings,
    isDriveConnected,
    driveUserEmail,
    connectGoogleDrive,
    unreadNotificationCount,
    loadDemoRecords,
    papers,
    setActiveTab,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const daysLeft = getDaysUntilExam(settings.examDate);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Student Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  A/L Progress Tracker
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Physical Science
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <span className="font-medium text-slate-700">{settings.studentName}</span>
                <span>•</span>
                <span>GCE A/L {settings.examYear}</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline-flex items-center text-amber-800 font-semibold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80">
                  <Calendar className="w-3 h-3 mr-1 inline text-amber-600" />
                  {daysLeft} days to exam ({formatSLDate(settings.examDate)})
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions: Role Switcher, Drive Status, Notifications */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Data loader if zero papers */}
            {papers.length === 0 && (
              <button
                onClick={loadDemoRecords}
                className="hidden lg:inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="Load sample A/L papers, topics, and homework to explore"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Load Demo Data
              </button>
            )}

            {/* Google Drive Status Indicator */}
            <div className="relative">
              {isDriveConnected ? (
                <button
                  onClick={() => setActiveTab('settings')}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  title={`Google Drive Connected: ${driveUserEmail || 'Active'}`}
                >
                  <HardDrive className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span className="hidden md:inline">Drive Synced</span>
                </button>
              ) : (
                <button
                  onClick={connectGoogleDrive}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  title="Connect Google Drive to store student marked papers"
                >
                  <HardDrive className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  <span className="hidden md:inline">Connect Drive</span>
                </button>
              )}
            </div>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeRole === 'admin'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <UserCheck className={`w-3.5 h-3.5 ${activeRole === 'admin' ? 'text-indigo-600' : 'text-emerald-600'}`} />
                <div className="text-left hidden sm:block">
                  <div className="font-semibold leading-tight">
                    {activeRole === 'admin' ? 'Older Sibling (Admin)' : 'Younger Brother (Student)'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Switch Role Perspective
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Toggle between reviewer powers and student submission view.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      if (activeRole !== 'admin') {
                        if (settings.isPasswordRequiredForAdmin) {
                          setPasswordInput('');
                          setPasswordError(null);
                          setIsPasswordModalOpen(true);
                        } else {
                          switchRole('admin');
                        }
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-start space-x-2.5 hover:bg-slate-50 transition-colors ${
                      activeRole === 'admin' ? 'bg-indigo-50/70 font-semibold text-indigo-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      OS
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 flex items-center justify-between">
                        <span>Older Sibling (Admin / Reviewer)</span>
                        {settings.isPasswordRequiredForAdmin && activeRole !== 'admin' && (
                          <Lock className="w-3 h-3 text-indigo-500 shrink-0 ml-1" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-normal">
                        Verify marks, mark corrections, review queue, Google Drive setup.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchRole('student');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-start space-x-2.5 hover:bg-slate-50 transition-colors ${
                      activeRole === 'student' ? 'bg-emerald-50/70 font-semibold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      YB
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Younger Brother (Student)</div>
                      <div className="text-[11px] text-slate-500 leading-normal">
                        Submit weekly papers, upload PDFs, log homework & study sessions.
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Older Brother Password Authentication Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Older Brother Authentication</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your reviewer passcode to verify paper marks, edit records, and manage settings.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const ok = switchRole('admin', passwordInput);
                if (ok) {
                  setIsPasswordModalOpen(false);
                  setPasswordInput('');
                  setPasswordError(null);
                } else {
                  setPasswordError('Incorrect passcode. Please try again.');
                }
              }}
              className="space-y-4"
            >
              {passwordError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Passcode / Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(null);
                    }}
                    placeholder="Enter passcode..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                  <span>Default password: <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">al2027</code></span>
                  <span className="text-[10px]">Changeable in Settings</span>
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordInput('');
                    setPasswordError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Unlock className="w-3.5 h-3.5 mr-1" />
                  <span>Log In as Brother</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
