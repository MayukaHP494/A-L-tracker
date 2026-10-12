import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  MessageSquare,
  Plus,
  HardDrive,
  Download,
  Upload,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { AttachedFile, ReviewComment, Role } from '../../types/index.ts';
import { formatSLDate } from '../../lib/storage.ts';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: AttachedFile | null;
  paperName: string;
  comments: ReviewComment[];
  onAddComment: (content: string, pageNumber?: number) => void;
  onUploadReviewCopy?: (file: File) => void;
  userRole: Role;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  file,
  paperName,
  comments,
  onAddComment,
  onUploadReviewCopy,
  userRole,
}) => {
  const [zoom, setZoom] = useState(100);
  const [newComment, setNewComment] = useState('');
  const [commentPage, setCommentPage] = useState<string>('1');
  const [reviewCopyFile, setReviewCopyFile] = useState<File | null>(null);

  if (!isOpen || !file) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const pageNum = parseInt(commentPage, 10);
    onAddComment(newComment.trim(), isNaN(pageNum) ? undefined : pageNum);
    setNewComment('');
  };

  const handleReviewCopySubmit = () => {
    if (reviewCopyFile && onUploadReviewCopy) {
      onUploadReviewCopy(reviewCopyFile);
      setReviewCopyFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full h-[95vh] max-w-6xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Viewer Header Toolbar */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-1.5 bg-blue-600 rounded-lg shrink-0">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm font-bold truncate">{file.name}</h3>
              <p className="text-[11px] text-slate-400 truncate">
                {paperName} • {(file.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {formatSLDate(file.uploadedAt)}
              </p>
            </div>
          </div>

          {/* Controls: Zoom, Drive Link, Download, Close */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Zoom */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-700/60 rounded-lg p-1 text-xs">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 15))}
                className="p-1 hover:bg-slate-600 rounded text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-1 text-[11px] font-mono text-slate-300">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 15))}
                className="p-1 hover:bg-slate-600 rounded text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Google Drive Link if Synced */}
            {file.driveWebViewLink && (
              <a
                href={file.driveWebViewLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-2.5 py-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium hover:bg-emerald-600/40 transition-colors"
                title="Open directly in Google Drive"
              >
                <HardDrive className="w-3.5 h-3.5 mr-1" />
                <span className="hidden md:inline">Drive View</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}

            {/* Direct Download */}
            {file.dataUrl && (
              <a
                href={file.dataUrl}
                download={file.name}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: PDF Frame + Side Annotation Drawer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
          {/* PDF Viewer Container */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 bg-slate-900/60">
            {file.dataUrl ? (
              <div
                className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex items-center justify-center"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <iframe
                  src={`${file.dataUrl}#toolbar=1&navpanes=0`}
                  title={file.name}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="text-center p-8 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-2" />
                <h4 className="text-sm font-bold text-slate-200">PDF Preview Not Available</h4>
                <p className="text-xs text-slate-400 mt-1">
                  File content is stored on Google Drive or remote storage.
                </p>
                {file.driveWebViewLink && (
                  <a
                    href={file.driveWebViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Open in Google Drive Viewer
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Side Drawer: Annotation Notes & Review Copy Upload */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-700 bg-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                <span>Page Annotations &amp; Feedback</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {comments.length} note{comments.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No annotations added yet.
                  <div className="text-[11px] text-slate-500 mt-1">
                    Reviewer can leave comments pinned to specific page numbers.
                  </div>
                </div>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-2.5 rounded-xl bg-slate-700/60 border border-slate-600 text-xs text-slate-200"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-blue-300">
                        {comm.authorName} ({comm.authorRole === 'admin' ? 'Reviewer' : 'Student'})
                      </span>
                      {comm.pageNumber && (
                        <span className="bg-slate-600 px-1.5 py-0.2 rounded text-[10px] text-slate-200">
                          Page {comm.pageNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-100 leading-relaxed">{comm.content}</p>
                    <div className="text-[10px] text-slate-500 mt-1 text-right">
                      {formatSLDate(comm.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="p-3 border-t border-slate-700 space-y-2 bg-slate-850">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add feedback / step note..."
                    className="w-full text-xs rounded-xl bg-slate-700 border border-slate-600 p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="w-16">
                  <input
                    type="number"
                    min="1"
                    value={commentPage}
                    onChange={(e) => setCommentPage(e.target.value)}
                    placeholder="Pg"
                    className="w-full text-xs rounded-xl bg-slate-700 border border-slate-600 p-2 text-white text-center focus:ring-1 focus:ring-blue-500"
                    title="Page number"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Post Annotation</span>
              </button>
            </form>

            {/* Reviewer Upload Reviewed Copy (Admin Only) */}
            {userRole === 'admin' && onUploadReviewCopy && (
              <div className="p-3 border-t border-slate-700 bg-slate-900/80">
                <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center">
                  <Upload className="w-3 h-3 mr-1 text-emerald-400" />
                  <span>Upload Annotated / Marked Copy</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Preserves original student script while attaching your marked version.
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReviewCopyFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-700 file:text-slate-200 cursor-pointer"
                />
                {reviewCopyFile && (
                  <button
                    onClick={handleReviewCopySubmit}
                    className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Save Marked Version
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
