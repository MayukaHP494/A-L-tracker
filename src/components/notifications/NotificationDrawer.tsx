import React from 'react';
import { X, CheckCheck, Bell, ExternalLink, AlertTriangle, FileCheck, HardDrive, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatSLDate } from '../../lib/storage.ts';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setActiveTab } = useApp();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'review_ready':
        return <FileCheck className="w-4 h-4 text-indigo-600" />;
      case 'changes_requested':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'overdue_homework':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'drive_sync':
        return <HardDrive className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Notifications & Alerts</h2>
            </div>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You will be notified when papers are submitted, reviewed, or deadlines approach.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.linkTarget) {
                      setActiveTab(notif.linkTarget as any);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    notif.isRead
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-blue-50/60 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-white shadow-xs border border-slate-100">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {formatSLDate(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      {notif.linkTarget && (
                        <div className="mt-2 flex items-center text-[11px] text-blue-600 font-medium">
                          <span>View in {notif.linkTarget}</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
