import React, { useState, useEffect } from 'react';
import { X, Calculator, Plus, Trash2, AlertCircle } from 'lucide-react';
import { SubjectId, PaperType, PaperRecord, PaperPartScore } from '../../types/index.ts';
import { DEFAULT_SUBJECTS } from '../../lib/storage.ts';
import { useApp } from '../../context/AppContext.tsx';

interface PaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperToEdit?: PaperRecord | null;
  repeatFromPaper?: PaperRecord | null;
  defaultSubjectId?: SubjectId;
}

export const PaperModal: React.FC<PaperModalProps> = ({
  isOpen,
  onClose,
  paperToEdit,
  repeatFromPaper,
  defaultSubjectId,
}) => {
  const { addPaper, updatePaper, topics, activeRole } = useApp();

  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubjectId || 'combined_maths');
  const [paperName, setPaperName] = useState('');
  const [paperNumber, setPaperNumber] = useState('');
  const [paperDate, setPaperDate] = useState(new Date().toISOString().split('T')[0]);
  const [paperType, setPaperType] = useState<PaperType>('full_paper');
  const [marksObtained, setMarksObtained] = useState<string>('');
  const [maximumMarks, setMaximumMarks] = useState<string>('100');
  const [durationMinutes, setDurationMinutes] = useState<string>('180');
  const [questionsAttempted, setQuestionsAttempted] = useState<string>('');
  const [questionsCorrect, setQuestionsCorrect] = useState<string>('');
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Paper I & Paper II split
  const [hasParts, setHasParts] = useState(false);
  const [parts, setParts] = useState<PaperPartScore[]>([
    { partName: 'Paper I (Part A & B)', obtained: 0, max: 50 },
    { partName: 'Paper II (Structured/Essay)', obtained: 0, max: 50 },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (paperToEdit) {
      setSubjectId(paperToEdit.subjectId);
      setPaperName(paperToEdit.paperName);
      setPaperNumber(paperToEdit.paperNumber || '');
      setPaperDate(paperToEdit.paperDate);
      setPaperType(paperToEdit.paperType);
      setMarksObtained(String(paperToEdit.marksObtained));
      setMaximumMarks(String(paperToEdit.maximumMarks));
      setDurationMinutes(paperToEdit.durationMinutes ? String(paperToEdit.durationMinutes) : '');
      setQuestionsAttempted(paperToEdit.questionsAttempted ? String(paperToEdit.questionsAttempted) : '');
      setQuestionsCorrect(paperToEdit.questionsCorrect ? String(paperToEdit.questionsCorrect) : '');
      setAttemptNumber(paperToEdit.attemptNumber);
      setSelectedTopicIds(paperToEdit.topicIds || []);
      setNotes(paperToEdit.notes || '');
      if (paperToEdit.parts && paperToEdit.parts.length > 0) {
        setHasParts(true);
        setParts(paperToEdit.parts);
      } else {
        setHasParts(false);
      }
    } else if (repeatFromPaper) {
      setSubjectId(repeatFromPaper.subjectId);
      setPaperName(repeatFromPaper.paperName);
      setPaperNumber(repeatFromPaper.paperNumber || '');
      setPaperDate(new Date().toISOString().split('T')[0]);
      setPaperType(repeatFromPaper.paperType);
      setMarksObtained('');
      setMaximumMarks(String(repeatFromPaper.maximumMarks));
      setDurationMinutes(repeatFromPaper.durationMinutes ? String(repeatFromPaper.durationMinutes) : '');
      setAttemptNumber(repeatFromPaper.attemptNumber + 1);
      setSelectedTopicIds(repeatFromPaper.topicIds || []);
      setNotes(`Repeat attempt #${repeatFromPaper.attemptNumber + 1} for revision.`);
      setHasParts(false);
    } else {
      // Clean defaults
      setSubjectId(defaultSubjectId || 'combined_maths');
      setPaperName('');
      setPaperNumber('');
      setPaperDate(new Date().toISOString().split('T')[0]);
      setPaperType('full_paper');
      setMarksObtained('');
      setMaximumMarks('100');
      setDurationMinutes('180');
      setQuestionsAttempted('');
      setQuestionsCorrect('');
      setAttemptNumber(1);
      setSelectedTopicIds([]);
      setNotes('');
      setHasParts(false);
    }
    setErrorMsg(null);
  }, [paperToEdit, repeatFromPaper, isOpen]);

  // If parts are enabled, auto-sum marks
  useEffect(() => {
    if (hasParts && parts.length > 0) {
      const sumObt = parts.reduce((acc, p) => acc + (Number(p.obtained) || 0), 0);
      const sumMax = parts.reduce((acc, p) => acc + (Number(p.max) || 0), 0);
      setMarksObtained(String(sumObt));
      setMaximumMarks(String(sumMax));
    }
  }, [hasParts, parts]);

  if (!isOpen) return null;

  // Calculate live percentage
  const numObt = parseFloat(marksObtained);
  const numMax = parseFloat(maximumMarks);
  const calculatedPercentage =
    !isNaN(numObt) && !isNaN(numMax) && numMax > 0 ? ((numObt / numMax) * 100).toFixed(1) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!paperName.trim()) {
      setErrorMsg('Please enter a paper name or identifier.');
      return;
    }

    if (isNaN(numObt) || numObt < 0) {
      setErrorMsg('Marks obtained must be a valid number greater than or equal to 0.');
      return;
    }

    if (isNaN(numMax) || numMax <= 0) {
      setErrorMsg('Maximum marks must be greater than 0.');
      return;
    }

    if (numObt > numMax) {
      setErrorMsg(`Marks obtained (${numObt}) cannot exceed maximum marks (${numMax}).`);
      return;
    }

    const payload = {
      subjectId,
      paperName: paperName.trim(),
      paperNumber: paperNumber.trim() || undefined,
      paperDate,
      paperType,
      marksObtained: numObt,
      maximumMarks: numMax,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
      questionsAttempted: questionsAttempted ? parseInt(questionsAttempted, 10) : undefined,
      questionsCorrect: questionsCorrect ? parseInt(questionsCorrect, 10) : undefined,
      attemptNumber: attemptNumber || 1,
      parentPaperId: repeatFromPaper ? repeatFromPaper.id : paperToEdit?.parentPaperId,
      parts: hasParts ? parts : undefined,
      topicIds: selectedTopicIds,
      notes: notes.trim() || undefined,
      isVerifiedByReviewer: activeRole === 'admin',
      verifiedMarks: activeRole === 'admin' ? numObt : undefined,
    };

    if (paperToEdit) {
      updatePaper(paperToEdit.id, payload);
    } else {
      addPaper(payload);
    }

    onClose();
  };

  const subjectTopics = topics.filter((t) => t.subjectId === subjectId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {paperToEdit
                ? 'Edit Paper Marks Record'
                : repeatFromPaper
                ? `Log Repeat Attempt (${paperName})`
                : 'Record New Paper Marks'}
            </h3>
            <p className="text-xs text-slate-500">
              Support for Full Paper, MCQ, Structured Essay, or Class Tests with custom max marks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Subject & Paper Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {DEFAULT_SUBJECTS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.sinhalaName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Paper Type</label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value as PaperType)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="full_paper">Full Examination Paper</option>
                <option value="structured_essay">Structured Essay / Theory</option>
                <option value="mcq">MCQ Paper (50 Qs)</option>
                <option value="topical_paper">Topical Paper</option>
                <option value="class_test">Weekly Class Test</option>
              </select>
            </div>
          </div>

          {/* Paper Name, Paper Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Paper Name / Description *
              </label>
              <input
                type="text"
                value={paperName}
                onChange={(e) => setPaperName(e.target.value)}
                placeholder="e.g. 2026 Rotary Paper Class 08 - Mechanics"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Paper Date *</label>
              <input
                type="date"
                value={paperDate}
                onChange={(e) => setPaperDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Paper I / Paper II Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Record Paper I &amp; Paper II breakdown separately
              </div>
              <div className="text-[11px] text-slate-500">
                Automatically calculates the sum for the total paper mark.
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasParts}
              onChange={(e) => setHasParts(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </div>

          {/* If parts enabled, show part inputs */}
          {hasParts && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
              {parts.map((p, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs">
                  <input
                    type="text"
                    value={p.partName}
                    onChange={(e) => {
                      const updated = [...parts];
                      updated[idx].partName = e.target.value;
                      setParts(updated);
                    }}
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] text-slate-500">Obtained:</span>
                    <input
                      type="number"
                      value={p.obtained}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[idx].obtained = parseFloat(e.target.value) || 0;
                        setParts(updated);
                      }}
                      className="w-20 p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] text-slate-500">Max:</span>
                    <input
                      type="number"
                      value={p.max}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[idx].max = parseFloat(e.target.value) || 0;
                        setParts(updated);
                      }}
                      className="w-20 p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Marks Obtained, Max Marks & Calculated Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                disabled={hasParts}
                placeholder="e.g. 68"
                className="w-full text-sm font-bold text-slate-900 rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maximum Marks *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={maximumMarks}
                onChange={(e) => setMaximumMarks(e.target.value)}
                disabled={hasParts}
                placeholder="e.g. 100, 50, 40"
                className="w-full text-sm font-bold text-slate-900 rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-700 mb-1">Calculated Percentage</span>
              <div className="text-xl font-extrabold text-blue-600 bg-white p-2 rounded-xl border border-blue-200 text-center">
                {calculatedPercentage !== null ? `${calculatedPercentage}%` : '—'}
              </div>
            </div>
          </div>

          {/* Extra Details: Duration, Attempt #, Questions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="180"
                className="w-full text-xs rounded-xl border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Attempt #</label>
              <input
                type="number"
                min="1"
                value={attemptNumber}
                onChange={(e) => setAttemptNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Qs Attempted
              </label>
              <input
                type="number"
                value={questionsAttempted}
                onChange={(e) => setQuestionsAttempted(e.target.value)}
                placeholder="e.g. 50"
                className="w-full text-xs rounded-xl border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Qs Correct
              </label>
              <input
                type="number"
                value={questionsCorrect}
                onChange={(e) => setQuestionsCorrect(e.target.value)}
                placeholder="e.g. 42"
                className="w-full text-xs rounded-xl border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Associated Topics */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Associated Syllabus Topics
            </label>
            <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-wrap gap-1.5">
              {subjectTopics.map((topic) => {
                const isSelected = selectedTopicIds.includes(topic.id);
                return (
                  <button
                    type="button"
                    key={topic.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTopicIds(selectedTopicIds.filter((id) => id !== topic.id));
                      } else {
                        setSelectedTopicIds([...selectedTopicIds, topic.id]);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {topic.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student / Reviewer Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lost 5 marks on trigonometry deduction in question 8; strong in algebra."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
            >
              {paperToEdit ? 'Save Changes' : 'Record Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
