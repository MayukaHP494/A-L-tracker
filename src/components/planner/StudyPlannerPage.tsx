import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Trash2,
  Edit2,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { StudySession, SubjectId, SessionStatus, WeeklyGoal } from '../../types/index.ts';
import { DEFAULT_SUBJECTS, formatSLDate } from '../../lib/storage.ts';

export const StudyPlannerPage: React.FC = () => {
  const {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    goals,
    updateWeeklyGoal,
    topics,
  } = useApp();

  const currentGoal: WeeklyGoal = goals[0] || {
    id: 'curr_goal',
    weekStartDate: new Date().toISOString().split('T')[0],
    targetStudyHours: 25,
    targetPapers: 3,
    targetHomeworkCompleted: 4,
  };

  // Target hours edit mode
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetHours, setTargetHours] = useState(String(currentGoal.targetStudyHours));
  const [targetPapers, setTargetPapers] = useState(String(currentGoal.targetPapers));
  const [targetHw, setTargetHw] = useState(String(currentGoal.targetHomeworkCompleted));
  const [reviewAchievements, setReviewAchievements] = useState(currentGoal.achievements || '');
  const [reviewDifficulties, setReviewDifficulties] = useState(currentGoal.difficulties || '');
  const [reviewPriorities, setReviewPriorities] = useState(currentGoal.nextWeekPriorities || '');

  // Add / Edit session modal
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [sessSubject, setSessSubject] = useState<SubjectId>('combined_maths');
  const [sessDate, setSessDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessStartTime, setSessStartTime] = useState('16:00');
  const [sessPlannedMins, setSessPlannedMins] = useState('120');
  const [sessActualMins, setSessActualMins] = useState('');
  const [sessTopicId, setSessTopicId] = useState('');
  const [sessObjective, setSessObjective] = useState('');
  const [sessStatus, setSessStatus] = useState<SessionStatus>('scheduled');

  // Actual vs Planned calculation
  const totalPlannedMins = sessions.reduce((acc, s) => acc + s.plannedMinutes, 0);
  const totalActualMins = sessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  const plannedHours = Number((totalPlannedMins / 60).toFixed(1));
  const actualHours = Number((totalActualMins / 60).toFixed(1));
  const progressPct =
    currentGoal.targetStudyHours > 0
      ? Math.min(100, Math.round((actualHours / currentGoal.targetStudyHours) * 100))
      : 0;

  // Today's checklist
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date === todayStr);

  const handleOpenAddSession = () => {
    setEditingSession(null);
    setSessSubject('combined_maths');
    setSessDate(todayStr);
    setSessStartTime('16:00');
    setSessPlannedMins('90');
    setSessActualMins('');
    const subT = topics.find((t) => t.subjectId === 'combined_maths');
    setSessTopicId(subT ? subT.id : '');
    setSessObjective('');
    setSessStatus('scheduled');
    setIsSessionModalOpen(true);
  };

  const handleOpenEditSession = (sess: StudySession) => {
    setEditingSession(sess);
    setSessSubject(sess.subjectId);
    setSessDate(sess.date);
    setSessStartTime(sess.startTime);
    setSessPlannedMins(String(sess.plannedMinutes));
    setSessActualMins(sess.actualMinutes ? String(sess.actualMinutes) : '');
    setSessTopicId(sess.topicId || '');
    setSessObjective(sess.objective);
    setSessStatus(sess.status);
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessObjective.trim()) return;

    const payload = {
      subjectId: sessSubject,
      date: sessDate,
      startTime: sessStartTime,
      plannedMinutes: parseInt(sessPlannedMins, 10) || 60,
      actualMinutes: sessActualMins ? parseInt(sessActualMins, 10) : undefined,
      topicId: sessTopicId || undefined,
      objective: sessObjective.trim(),
      status: sessStatus,
    };

    if (editingSession) {
      updateSession(editingSession.id, payload);
    } else {
      addSession(payload);
    }

    setIsSessionModalOpen(false);
  };

  const handleSaveGoal = () => {
    updateWeeklyGoal({
      ...currentGoal,
      targetStudyHours: parseFloat(targetHours) || 25,
      targetPapers: parseInt(targetPapers, 10) || 3,
      targetHomeworkCompleted: parseInt(targetHw, 10) || 4,
      achievements: reviewAchievements.trim() || undefined,
      difficulties: reviewDifficulties.trim() || undefined,
      nextWeekPriorities: reviewPriorities.trim() || undefined,
    });
    setIsEditingGoal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <CalendarDays className="w-6 h-6 mr-2 text-indigo-600" />
            <span>Weekly Study Planner &amp; Targets</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain daily study discipline, track planned vs actual hours, and reflect on weekly priorities.
          </p>
        </div>

        <button
          onClick={handleOpenAddSession}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-200 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Plan Study Session</span>
        </button>
      </div>

      {/* Target Hours & Goal Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Current Week Target &amp; Progress
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Target: {currentGoal.targetStudyHours} Study Hours / Week
            </h3>
          </div>
          <button
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {isEditingGoal ? 'Cancel' : 'Edit Targets & Weekly Review'}
          </button>
        </div>

        {/* Progress Bar Planned vs Actual */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">
                Actual Logged: <strong>{actualHours} hrs</strong> (Planned: {plannedHours} hrs)
              </span>
              <span className="font-black text-indigo-600">{progressPct}% of Goal</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-around p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <div className="text-xs font-bold text-slate-900">{currentGoal.targetPapers}</div>
              <div className="text-[10px] text-slate-500 uppercase">Target Papers</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="text-xs font-bold text-slate-900">
                {currentGoal.targetHomeworkCompleted}
              </div>
              <div className="text-[10px] text-slate-500 uppercase">Target HW</div>
            </div>
          </div>
        </div>

        {/* Goal Edit Drawer */}
        {isEditingGoal && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Study Hours / Week
                </label>
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Full Papers / Week
                </label>
                <input
                  type="number"
                  value={targetPapers}
                  onChange={(e) => setTargetPapers(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target HW Completed / Week
                </label>
                <input
                  type="number"
                  value={targetHw}
                  onChange={(e) => setTargetHw(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>
            </div>

            {/* Weekly Reflections */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Achievements
                </label>
                <textarea
                  rows={2}
                  value={reviewAchievements}
                  onChange={(e) => setReviewAchievements(e.target.value)}
                  placeholder="e.g. Mastered organic reaction sequences"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Difficulties Faced
                </label>
                <textarea
                  rows={2}
                  value={reviewDifficulties}
                  onChange={(e) => setReviewDifficulties(e.target.value)}
                  placeholder="e.g. Lost focus during Physics Doppler question practice"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Next Week Priorities
                </label>
                <textarea
                  rows={2}
                  value={reviewPriorities}
                  onChange={(e) => setReviewPriorities(e.target.value)}
                  placeholder="e.g. Complete 2021 Combined Maths full paper under 3 hours"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGoal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Save Weekly Goals &amp; Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Checklist & Scheduled Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Checklist (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <CheckSquare className="w-4 h-4 mr-1.5 text-indigo-600" />
              <span>Today&apos;s Checklist ({formatSLDate(todayStr)})</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-2">
            {todaySessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No study sessions scheduled for today yet.
              </div>
            ) : (
              todaySessions.map((sess) => {
                const isDone = sess.status === 'completed';
                return (
                  <div
                    key={sess.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      isDone ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50/40 border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 truncate">
                      <button
                        onClick={() =>
                          updateSession(sess.id, {
                            status: isDone ? 'scheduled' : 'completed',
                            actualMinutes: isDone ? undefined : sess.plannedMinutes,
                          })
                        }
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div className="truncate">
                        <div
                          className={`text-xs font-bold text-slate-900 truncate ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {sess.objective}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {sess.startTime} &bull; {sess.plannedMinutes} mins
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: All Scheduled Study Sessions (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recorded Study Sessions</h3>
            <span className="text-xs text-slate-400">{sessions.length} total sessions</span>
          </div>

          <div className="space-y-2.5">
            {sessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No study sessions planned yet.
              </div>
            ) : (
              sessions.map((sess) => {
                const subInfo = DEFAULT_SUBJECTS.find((s) => s.id === sess.subjectId);
                const isCompleted = sess.status === 'completed';
                return (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-2.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: subInfo?.color }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className="text-xs font-bold"
                            style={{ color: subInfo?.color }}
                          >
                            {subInfo?.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatSLDate(sess.date)} at {sess.startTime}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : sess.status === 'partially_completed'
                                ? 'bg-amber-100 text-amber-800'
                                : sess.status === 'missed'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sess.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{sess.objective}</h4>
                        <div className="text-[11px] text-slate-500">
                          Planned: {sess.plannedMinutes} mins
                          {sess.actualMinutes && ` &bull; Actual: ${sess.actualMinutes} mins`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditSession(sess)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete study session?')) {
                            deleteSession(sess.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Session Modal */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              {editingSession ? 'Edit Study Session' : 'Plan Study Session'}
            </h3>

            <form onSubmit={handleSaveSession} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={sessSubject}
                  onChange={(e) => setSessSubject(e.target.value as SubjectId)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium"
                >
                  {DEFAULT_SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={sessDate}
                    onChange={(e) => setSessDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={sessStartTime}
                    onChange={(e) => setSessStartTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Planned (mins)
                  </label>
                  <input
                    type="number"
                    value={sessPlannedMins}
                    onChange={(e) => setSessPlannedMins(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actual (mins)
                  </label>
                  <input
                    type="number"
                    value={sessActualMins}
                    onChange={(e) => setSessActualMins(e.target.value)}
                    placeholder="e.g. 110"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={sessStatus}
                    onChange={(e) => setSessStatus(e.target.value as SessionStatus)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="partially_completed">Partial</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objective / Target *
                </label>
                <textarea
                  rows={2}
                  value={sessObjective}
                  onChange={(e) => setSessObjective(e.target.value)}
                  placeholder="e.g. Complete 5 structured essay questions from 2022 Chemistry paper"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-200"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
