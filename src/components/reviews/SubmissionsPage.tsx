import React, { useState } from 'react';
import {
  FileCheck,
  Upload,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  History,
  RotateCw,
  ExternalLink,
  Plus,
  Filter,
  CheckCircle2,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import {
  PaperSubmission,
  SubjectId,
  AttachedFile,
  SubmissionStatus,
  PaperType,
} from '../../types/index.ts';
import { DEFAULT_SUBJECTS, formatSLDate } from '../../lib/storage.ts';
import { PdfViewerModal } from './PdfViewerModal.tsx';

export const SubmissionsPage: React.FC = () => {
  const {
    currentUser,
    activeRole,
    submissions,
    createSubmission,
    updateSubmissionStatus,
    addReviewComment,
    correctAndApproveSubmission,
    requestChanges,
    resubmitSubmission,
    isDriveConnected,
    connectGoogleDrive,
    syncSubmissionFileToDrive,
    syncAllPendingFilesToDrive,
    isDriveSyncing,
    setActiveTab,
    topics,
  } = useApp();

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PaperSubmission | null>(null);
  const [activeViewingFile, setActiveViewingFile] = useState<AttachedFile | null>(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'all'>('all');
  const [filterSubject, setFilterSubject] = useState<SubjectId | 'all'>('all');

  // Review action state for detail drawer/modal
  const [adjustedMarks, setAdjustedMarks] = useState<string>('');
  const [reviewerComment, setReviewerComment] = useState('');
  const [changeRequestNote, setChangeRequestNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // New Submission Form state
  const [uploadSubject, setUploadSubject] = useState<SubjectId>('combined_maths');
  const [uploadPaperName, setUploadPaperName] = useState('');
  const [uploadPaperDate, setUploadPaperDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadPaperType, setUploadPaperType] = useState<PaperType>('full_paper');
  const [uploadMarks, setUploadMarks] = useState('');
  const [uploadMaxMarks, setUploadMaxMarks] = useState('100');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<
    { file: File; type: AttachedFile['fileType']; previewUrl?: string }[]
  >([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Resubmit modal state
  const [resubmissionTarget, setResubmissionTarget] = useState<PaperSubmission | null>(null);
  const [resubmitFiles, setResubmitFiles] = useState<{ file: File; type: AttachedFile['fileType'] }[]>([]);
  const [resubmitNotes, setResubmitNotes] = useState('');

  // Calculations for Admin Review KPI counters
  const awaitingReviewCount = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'under_review'
  ).length;
  const changesRequestedCount = submissions.filter((s) => s.status === 'changes_requested').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;

  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterSubject !== 'all' && s.subjectId !== filterSubject) return false;
    return true;
  });

  // Handle file select in new submission
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: AttachedFile['fileType']) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        alert('Please select a valid PDF document.');
        return;
      }
      if (selected.size > 25 * 1024 * 1024) {
        alert('File size exceeds 25MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFilesToUpload((prev) => [
          ...prev,
          { file: selected, type: fileType, previewUrl: reader.result as string },
        ]);
      };
      reader.readAsDataURL(selected);
    }
  };

  // Submit new paper with PDF files
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const obt = parseFloat(uploadMarks);
    const max = parseFloat(uploadMaxMarks);

    if (!uploadPaperName.trim()) {
      setFormError('Please enter a paper name.');
      return;
    }
    if (isNaN(obt) || obt < 0 || isNaN(max) || max <= 0 || obt > max) {
      setFormError(`Marks obtained must be between 0 and maximum marks (${max}).`);
      return;
    }

    setUploadProgress(20);

    const attachedFiles: AttachedFile[] = [];

    // Convert loaded files into AttachedFiles with dataUrl
    for (const item of filesToUpload) {
      const nowIso = new Date().toISOString();
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      attachedFiles.push({
        id: fileId,
        name: item.file.name,
        size: item.file.size,
        fileType: item.type,
        mimeType: 'application/pdf',
        dataUrl: item.previewUrl,
        uploadedAt: nowIso,
        uploadedBy: currentUser.id,
        driveSyncStatus: isDriveConnected ? 'pending' : 'not_connected',
      });
    }

    setUploadProgress(70);

    const createdSub = createSubmission({
      subjectId: uploadSubject,
      paperName: uploadPaperName.trim(),
      paperDate: uploadPaperDate,
      paperType: uploadPaperType,
      studentMarksObtained: obt,
      maximumMarks: max,
      studentNotes: uploadNotes.trim() || undefined,
      files: attachedFiles,
      topicIds: selectedTopicIds,
    });

    setUploadProgress(100);

    // Auto-sync to Drive if connected
    if (isDriveConnected && attachedFiles.length > 0) {
      for (const f of attachedFiles) {
        syncSubmissionFileToDrive(createdSub.id, f.id).catch((err) =>
          console.warn('Auto drive sync failed:', err)
        );
      }
    }

    setTimeout(() => {
      setUploadProgress(null);
      setIsUploadModalOpen(false);
      // Reset form
      setUploadPaperName('');
      setUploadMarks('');
      setUploadNotes('');
      setFilesToUpload([]);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <FileCheck className="w-6 h-6 mr-2 text-indigo-600" />
            <span>PDF Submissions &amp; Academic Review</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-way sibling workflow: Student uploads marked examination papers; Reviewer verifies marks, annotates PDFs, and syncs to Google Drive.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Drive Sync All button if connected */}
          {isDriveConnected && (
            <button
              onClick={syncAllPendingFilesToDrive}
              disabled={isDriveSyncing}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs disabled:opacity-50"
              title="Sync any unsynced files to Google Drive"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
              <span>{isDriveSyncing ? 'Syncing Drive...' : 'Sync to Drive'}</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-200"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            <span>Submit Paper &amp; PDF</span>
          </button>
        </div>
      </div>

      {/* Google Drive Status Banner */}
      {!isDriveConnected ? (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-700 mt-0.5">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Google Drive Storage Not Connected
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Connect your Google account with permission to automatically create the folder structure (
                <code>A/L Progress Tracker / &lt;Subject&gt; / 2026</code>) and back up marked papers. Files
                are temporarily preserved locally.
              </p>
            </div>
          </div>
          <button
            onClick={connectGoogleDrive}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shrink-0 shadow-xs shadow-blue-200 transition-colors"
          >
            Connect Drive Account
          </button>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Google Drive active &bull; Storing papers under{' '}
              <strong>A/L Progress Tracker / &lt;Subject&gt; / 2026</strong>
            </span>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-[11px] font-semibold text-emerald-700 hover:underline"
          >
            Drive Settings
          </button>
        </div>
      )}

      {/* KPI Counters (Admin Perspective & Student Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Awaiting Review
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600">{awaitingReviewCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Papers submitted by student pending verification
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Changes Requested
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{changesRequestedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Submissions requiring student correction or revision
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Approved &amp; Verified
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{approvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Count towards official A/L dashboard statistics
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">
            Status:
          </span>
          {[
            { id: 'all', label: 'All Submissions' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'changes_requested', label: 'Changes Requested' },
            { id: 'approved', label: 'Approved' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === st.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value as any)}
            className="text-xs rounded-xl border border-slate-300 p-2 bg-white font-medium"
          >
            <option value="all">All Subjects</option>
            {DEFAULT_SUBJECTS.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Submissions Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &ldquo;Submit Paper &amp; PDF&rdquo; to upload marked examination papers for reviewer verification.
            </p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const subInfo = DEFAULT_SUBJECTS.find((s) => s.id === sub.subjectId);
            const studentPct = ((sub.studentMarksObtained / sub.maximumMarks) * 100).toFixed(1);
            const verifiedPct =
              sub.reviewerVerifiedMarks !== undefined
                ? ((sub.reviewerVerifiedMarks / sub.maximumMarks) * 100).toFixed(1)
                : null;

            return (
              <div
                key={sub.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info, Subject, Dates */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        color: subInfo?.color,
                        backgroundColor: `${subInfo?.color}15`,
                      }}
                    >
                      {subInfo?.name}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'changes_requested'
                          ? 'bg-amber-100 text-amber-800'
                          : sub.status === 'under_review'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {sub.status.replace('_', ' ').toUpperCase()}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Date: {formatSLDate(sub.paperDate)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {sub.paperName}
                  </h3>

                  {sub.studentNotes && (
                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      &quot;{sub.studentNotes}&quot;
                    </p>
                  )}

                  {/* Attached Files List */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {sub.files.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => {
                          setActiveViewingFile(file);
                          setSelectedSubmission(sub);
                        }}
                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors"
                        title="Click to view PDF"
                      >
                        <FileCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        {file.driveSyncStatus === 'synced' && (
                          <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-500" title="Synced to Drive" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center: Marks Comparison (Original vs Verified) */}
                <div className="flex items-center space-x-6 border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-6">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Student Claimed
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {sub.studentMarksObtained} / {sub.maximumMarks}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">{studentPct}%</div>
                  </div>

                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Reviewer Verified
                    </div>
                    {sub.reviewerVerifiedMarks !== undefined ? (
                      <div>
                        <div className="text-sm font-black text-emerald-600">
                          {sub.reviewerVerifiedMarks} / {sub.maximumMarks}
                        </div>
                        <div className="text-xs font-bold text-emerald-700">{verifiedPct}%</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Pending</span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setAdjustedMarks(
                        sub.reviewerVerifiedMarks !== undefined
                          ? String(sub.reviewerVerifiedMarks)
                          : String(sub.studentMarksObtained)
                      );
                      setReviewerComment(sub.reviewerNotes || '');
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span>{activeRole === 'admin' ? 'Review & Verify' : 'View Details'}</span>
                  </button>

                  {/* If student and changes requested, show resubmit button */}
                  {activeRole === 'student' && sub.status === 'changes_requested' && (
                    <button
                      onClick={() => setResubmissionTarget(sub)}
                      className="px-3 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Resubmit Corrections
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review & Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Submission Detail &bull; {selectedSubmission.status.toUpperCase()}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedSubmission.paperName}
                </h3>
                <p className="text-xs text-slate-500">
                  Date: {formatSLDate(selectedSubmission.paperDate)} &bull; Attempt #{selectedSubmission.attemptNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-5">
              {/* Attached Files with Drive Links */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Uploaded Examination Files
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSubmission.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-slate-900 truncate">{file.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB &bull;{' '}
                          <span
                            className={
                              file.driveSyncStatus === 'synced'
                                ? 'text-emerald-600 font-semibold'
                                : 'text-amber-600'
                            }
                          >
                            {file.driveSyncStatus === 'synced' ? 'Google Drive Synced' : 'Local Only'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Open PDF in viewer */}
                        <button
                          onClick={() => setActiveViewingFile(file)}
                          className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold"
                          title="Open in embedded viewer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Open in Drive directly */}
                        {file.driveWebViewLink && (
                          <a
                            href={file.driveWebViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Open Google Drive link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Manual Drive sync button if not synced */}
                        {file.driveSyncStatus !== 'synced' && isDriveConnected && (
                          <button
                            onClick={() => syncSubmissionFileToDrive(selectedSubmission.id, file.id)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                            title="Upload to Google Drive"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side-by-side Marks Comparison */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Student Raw Score</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {selectedSubmission.studentMarksObtained} / {selectedSubmission.maximumMarks}
                  </div>
                  <div className="text-xs font-bold text-slate-600">
                    {((selectedSubmission.studentMarksObtained / selectedSubmission.maximumMarks) * 100).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Reviewer Verified</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {selectedSubmission.reviewerVerifiedMarks !== undefined
                      ? `${selectedSubmission.reviewerVerifiedMarks} / ${selectedSubmission.maximumMarks}`
                      : 'Not yet verified'}
                  </div>
                  {selectedSubmission.reviewerVerifiedMarks !== undefined && (
                    <div className="text-xs font-bold text-emerald-700">
                      {((selectedSubmission.reviewerVerifiedMarks / selectedSubmission.maximumMarks) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Audit History */}
              {selectedSubmission.markAudit.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                    <History className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    <span>Mark Change Audit History</span>
                  </h4>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                    {selectedSubmission.markAudit.map((aud) => (
                      <div key={aud.id} className="p-2.5 bg-white flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{aud.changedByName}</span>: adjusted{' '}
                          <strong>{aud.previousMarks}</strong> &rarr;{' '}
                          <strong className="text-emerald-600">{aud.newMarks}</strong>
                          {aud.reason && <div className="text-[11px] text-slate-500">&quot;{aud.reason}&quot;</div>}
                        </div>
                        <div className="text-[10px] text-slate-400">{formatSLDate(aud.timestamp)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer Action Form (Only for Admin Role) */}
              {activeRole === 'admin' ? (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Reviewer Verification &amp; Corrections
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Verified Marks (out of {selectedSubmission.maximumMarks})
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={selectedSubmission.maximumMarks}
                        value={adjustedMarks}
                        onChange={(e) => setAdjustedMarks(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Audit Reason / Verification Note
                      </label>
                      <input
                        type="text"
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        placeholder="e.g. Question 4 step marks added"
                        className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
                      />
                    </div>
                  </div>

                  {/* Actions: Approve / Request Changes */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Please enter the reason / instructions for requested changes:');
                        if (reason) {
                          requestChanges(selectedSubmission.id, reason);
                          setSelectedSubmission(null);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors"
                    >
                      Request Changes
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const verifiedNum = parseFloat(adjustedMarks);
                        if (isNaN(verifiedNum)) {
                          alert('Please enter a valid mark.');
                          return;
                        }
                        correctAndApproveSubmission(
                          selectedSubmission.id,
                          verifiedNum,
                          reviewerComment.trim() || 'Verified by reviewer'
                        );
                        setSelectedSubmission(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200"
                    >
                      Approve &amp; Verify Result
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <ShieldAlert className="w-4 h-4 text-slate-400 inline mr-1" />
                  <span>
                    Student Mode: Only the reviewer (older sibling) can approve marks or modify verified values.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                <span>Submit Weekly Paper &amp; Upload PDF</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {formError}
                </div>
              )}

              {/* Subject, Paper Type, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value as SubjectId)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium"
                  >
                    {DEFAULT_SUBJECTS.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Paper Name / Number *
                  </label>
                  <input
                    type="text"
                    value={uploadPaperName}
                    onChange={(e) => setUploadPaperName(e.target.value)}
                    placeholder="e.g. Combined Maths Weekly Paper 09 (Calculus)"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Marks & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paper Date</label>
                  <input
                    type="date"
                    value={uploadPaperDate}
                    onChange={(e) => setUploadPaperDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Marks *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={uploadMarks}
                    onChange={(e) => setUploadMarks(e.target.value)}
                    placeholder="e.g. 68"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Marks *
                  </label>
                  <input
                    type="number"
                    value={uploadMaxMarks}
                    onChange={(e) => setUploadMaxMarks(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Multi-file PDF Upload Pickers */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  Attach PDF Files (Marked Script, Marking Scheme, Teacher Feedback)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                      1. Marked Answer Script
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(e, 'marked_paper')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-blue-600 file:text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                      2. Marking Scheme
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(e, 'marking_scheme')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-slate-700 file:text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                      3. Teacher Notes
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(e, 'teacher_feedback')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-slate-700 file:text-white"
                    />
                  </div>
                </div>

                {/* Staged files list */}
                {filesToUpload.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    {filesToUpload.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-700 flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200"
                      >
                        <span className="truncate">{item.file.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {uploadProgress !== null && (
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Notes for Reviewer
                </label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Please check Question 5 step mark deduction."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                >
                  Submit Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activeViewingFile && selectedSubmission && (
        <PdfViewerModal
          isOpen={!!activeViewingFile}
          onClose={() => setActiveViewingFile(null)}
          file={activeViewingFile}
          paperName={selectedSubmission.paperName}
          comments={selectedSubmission.comments}
          onAddComment={(content, pageNum) =>
            addReviewComment(selectedSubmission.id, content, pageNum)
          }
          userRole={activeRole}
        />
      )}
    </div>
  );
};
