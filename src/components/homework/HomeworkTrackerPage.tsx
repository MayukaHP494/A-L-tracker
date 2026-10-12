import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  HelpCircle,
  FileQuestion,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import {
  HomeworkTask,
  SubjectId,
  HomeworkStatus,
  HomeworkType,
} from '../../types/index.ts';
import { DEFAULT_SUBJECTS, formatSLDate, getRelativeDeadline } from '../../lib/storage.ts';

export const HomeworkTrackerPage: React.FC = () => {
  const {
    homework,
    addHomework,
    updateHomework,
    deleteHomework,
    quickToggleHomeworkComplete,
    topics,
    subjectStats,
  } = useApp();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<HomeworkStatus | 'all' | 'overdue'>('all');
  const [typeFilter, setTypeFilter] = useState<HomeworkType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HomeworkTask | null>(null);

  // Form state
  const [subjectId, setSubjectId] = useState<SubjectId>('combined_maths');
  const [topicId, setTopicId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [teacherOrClass, setTeacherOrClass] = useState('');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [homeworkType, setHomeworkType] = useState<HomeworkType>('tutorial');
  const [estimatedMinutes, setEstimatedMinutes] = useState('90');
  const [questionsAssigned, setQuestionsAssigned] = useState('15');
  const [questionsAttempted, setQuestionsAttempted] = useState('0');
  const [questionsCompleted, setQuestionsCompleted] = useState('0');
  const [status, setStatus] = useState<HomeworkStatus>('not_started');
  const [difficultiesFaced, setDifficultiesFaced] = useState('');
  const [questionsForTeacher, setQuestionsForTeacher] = useState('');
  const [notes, setNotes] = useState('');

  // Available topics for chosen subject
  const availableTopics = useMemo(() => {
    return topics.filter((t) => t.subjectId === subjectId);
  }, [topics, subjectId]);

  // Available sections for chosen topic
  const availableSections = useMemo(() => {
    const sel = topics.find((t) => t.id === topicId);
    return sel ? sel.sections : [];
  }, [topics, topicId]);

  // Overall counters
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = homework.filter((h) => h.status !== 'completed' && h.deadline < todayStr).length;
  const inProgressCount = homework.filter((h) => h.status === 'in_progress').length;
  const completedCount = homework.filter((h) => h.status === 'completed').length;
  const totalCount = homework.filter((h) => h.status !== 'cancelled').length;
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return homework
      .filter((h) => {
        if (subjectFilter !== 'all' && h.subjectId !== subjectFilter) return false;
        if (typeFilter !== 'all' && h.homeworkType !== typeFilter) return false;
        if (statusFilter === 'overdue') {
          return h.status !== 'completed' && h.deadline < todayStr;
        } else if (statusFilter !== 'all') {
          return h.status === statusFilter;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            h.title.toLowerCase().includes(q) ||
            h.teacherOrClass.toLowerCase().includes(q) ||
            (h.description && h.description.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [homework, subjectFilter, statusFilter, typeFilter, searchQuery, todayStr]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setSubjectId('combined_maths');
    const firstTop = topics.find((t) => t.subjectId === 'combined_maths');
    setTopicId(firstTop ? firstTop.id : '');
    setSectionId(firstTop && firstTop.sections[0] ? firstTop.sections[0].id : '');
    setTeacherOrClass('Ruwan Darshana Sir');
    setAssignedDate(new Date().toISOString().split('T')[0]);
    setDeadline(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setTitle('');
    setDescription('');
    setHomeworkType('tutorial');
    setEstimatedMinutes('90');
    setQuestionsAssigned('15');
    setQuestionsAttempted('0');
    setQuestionsCompleted('0');
    setStatus('not_started');
    setDifficultiesFaced('');
    setQuestionsForTeacher('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: HomeworkTask) => {
    setEditingTask(task);
    setSubjectId(task.subjectId);
    setTopicId(task.topicId);
    setSectionId(task.sectionId || '');
    setTeacherOrClass(task.teacherOrClass);
    setAssignedDate(task.assignedDate);
    setDeadline(task.deadline);
    setTitle(task.title);
    setDescription(task.description || '');
    setHomeworkType(task.homeworkType);
    setEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : '90');
    setQuestionsAssigned(String(task.questionsAssigned));
    setQuestionsAttempted(String(task.questionsAttempted));
    setQuestionsCompleted(String(task.questionsCompleted));
    setStatus(task.status);
    setDifficultiesFaced(task.difficultiesFaced || '');
    setQuestionsForTeacher(task.questionsForTeacher || '');
    setNotes(task.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedQs = parseInt(questionsAssigned, 10) || 0;
    const attemptedQs = parseInt(questionsAttempted, 10) || 0;
    const completedQs = parseInt(questionsCompleted, 10) || 0;
    const estMins = parseInt(estimatedMinutes, 10) || undefined;

    const payload = {
      subjectId,
      topicId: topicId || (availableTopics[0]?.id ?? ''),
      sectionId: sectionId || undefined,
      teacherOrClass: teacherOrClass.trim() || 'Tuition Class',
      assignedDate,
      deadline,
      title: title.trim(),
      description: description.trim() || undefined,
      homeworkType,
      estimatedMinutes: estMins,
      questionsAssigned: assignedQs,
      questionsAttempted: attemptedQs,
      questionsCompleted: completedQs,
      status,
      completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      difficultiesFaced: difficultiesFaced.trim() || undefined,
      questionsForTeacher: questionsForTeacher.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingTask) {
      updateHomework(editingTask.id, payload);
    } else {
      addHomework(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <CheckSquare className="w-6 h-6 mr-2 text-blue-600" />
            <span>Homework &amp; Tutorial Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchy: Subject &rarr; Lesson &rarr; Section &rarr; Homework tasks. Track overdue tasks, question completion, and teacher questions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs shadow-blue-200 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Assign New Homework</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Assigned
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all 3 subjects</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Completed
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{overallPct}% completion rate</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            In Progress
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600">{inProgressCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active tutorials</div>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            overdueCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`text-xs font-semibold uppercase tracking-wider ${
              overdueCount > 0 ? 'text-rose-700' : 'text-slate-400'
            }`}
          >
            Overdue Work
          </div>
          <div
            className={`mt-2 text-2xl font-black ${
              overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {overdueCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {overdueCount > 0 ? 'Requires immediate catch-up' : 'All deadlines met!'}
          </div>
        </div>
      </div>

      {/* Filter & View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tutor, or keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white font-medium"
            >
              <option value="all">All Subjects</option>
              {DEFAULT_SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Homework Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white font-medium"
            >
              <option value="all">All Task Types</option>
              <option value="tutorial">Tutorial Questions</option>
              <option value="past_paper">Past-Paper Questions</option>
              <option value="revision">Revision Exercises</option>
              <option value="mcq">MCQ Questions</option>
              <option value="structured_essay">Structured Essay</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'overdue', label: `Overdue (${overdueCount})`, isAlert: overdueCount > 0 },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'not_started', label: 'Not Started' },
              { id: 'completed', label: 'Completed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st.id
                    ? st.isAlert
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-900 text-white font-semibold'
                    : st.isAlert
                    ? 'bg-rose-100 text-rose-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-medium ${
                viewMode === 'list' ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-md font-medium ${
                viewMode === 'timeline'
                  ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Timeline / Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
            <CheckSquare className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Homework Tasks Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Assign homework to stay disciplined across tuition classes and past-paper revision.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subInfo = DEFAULT_SUBJECTS.find((s) => s.id === task.subjectId);
            const topic = topics.find((t) => t.id === task.topicId);
            const deadlineInfo = getRelativeDeadline(task.deadline);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-white/80 border-slate-200 opacity-90'
                    : deadlineInfo.isOverdue
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Left: Quick complete toggle + details */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => quickToggleHomeworkComplete(task.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 hover:border-blue-600 text-transparent'
                    }`}
                    title={isCompleted ? 'Mark as In Progress' : 'Quick mark Completed'}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                  </button>

                  <div className="space-y-1 min-w-0">
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

                      {topic && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          &bull; {topic.name}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 capitalize">
                        {task.homeworkType.replace('_', ' ')}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold text-slate-900 ${
                        isCompleted ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-600 line-clamp-1">{task.description}</p>
                    )}

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 pt-1">
                      <span>Tutor/Class: {task.teacherOrClass}</span>
                      <span>&bull;</span>
                      <span>Assigned: {formatSLDate(task.assignedDate)}</span>
                      {task.questionsAssigned > 0 && (
                        <>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-700">
                            Questions: {task.questionsCompleted} / {task.questionsAssigned}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Difficulties / Questions for teacher callout */}
                    {(task.difficultiesFaced || task.questionsForTeacher) && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                        {task.difficultiesFaced && (
                          <div>
                            <strong>Difficulty:</strong> {task.difficultiesFaced}
                          </div>
                        )}
                        {task.questionsForTeacher && (
                          <div>
                            <strong>Ask Teacher:</strong> {task.questionsForTeacher}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Deadline Badge & Action Buttons */}
                <div className="flex items-center space-x-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-2 md:pt-0">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : deadlineInfo.isOverdue
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 font-extrabold animate-pulse'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {isCompleted ? 'Completed' : deadlineInfo.text}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Deadline: {formatSLDate(task.deadline)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete homework '${task.title}'?`)) {
                          deleteHomework(task.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Homework Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              {editingTask ? 'Edit Homework Assignment' : 'Assign New Homework Task'}
            </h3>

            <form onSubmit={handleSaveHomework} className="mt-4 space-y-4">
              {/* Subject, Topic, Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      const newSub = e.target.value as SubjectId;
                      setSubjectId(newSub);
                      const fTop = topics.find((t) => t.subjectId === newSub);
                      setTopicId(fTop ? fTop.id : '');
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium"
                  >
                    {DEFAULT_SUBJECTS.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic/Lesson</label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium"
                  >
                    {availableTopics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="">General Section</option>
                    {availableSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Teacher/Class */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Homework Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Differentiation Past Paper Question Set (2018-2024)"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teacher / Class
                  </label>
                  <input
                    type="text"
                    value={teacherOrClass}
                    onChange={(e) => setTeacherOrClass(e.target.value)}
                    placeholder="e.g. Ruwan Darshana Sir"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              {/* Type, Assigned Date, Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={homeworkType}
                    onChange={(e) => setHomeworkType(e.target.value as HomeworkType)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="tutorial">Tutorial Questions</option>
                    <option value="past_paper">Past-Paper Questions</option>
                    <option value="revision">Revision Exercises</option>
                    <option value="mcq">MCQ Set</option>
                    <option value="structured_essay">Structured Essay</option>
                    <option value="theory">Theory Notes</option>
                    <option value="practical">Practical / Experiment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Questions Numbers & Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Questions Assigned
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={questionsAssigned}
                    onChange={(e) => setQuestionsAssigned(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Attempted
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={questionsAttempted}
                    onChange={(e) => setQuestionsAttempted(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Completed
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={questionsCompleted}
                    onChange={(e) => setQuestionsCompleted(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as HomeworkStatus)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white font-medium"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="needs_review">Needs Review</option>
                  </select>
                </div>
              </div>

              {/* Reflection: Difficulties faced & Questions to ask */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Difficulties Faced (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={difficultiesFaced}
                    onChange={(e) => setDifficultiesFaced(e.target.value)}
                    placeholder="e.g. Integration by parts where substitution failed"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Questions for Teacher (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={questionsForTeacher}
                    onChange={(e) => setQuestionsForTeacher(e.target.value)}
                    placeholder="e.g. Clarify condition for second derivative test"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-200"
                >
                  Save Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
