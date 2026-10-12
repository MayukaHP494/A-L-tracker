import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { NotificationDrawer } from './components/notifications/NotificationDrawer.tsx';
import { Dashboard } from './components/dashboard/Dashboard.tsx';
import { PaperMarksPage } from './components/papers/PaperMarksPage.tsx';
import { SubmissionsPage } from './components/reviews/SubmissionsPage.tsx';
import { SubjectAnalysisPage } from './components/subjects/SubjectAnalysisPage.tsx';
import { HomeworkTrackerPage } from './components/homework/HomeworkTrackerPage.tsx';
import { StudyPlannerPage } from './components/planner/StudyPlannerPage.tsx';
import { ReportsPage } from './components/reports/ReportsPage.tsx';
import { SettingsPage } from './components/settings/SettingsPage.tsx';
import { AuthorizedDomainModal } from './components/modals/AuthorizedDomainModal.tsx';

function MainContent() {
  const { activeTab, authDomainError, setAuthDomainError } = useApp();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar onOpenNotifications={() => setIsNotificationOpen(true)} />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'papers' && <PaperMarksPage />}
          {activeTab === 'submissions' && <SubmissionsPage />}
          {activeTab === 'subjects' && <SubjectAnalysisPage />}
          {activeTab === 'homework' && <HomeworkTrackerPage />}
          {activeTab === 'planner' && <StudyPlannerPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Domain Authorization Guidance Modal for Netlify / External Hosts */}
      <AuthorizedDomainModal
        isOpen={Boolean(authDomainError)}
        onClose={() => setAuthDomainError(null)}
        domain={authDomainError?.domain}
        projectId={authDomainError?.projectId}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
