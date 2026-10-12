import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Role,
  UserProfile,
  SubjectId,
  PaperRecord,
  PaperSubmission,
  TopicItem,
  HomeworkTask,
  StudySession,
  WeeklyGoal,
  AppSettings,
  InAppNotification,
  AttachedFile,
  ReviewComment,
  MarkAuditEntry,
} from '../types/index.ts';
import {
  ADMIN_USER,
  STUDENT_USER,
  INITIAL_TOPICS,
  DEFAULT_SETTINGS,
  DEFAULT_SUBJECTS,
  KEYS,
  loadItem,
  saveItem,
  generateDemoData,
  isSampleRecord,
} from '../lib/storage.ts';
import { googleSignIn, logoutGoogle, getAccessToken, initAuth } from '../lib/firebase.ts';
import { ensureSubjectHierarchy, uploadPdfToDrive } from '../lib/drive.ts';

export type NavTab =
  | 'dashboard'
  | 'papers'
  | 'submissions'
  | 'subjects'
  | 'homework'
  | 'planner'
  | 'reports'
  | 'settings';

interface AppContextType {
  // Current user & role
  currentUser: UserProfile;
  activeRole: Role;
  switchRole: (role: Role, password?: string) => boolean;
  verifyAdminPassword: (password: string) => boolean;
  setAdminPassword: (newPassword: string) => void;

  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedSubjectFilter?: SubjectId;
  setSelectedSubjectFilter: (sub?: SubjectId) => void;

  // Papers
  papers: PaperRecord[];
  addPaper: (paper: Omit<PaperRecord, 'id' | 'createdAt' | 'updatedAt' | 'percentage'>) => PaperRecord;
  updatePaper: (id: string, updates: Partial<PaperRecord>) => void;
  deletePaper: (id: string) => void;

  // Submissions & Review Workflow
  submissions: PaperSubmission[];
  createSubmission: (data: {
    subjectId: SubjectId;
    paperName: string;
    paperDate: string;
    paperType: PaperRecord['paperType'];
    studentMarksObtained: number;
    maximumMarks: number;
    attemptNumber?: number;
    studentNotes?: string;
    files: AttachedFile[];
    topicIds?: string[];
  }) => PaperSubmission;
  updateSubmissionStatus: (id: string, status: PaperSubmission['status'], reviewerNotes?: string) => void;
  addReviewComment: (submissionId: string, content: string, pageNumber?: number) => void;
  correctAndApproveSubmission: (
    submissionId: string,
    verifiedMarks: number,
    reviewerNotes: string,
    markAuditReason?: string
  ) => void;
  requestChanges: (submissionId: string, feedbackNotes: string) => void;
  resubmitSubmission: (submissionId: string, updatedFiles: AttachedFile[], studentNotes?: string) => void;

  // Google Drive
  isDriveConnected: boolean;
  driveUserEmail?: string;
  isDriveSyncing: boolean;
  connectGoogleDrive: () => Promise<void>;
  disconnectGoogleDrive: () => Promise<void>;
  syncSubmissionFileToDrive: (submissionId: string, fileId: string) => Promise<void>;
  syncAllPendingFilesToDrive: () => Promise<void>;

  // Topics
  topics: TopicItem[];
  addTopic: (topic: Omit<TopicItem, 'id'>) => void;
  updateTopic: (id: string, updates: Partial<TopicItem>) => void;
  deleteTopic: (id: string) => void;
  resetTopicsToOfficialSyllabus: () => void;

