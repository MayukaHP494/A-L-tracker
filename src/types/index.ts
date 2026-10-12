export type Role = 'admin' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar?: string;
  title: string;
}

export type SubjectId = 'combined_maths' | 'physics' | 'chemistry';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  sinhalaName: string;
  color: string;
  targetPercentage: number;
}

export type PaperType =
  | 'full_paper'
  | 'mcq'
  | 'structured_essay'
  | 'topical_paper'
  | 'class_test';

export interface PaperPartScore {
  partName: string; // e.g. "Paper I", "Paper II"
  obtained: number;
  max: number;
}

export interface PaperRecord {
  id: string;
  subjectId: SubjectId;
  paperName: string;
  paperNumber?: string;
  paperDate: string; // ISO YYYY-MM-DD
  paperType: PaperType;
  marksObtained: number;
  maximumMarks: number;
  percentage: number;
  durationMinutes?: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
  attemptNumber: number; // 1 for first attempt, 2 for repeat
  parentPaperId?: string; // Links repeat attempts to first attempt
  parts?: PaperPartScore[];
  topicIds?: string[];
  notes?: string;
  submissionId?: string;
  createdAt: string;
  updatedAt: string;
  isVerifiedByReviewer: boolean;
  verifiedMarks?: number;
}

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'archived';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  fileType: 'marked_paper' | 'marking_scheme' | 'answer_script' | 'teacher_feedback' | 'annotated_review';
  mimeType: string;
  dataUrl?: string; // base64 representation or server URL
  uploadedAt: string;
  uploadedBy: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveSyncStatus: 'synced' | 'pending' | 'failed' | 'not_connected';
  driveSyncError?: string;
}

export interface ReviewComment {
  id: string;
  submissionId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  pageNumber?: number;
  createdAt: string;
}

export interface MarkAuditEntry {
  id: string;
  submissionId: string;
  paperId: string;
  previousMarks: number;
  newMarks: number;
  changedBy: string;
  changedByName: string;
  changedByRole: Role;
  reason?: string;
  timestamp: string;
}

export interface PaperSubmission {
  id: string;
  paperId?: string;
  subjectId: SubjectId;
  paperName: string;
  paperDate: string;
  paperType: PaperType;
  studentMarksObtained: number;
  maximumMarks: number;
  attemptNumber: number;
  status: SubmissionStatus;
  studentNotes?: string;
  files: AttachedFile[];
  reviewerVerifiedMarks?: number;
  reviewerNotes?: string;
  comments: ReviewComment[];
  markAudit: MarkAuditEntry[];
  topicIds?: string[];
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  updatedAt: string;
}

export type TopicPriority = 'high' | 'medium' | 'low';

export interface TopicSection {
  id: string;
  name: string;
  sinhalaName?: string;
}

export interface TopicItem {
  id: string;
  subjectId: SubjectId;
  name: string;
  sinhalaName: string;
  unitOrLesson: string;
  priority: TopicPriority;
  sections: TopicSection[];
  manualWeakOverride?: boolean;
}

export type HomeworkType =
  | 'tutorial'
  | 'past_paper'
  | 'revision'
  | 'mcq'
  | 'structured_essay'
  | 'theory'
  | 'practical'
  | 'custom';

export type HomeworkStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'needs_review'
  | 'cancelled';

export interface HomeworkTask {
  id: string;
  subjectId: SubjectId;
  topicId: string;
  sectionId?: string;
  teacherOrClass: string;
  assignedDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  title: string;
  description?: string;
  homeworkType: HomeworkType;
  estimatedMinutes?: number;
  questionsAssigned: number;
  questionsAttempted: number;
  questionsCompleted: number;
  status: HomeworkStatus;
  completedDate?: string;
  assessedMarks?: number;
  assessedMaxMarks?: number;
  accuracyPercentage?: number;
  notes?: string;
  difficultiesFaced?: string;
  questionsForTeacher?: string;
  referenceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = 'scheduled' | 'completed' | 'partially_completed' | 'missed';

export interface StudySession {
  id: string;
  subjectId: SubjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  plannedMinutes: number;
  actualMinutes?: number;
  topicId?: string;
  objective: string;
  status: SessionStatus;
  notes?: string;
  createdAt: string;
}

export interface WeeklyGoal {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  targetStudyHours: number;
  targetPapers: number;
  targetHomeworkCompleted: number;
  achievements?: string;
  difficulties?: string;
  nextWeekPriorities?: string;
}

export interface AppSettings {
  studentName: string;
  examDate: string; // YYYY-MM-DD (e.g. 2026-11-15)
  examYear: number;
  targetMarks: Record<SubjectId, number>; // target percentages
  weakTopicThreshold: number; // percentage, default 50
  preferredLanguage: 'en' | 'bilingual';
  showOnlyApprovedMarksInDashboard: boolean;
  googleDriveConnected: boolean;
  googleDriveUserEmail?: string;
  googleDriveFolderId?: string;
  googleDriveFolderName?: string;
  lastDriveSyncTimestamp?: string;
  adminPassword?: string;
  isPasswordRequiredForAdmin: boolean;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'review_ready' | 'changes_requested' | 'approved' | 'overdue_homework' | 'drive_sync';
  timestamp: string;
  isRead: boolean;
  linkTarget?: string; // tab or submission ID
}
