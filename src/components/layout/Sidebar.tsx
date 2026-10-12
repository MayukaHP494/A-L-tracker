import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck,
  BookOpen,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext.tsx';

interface SidebarItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, submissions, homework, activeRole } = useApp();

  // Compute pending reviews count
  const pendingReviewCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length;

  // Compute overdue homework count
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueHomeworkCount = homework.filter((h) => h.status !== 'completed' && h.deadline < todayStr).length;

  const items: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'papers', label: 'Paper Marks', icon: FileSpreadsheet },
    {
      id: 'submissions',
      label: 'PDF Submissions & Review',
      icon: FileCheck,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    { id: 'subjects', label: 'Subject Analysis', icon: BookOpen },
    {
      id: 'homework',
      label: 'Homework Tracker',
      icon: CheckSquare,
      badge: overdueHomeworkCount > 0 ? overdueHomeworkCount : undefined,
      badgeColor: 'bg-amber-600 text-white',
    },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 justify-between">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Academic Navigation
          </div>
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Role badge footer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Current Perspective
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                activeRole === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}
            />
            <span className="text-xs font-medium text-slate-800">
              {activeRole === 'admin' ? 'Reviewer / Older Sibling' : 'Student / Candidate'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {activeRole === 'admin'
              ? 'Has verification and editing authority'
              : 'Can upload papers and log homework'}
          </div>
        </div>
      </aside>

      {/* Mobile Top Horizontal Scroll Navigation */}
      <div className="lg:hidden bg-white border-b border-slate-200 overflow-x-auto py-2 px-3 flex space-x-1 sticky top-16 z-20 shadow-xs">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-blue-600' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