  // Homework
  homework: HomeworkTask[];
  addHomework: (task: Omit<HomeworkTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHomework: (id: string, updates: Partial<HomeworkTask>) => void;
  deleteHomework: (id: string) => void;
  quickToggleHomeworkComplete: (id: string) => void;

  // Planner
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  updateSession: (id: string, updates: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;
  goals: WeeklyGoal[];
  updateWeeklyGoal: (goal: WeeklyGoal) => void;

  // Settings & System
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  loadDemoRecords: () => void;
  removeSampleData: () => void;
  resetAllData: () => void;
  exportDatabaseBackup: () => void;
  importDatabaseBackup: (jsonData: string) => boolean;

  // Notifications
  notifications: InAppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationCount: number;

  // Calculated Stats
  subjectStats: Record<SubjectId, {
    totalPapers: number;
    latestPercentage?: number;
    latestPaperName?: number | string;
    averagePercentage?: number;
    highestPercentage?: number;
    lowestPercentage?: number;
    trendDelta?: number; // difference between latest and previous
    completedHomeworkCount: number;
    pendingHomeworkCount: number;
    overdueHomeworkCount: number;
    completionRate: number;
  }>;
  overallAveragePercentage?: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Role State
  const [activeRole, setActiveRole] = useState<Role>(() => loadItem<Role>(KEYS.CURRENT_USER_ROLE, 'admin'));
  const currentUser = activeRole === 'admin' ? ADMIN_USER : STUDENT_USER;

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectId | undefined>(undefined);

  // 3. Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const loaded = loadItem<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
    let updated = { ...loaded };
    let changed = false;
    if (!loaded.studentName || loaded.studentName === 'Kavindu Perera') {
      updated.studentName = 'Minuka Hirushan';
      changed = true;
    }
    if (!loaded.examDate || loaded.examDate === '2026-11-15') {
      updated.examDate = '2027-08-01';
      updated.examYear = 2027;
      changed = true;
    }
    if (!loaded.adminPassword) {
      updated.adminPassword = 'al2027';
      changed = true;
    }
    if (loaded.isPasswordRequiredForAdmin === undefined) {
      updated.isPasswordRequiredForAdmin = true;
      changed = true;
    }
    if (changed) {
      saveItem(KEYS.SETTINGS, updated);
      return updated;
    }
    return loaded;
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      saveItem(KEYS.SETTINGS, updated);
      return updated;
    });
  };

  const verifyAdminPassword = (password: string): boolean => {
    const expected = (settings.adminPassword || 'al2027').trim();
    return password.trim() === expected;
  };

  const switchRole = (role: Role, password?: string): boolean => {
    if (role === 'admin' && settings.isPasswordRequiredForAdmin) {
      if (!password || !verifyAdminPassword(password)) {
        return false;
      }
    }
    setActiveRole(role);
    saveItem(KEYS.CURRENT_USER_ROLE, role);
    return true;
  };

  const setAdminPassword = (newPassword: string) => {
    updateSettings({ adminPassword: newPassword.trim() });
  };

  // 4. Papers State (cleared of sample records)
  const [papers, setPapers] = useState<PaperRecord[]>(() => {
    const loaded = loadItem<PaperRecord[]>(KEYS.PAPERS, []);
    const filtered = loaded.filter(
      (p) =>
        !isSampleRecord(p.id) &&
        p.paperNumber !== 'CM-2026-01' &&
        p.paperNumber !== 'PHY-W-04' &&
        p.paperNumber !== 'CHEM-UT-02' &&
        p.paperNumber !== 'CM-W-07' &&
        p.paperNumber !== 'PHY-W-05'
    );
    if (filtered.length !== loaded.length) {
      saveItem(KEYS.PAPERS, filtered);
    }
    return filtered;
  });

  useEffect(() => {
    saveItem(KEYS.PAPERS, papers);
  }, [papers]);

  const addPaper = (paperData: Omit<PaperRecord, 'id' | 'createdAt' | 'updatedAt' | 'percentage'>): PaperRecord => {
    const rawPct = paperData.maximumMarks > 0 ? (paperData.marksObtained / paperData.maximumMarks) * 100 : 0;
    const percentage = Number(rawPct.toFixed(1));
    const nowIso = new Date().toISOString();

    const newPaper: PaperRecord = {
      ...paperData,
      id: `paper_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      percentage,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setPapers((prev) => [newPaper, ...prev]);
    return newPaper;
  };

  const updatePaper = (id: string, updates: Partial<PaperRecord>) => {
    setPapers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const marksObtained = updates.marksObtained !== undefined ? updates.marksObtained : p.marksObtained;
        const maximumMarks = updates.maximumMarks !== undefined ? updates.maximumMarks : p.maximumMarks;
        const percentage = maximumMarks > 0 ? Number(((marksObtained / maximumMarks) * 100).toFixed(1)) : p.percentage;

        return {
          ...p,
          ...updates,
          percentage,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deletePaper = (id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id));
  };

  // 5. Submissions & Review Workflow (cleared of sample records)
  const [submissions, setSubmissions] = useState<PaperSubmission[]>(() => {
    const loaded = loadItem<PaperSubmission[]>(KEYS.SUBMISSIONS, []);
    const filtered = loaded.filter(
      (s) => !isSampleRecord(s.id) && s.paperId !== 'paper_4' && s.paperId !== 'paper_5'
    );
    if (filtered.length !== loaded.length) {
      saveItem(KEYS.SUBMISSIONS, filtered);
    }
    return filtered;
  });

  useEffect(() => {
    saveItem(KEYS.SUBMISSIONS, submissions);
  }, [submissions]);

  // Notifications (cleared of demo/sample messages)
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const loaded = loadItem<InAppNotification[]>(KEYS.NOTIFICATIONS, []);
    const filtered = loaded.filter(
      (n) => !n.title.toLowerCase().includes('demo') && !n.message.toLowerCase().includes('demo')
    );
    if (filtered.length !== loaded.length) {
      saveItem(KEYS.NOTIFICATIONS, filtered);
    }
    return filtered;
  });

  useEffect(() => {
    saveItem(KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  const pushNotification = (title: string, message: string, type: InAppNotification['type'], linkTarget?: string) => {
    const notif: InAppNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkTarget,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const createSubmission = (data: {
    subjectId: SubjectId;
    paperName: string;
    paperDate: string;
    paperType: PaperRecord['paperType'];
    studentMarksObtained: number;
    maximumMarks: number;
    attemptNumber?: number;
    studentNotes?: string;
    files: AttachedFile[];
    topicIds?: string[];
  }): PaperSubmission => {
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const nowIso = new Date().toISOString();

    // Also automatically create a matching PaperRecord in provisional state
    const createdPaper = addPaper({
      subjectId: data.subjectId,
      paperName: data.paperName,
      paperDate: data.paperDate,
      paperType: data.paperType,
      marksObtained: data.studentMarksObtained,
      maximumMarks: data.maximumMarks,
      attemptNumber: data.attemptNumber || 1,
      notes: data.studentNotes,
      topicIds: data.topicIds,
      submissionId: subId,
      isVerifiedByReviewer: false,
    });

    const newSubmission: PaperSubmission = {
      id: subId,
      paperId: createdPaper.id,
      subjectId: data.subjectId,
      paperName: data.paperName,
      paperDate: data.paperDate,
      paperType: data.paperType,
      studentMarksObtained: data.studentMarksObtained,
      maximumMarks: data.maximumMarks,
      attemptNumber: data.attemptNumber || 1,
      status: 'submitted',
      studentNotes: data.studentNotes,
      files: data.files,
      comments: [],
      markAudit: [],
      topicIds: data.topicIds,
      createdAt: nowIso,
      submittedAt: nowIso,
      updatedAt: nowIso,
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Push notification for Admin
    pushNotification(
      'New Paper Submitted for Review',
      `${data.paperName} (${data.studentMarksObtained}/${data.maximumMarks}) was submitted by student.`,
      'review_ready',
      'submissions'
    );

    return newSubmission;
  };

  const updateSubmissionStatus = (id: string, status: PaperSubmission['status'], reviewerNotes?: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status,
          reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : s.reviewerNotes,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addReviewComment = (submissionId: string, content: string, pageNumber?: number) => {
    const newComment: ReviewComment = {
      id: `comm_${Date.now()}`,
      submissionId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      pageNumber,
      createdAt: new Date().toISOString(),
    };

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        return {
          ...s,
          comments: [...s.comments, newComment],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const correctAndApproveSubmission = (
    submissionId: string,
    verifiedMarks: number,
    reviewerNotes: string,
    markAuditReason: string = 'Verified and approved by reviewer'
  ) => {
    const nowIso = new Date().toISOString();

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;

        const auditEntry: MarkAuditEntry = {
          id: `audit_${Date.now()}`,
          submissionId,
          paperId: s.paperId || '',
          previousMarks: s.studentMarksObtained,
          newMarks: verifiedMarks,
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedByRole: currentUser.role,
          reason: markAuditReason,
          timestamp: nowIso,
        };

        return {
          ...s,
          status: 'approved',
          reviewerVerifiedMarks: verifiedMarks,
          reviewerNotes,
          markAudit: [...s.markAudit, auditEntry],
          approvedAt: nowIso,
          reviewedAt: nowIso,
          updatedAt: nowIso,
        };
      })
    );

    // Update matching paper record
    const sub = submissions.find((s) => s.id === submissionId);
    if (sub && sub.paperId) {
      updatePaper(sub.paperId, {
        marksObtained: verifiedMarks,
        isVerifiedByReviewer: true,
        verifiedMarks,
      });
    }

    pushNotification(
      'Paper Submission Approved',
      `Reviewer verified ${sub?.paperName || 'paper'}: Marks approved at ${verifiedMarks}/${sub?.maximumMarks || 100}.`,
      'approved',
      'submissions'
    );
  };

  const requestChanges = (submissionId: string, feedbackNotes: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    updateSubmissionStatus(submissionId, 'changes_requested', feedbackNotes);

    pushNotification(
      'Changes Requested by Reviewer',
      `Feedback on ${sub?.paperName || 'paper'}: "${feedbackNotes}". Please review and update.`,
      'changes_requested',
      'submissions'
    );
  };

  const resubmitSubmission = (submissionId: string, updatedFiles: AttachedFile[], studentNotes?: string) => {
    const nowIso = new Date().toISOString();
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        return {
          ...s,
          status: 'submitted',
          files: [...s.files, ...updatedFiles],
          studentNotes: studentNotes ? `${s.studentNotes ? s.studentNotes + ' | ' : ''}Resubmission note: ${studentNotes}` : s.studentNotes,
          submittedAt: nowIso,
          updatedAt: nowIso,
        };
      })
    );

    pushNotification(
      'Revised Paper Submitted',
      `Student has uploaded corrections for review.`,
      'review_ready',
      'submissions'
    );
  };

  // 6. Google Drive State & Methods
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);

  useEffect(() => {
    initAuth(
      (user, token) => {
        if (user && token) {
          updateSettings({
            googleDriveConnected: true,
            googleDriveUserEmail: user.email || undefined,
          });
        }
      },
      () => {
        // Disconnected
      }
    );
  }, []);

  const connectGoogleDrive = async () => {
    try {
      const res = await googleSignIn();
      updateSettings({
        googleDriveConnected: true,
        googleDriveUserEmail: res.user.email || undefined,
      });
      pushNotification(
        'Google Drive Connected',
        `Successfully linked Google Drive account: ${res.user.email}`,
        'drive_sync'
      );
    } catch (err: any) {
      console.error('Failed to sign in with Google:', err);
      alert(`Could not connect to Google Drive: ${err?.message || 'Authentication cancelled'}`);
    }
  };

  const disconnectGoogleDrive = async () => {
    await logoutGoogle();
    updateSettings({
      googleDriveConnected: false,
      googleDriveUserEmail: undefined,
      googleDriveFolderId: undefined,
    });
  };

  const syncSubmissionFileToDrive = async (submissionId: string, fileId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;
    const file = sub.files.find((f) => f.id === fileId);
    if (!file || !file.dataUrl) {
      throw new Error('File data is missing.');
    }

    const token = getAccessToken();
    if (!token) {
      throw new Error('Google Drive is not connected. Sign in with Google first.');
    }

    try {
      setIsDriveSyncing(true);
      // Ensure folder structure: A/L Progress Tracker / Subject / 2026
      const { yearFolderId } = await ensureSubjectHierarchy(sub.subjectId, settings.examYear);

      // Convert dataUrl to Blob
      const res = await fetch(file.dataUrl);
      const blob = await res.blob();

      // Form sanitized filename
      const cleanPaperName = sub.paperName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${sub.paperDate}_${cleanPaperName}_Att${sub.attemptNumber}_${file.fileType}.pdf`;

      const uploadedDriveFile = await uploadPdfToDrive({
        file: blob,
        filename,
        folderId: yearFolderId,
      });

      // Update file record in submission
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id !== submissionId) return s;
          return {
            ...s,
            files: s.files.map((f) => {
              if (f.id !== fileId) return f;
              return {
                ...f,
                driveFileId: uploadedDriveFile.id,
                driveWebViewLink: uploadedDriveFile.webViewLink,
                driveSyncStatus: 'synced',
                driveSyncError: undefined,
              };
            }),
            updatedAt: new Date().toISOString(),
          };
        })
      );

      pushNotification(
        'File Uploaded to Google Drive',
        `Synced '${filename}' to Google Drive in A/L Progress Tracker folder.`,
        'drive_sync'
      );
    } catch (err: any) {
      console.error('Drive sync failed:', err);
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id !== submissionId) return s;
          return {
            ...s,
            files: s.files.map((f) => {
              if (f.id !== fileId) return f;
              return {
                ...f,
                driveSyncStatus: 'failed',
                driveSyncError: err?.message || 'Sync failed',
              };
            }),
          };
        })
      );
      throw err;
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const syncAllPendingFilesToDrive = async () => {
    setIsDriveSyncing(true);
    try {
      for (const sub of submissions) {
        for (const file of sub.files) {
          if (file.driveSyncStatus !== 'synced' && file.dataUrl) {
            await syncSubmissionFileToDrive(sub.id, file.id).catch((err) =>
              console.warn(`Failed to sync file ${file.name}:`, err)
            );
          }
        }
      }
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // 7. Topics State
  const [topics, setTopics] = useState<TopicItem[]>(() => {
    const loaded = loadItem<TopicItem[]>(KEYS.TOPICS, []);
    if (!loaded || loaded.length === 0) {
      saveItem(KEYS.TOPICS, INITIAL_TOPICS);
      return INITIAL_TOPICS;
    }
    // If stored topics were from the earlier minimal set (< 35 topics),
    // merge or refresh with the full official syllabus topics while preserving custom ones
    if (loaded.length < 40) {
      const existingIds = new Set(loaded.map((t) => t.id));
      const existingNames = new Set(loaded.map((t) => t.name.toLowerCase()));
      const missingInitial = INITIAL_TOPICS.filter(
        (t) => !existingIds.has(t.id) && !existingNames.has(t.name.toLowerCase())
      );
      if (missingInitial.length > 0) {
        const merged = [...loaded, ...missingInitial];
        saveItem(KEYS.TOPICS, merged);
        return merged;
      }
    }
    return loaded;
  });

  useEffect(() => {
    saveItem(KEYS.TOPICS, topics);
  }, [topics]);

  const addTopic = (topic: Omit<TopicItem, 'id'>) => {
    const newTopic: TopicItem = {
      ...topic,
      id: `topic_${Date.now()}`,
    };
    setTopics((prev) => [...prev, newTopic]);
  };

  const updateTopic = (id: string, updates: Partial<TopicItem>) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const resetTopicsToOfficialSyllabus = () => {
    setTopics(INITIAL_TOPICS);
    saveItem(KEYS.TOPICS, INITIAL_TOPICS);
    pushNotification(
      'Syllabus Updated',
      'Topics & lessons successfully updated to official Sri Lankan A/L Physical Science syllabus.',
      'approved',
      'subjects'
    );
  };

  // 8. Homework State (cleared of sample records)
  const [homework, setHomework] = useState<HomeworkTask[]>(() => {
    const loaded = loadItem<HomeworkTask[]>(KEYS.HOMEWORK, []);
    const filtered = loaded.filter((h) => !isSampleRecord(h.id));
    if (filtered.length !== loaded.length) {
      saveItem(KEYS.HOMEWORK, filtered);
    }
    return filtered;
  });

  useEffect(() => {
    saveItem(KEYS.HOMEWORK, homework);
  }, [homework]);

  const addHomework = (task: Omit<HomeworkTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newTask: HomeworkTask = {
      ...task,
      id: `hw_${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setHomework((prev) => [newTask, ...prev]);
  };

  const updateHomework = (id: string, updates: Partial<HomeworkTask>) => {
    setHomework((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        return {
          ...h,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteHomework = (id: string) => {
    setHomework((prev) => prev.filter((h) => h.id !== id));
  };

  const quickToggleHomeworkComplete = (id: string) => {
    setHomework((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const willBeComplete = h.status !== 'completed';
        return {
          ...h,
          status: willBeComplete ? 'completed' : 'in_progress',
          completedDate: willBeComplete ? new Date().toISOString().split('T')[0] : undefined,
          questionsCompleted: willBeComplete ? h.questionsAssigned : h.questionsCompleted,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // 9. Planner State (cleared of sample records)
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const loaded = loadItem<StudySession[]>(KEYS.PLANNER, []);
    const filtered = loaded.filter((s) => !isSampleRecord(s.id));
    if (filtered.length !== loaded.length) {
      saveItem(KEYS.PLANNER, filtered);
    }
    return filtered;
  });

  const [goals, setGoals] = useState<WeeklyGoal[]>(() => {
    const loaded = loadItem<WeeklyGoal[]>(KEYS.GOALS, []);
    const filtered = loaded.filter((g) => !isSampleRecord(g.id));
    if (filtered.length !== loaded.length) {
      saveItem(KEYS.GOALS, filtered);
    }
    return filtered;
  });

  useEffect(() => {
    saveItem(KEYS.PLANNER, sessions);
  }, [sessions]);

  useEffect(() => {
    saveItem(KEYS.GOALS, goals);
  }, [goals]);

  const addSession = (session: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...session,
      id: `sess_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const updateSession = (id: string, updates: Partial<StudySession>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateWeeklyGoal = (goal: WeeklyGoal) => {
    setGoals((prev) => {
      const exists = prev.some((g) => g.id === goal.id);
      if (exists) {
        return prev.map((g) => (g.id === goal.id ? goal : g));
      }
      return [...prev, goal];
    });
  };

  // 10. Backup, Restore, Demo Data & Purge
  const loadDemoRecords = () => {
    const demo = generateDemoData();
    setPapers(demo.papers);
    setSubmissions(demo.submissions);
    setHomework(demo.homework);
    setSessions(demo.sessions);
    setGoals(demo.goals);
    pushNotification('Demo Data Loaded', 'Sample Sri Lankan A/L records loaded.', 'approved');
  };

  const removeSampleData = () => {
    setPapers((prev) => {
      const f = prev.filter(
        (p) =>
          !isSampleRecord(p.id) &&
          p.paperNumber !== 'CM-2026-01' &&
          p.paperNumber !== 'PHY-W-04' &&
          p.paperNumber !== 'CHEM-UT-02' &&
          p.paperNumber !== 'CM-W-07' &&
          p.paperNumber !== 'PHY-W-05'
      );
      saveItem(KEYS.PAPERS, f);
      return f;
    });
    setSubmissions((prev) => {
      const f = prev.filter((s) => !isSampleRecord(s.id) && s.paperId !== 'paper_4' && s.paperId !== 'paper_5');
      saveItem(KEYS.SUBMISSIONS, f);
      return f;
    });
    setHomework((prev) => {
      const f = prev.filter((h) => !isSampleRecord(h.id));
      saveItem(KEYS.HOMEWORK, f);
      return f;
    });
    setSessions((prev) => {
      const f = prev.filter((s) => !isSampleRecord(s.id));
      saveItem(KEYS.PLANNER, f);
      return f;
    });
    setGoals((prev) => {
      const f = prev.filter((g) => !isSampleRecord(g.id));
      saveItem(KEYS.GOALS, f);
      return f;
    });
    setNotifications((prev) => {
      const f = prev.filter(
        (n) => !n.title.toLowerCase().includes('demo') && !n.message.toLowerCase().includes('demo')
      );
      saveItem(KEYS.NOTIFICATIONS, f);
      return f;
    });
    pushNotification('Sample Data Removed', 'All sample examination papers and demo tasks have been removed.', 'drive_sync');
  };

  const resetAllData = () => {
    setPapers([]);
    setSubmissions([]);
    setHomework([]);
    setSessions([]);
    setGoals([]);
    setNotifications([]);
    pushNotification('Data Cleared', 'All student records have been reset to empty state.', 'drive_sync');
  };

  const exportDatabaseBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      studentName: settings.studentName,
      settings,
      topics,
      papers,
      submissions,
      homework,
      sessions,
      goals,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AL_Progress_Tracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.papers && Array.isArray(data.papers)) setPapers(data.papers);
      if (data.submissions && Array.isArray(data.submissions)) setSubmissions(data.submissions);
      if (data.homework && Array.isArray(data.homework)) setHomework(data.homework);
      if (data.topics && Array.isArray(data.topics)) setTopics(data.topics);
      if (data.sessions && Array.isArray(data.sessions)) setSessions(data.sessions);
      if (data.goals && Array.isArray(data.goals)) setGoals(data.goals);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      return true;
    } catch (err) {
      console.error('Failed to parse backup JSON:', err);
      return false;
    }
  };

  // 11. Calculated Subject Stats
  const subjectStats = useMemo(() => {
    const stats: Record<SubjectId, any> = {
      combined_maths: {},
      physics: {},
      chemistry: {},
    };

    DEFAULT_SUBJECTS.forEach((sub) => {
      // Filter papers based on setting: approved only or all
      const subjectPapers = papers
        .filter((p) => p.subjectId === sub.id)
        .filter((p) => (settings.showOnlyApprovedMarksInDashboard ? p.isVerifiedByReviewer : true))
        .sort((a, b) => new Date(a.paperDate).getTime() - new Date(b.paperDate).getTime());

      const percentages = subjectPapers.map((p) => p.percentage);
      const totalPapers = subjectPapers.length;

      let averagePercentage: number | undefined = undefined;
      let highestPercentage: number | undefined = undefined;
      let lowestPercentage: number | undefined = undefined;
      let latestPercentage: number | undefined = undefined;
      let latestPaperName: string | undefined = undefined;
      let trendDelta: number | undefined = undefined;

      if (totalPapers > 0) {
        // Arithmetic mean of percentages
        const sum = percentages.reduce((acc, curr) => acc + curr, 0);
        averagePercentage = Number((sum / totalPapers).toFixed(1));
        highestPercentage = Math.max(...percentages);
        lowestPercentage = Math.min(...percentages);

        const latest = subjectPapers[subjectPapers.length - 1];
        latestPercentage = latest.percentage;
        latestPaperName = latest.paperName;

        if (subjectPapers.length >= 2) {
          const prev = subjectPapers[subjectPapers.length - 2];
          trendDelta = Number((latest.percentage - prev.percentage).toFixed(1));
        }
      }

      // Homework stats for this subject
      const subHw = homework.filter((h) => h.subjectId === sub.id && h.status !== 'cancelled');
      const completedHw = subHw.filter((h) => h.status === 'completed');
      const pendingHw = subHw.filter((h) => h.status === 'in_progress' || h.status === 'not_started');

      const todayStr = new Date().toISOString().split('T')[0];
      const overdueHw = subHw.filter(
        (h) => h.status !== 'completed' && h.deadline < todayStr
      );

      const completionRate = subHw.length > 0 ? Number(((completedHw.length / subHw.length) * 100).toFixed(0)) : 0;

      stats[sub.id] = {
        totalPapers,
        latestPercentage,
        latestPaperName,
        averagePercentage,
        highestPercentage,
        lowestPercentage,
        trendDelta,
        completedHomeworkCount: completedHw.length,
        pendingHomeworkCount: pendingHw.length,
        overdueHomeworkCount: overdueHw.length,
        completionRate,
      };
    });

    return stats;
  }, [papers, homework, settings.showOnlyApprovedMarksInDashboard]);

  // Overall average across the three subjects (mean of subject averages with data)
  const overallAveragePercentage = useMemo(() => {
    const validAverages: number[] = [];
    DEFAULT_SUBJECTS.forEach((sub) => {
      const avg = subjectStats[sub.id]?.averagePercentage;
      if (avg !== undefined) {
        validAverages.push(avg);
      }
    });

    if (validAverages.length === 0) return undefined;
    const sum = validAverages.reduce((acc, v) => acc + v, 0);
    return Number((sum / validAverages.length).toFixed(1));
  }, [subjectStats]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        verifyAdminPassword,
        setAdminPassword,
        activeTab,
        setActiveTab,
        selectedSubjectFilter,
        setSelectedSubjectFilter,
        papers,
        addPaper,
        updatePaper,
        deletePaper,
        submissions,
        createSubmission,
        updateSubmissionStatus,
        addReviewComment,
        correctAndApproveSubmission,
        requestChanges,
        resubmitSubmission,
        isDriveConnected: settings.googleDriveConnected,
        driveUserEmail: settings.googleDriveUserEmail,
        isDriveSyncing,
        connectGoogleDrive,
        disconnectGoogleDrive,
        syncSubmissionFileToDrive,
        syncAllPendingFilesToDrive,
        topics,
        addTopic,
        updateTopic,
        deleteTopic,
        resetTopicsToOfficialSyllabus,
        homework,
        addHomework,
        updateHomework,
        deleteHomework,
        quickToggleHomeworkComplete,
        sessions,
        addSession,
        updateSession,
        deleteSession,
        goals,
        updateWeeklyGoal,
        settings,
        updateSettings,
        loadDemoRecords,
        removeSampleData,
        resetAllData,
        exportDatabaseBackup,
        importDatabaseBackup,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationCount,
        subjectStats,
        overallAveragePercentage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
