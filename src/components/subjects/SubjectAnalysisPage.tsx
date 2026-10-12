import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  Tag,
  Trash2,
  Edit2,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { SubjectId, TopicItem, TopicPriority } from '../../types/index.ts';
import { DEFAULT_SUBJECTS, formatSLDate } from '../../lib/storage.ts';

export const SubjectAnalysisPage: React.FC = () => {
  const {
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    resetTopicsToOfficialSyllabus,
    papers,
    homework,
    subjectStats,
    settings,
    activeRole,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('combined_maths');
  const [priorityFilter, setPriorityFilter] = useState<TopicPriority | 'all'>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [searchTopic, setSearchTopic] = useState('');

  // Available units for current subject
  const availableUnits = useMemo(() => {
    const units = Array.from(
      new Set(topics.filter((t) => t.subjectId === selectedSubject).map((t) => t.unitOrLesson))
    );
    return ['all', ...units];
  }, [topics, selectedSubject]);

  // Add/Edit Topic Modal state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<TopicItem | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSinhala, setNewTopicSinhala] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newPriority, setNewPriority] = useState<TopicPriority>('high');
  const [newSectionsText, setNewSectionsText] = useState('');

  // Filter topics for selected subject
  const currentSubjectTopics = useMemo(() => {
    return topics
      .filter((t) => t.subjectId === selectedSubject)
      .filter((t) => (selectedUnit !== 'all' ? t.unitOrLesson === selectedUnit : true))
      .filter((t) => (priorityFilter !== 'all' ? t.priority === priorityFilter : true))
      .filter((t) => {
        if (!searchTopic.trim()) return true;
        const q = searchTopic.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.sinhalaName.toLowerCase().includes(q) ||
          t.unitOrLesson.toLowerCase().includes(q)
        );
      });
  }, [topics, selectedSubject, selectedUnit, priorityFilter, searchTopic]);

  // Compute topic metrics based on papers linked to topics
  const topicMetrics = useMemo(() => {
    const metrics: Record<
      string,
      {
        paperCount: number;
        avgPercentage?: number;
        status: 'strong' | 'weak' | 'needs_revision' | 'untested';
      }
    > = {};

    topics.forEach((t) => {
      const linkedPapers = papers.filter((p) => p.topicIds?.includes(t.id));
      if (linkedPapers.length === 0) {
        metrics[t.id] = { paperCount: 0, status: 'untested' };
      } else {
        const sum = linkedPapers.reduce((acc, p) => acc + p.percentage, 0);
        const avg = Number((sum / linkedPapers.length).toFixed(1));
        let status: 'strong' | 'weak' | 'needs_revision' = 'needs_revision';
        if (avg >= 75) status = 'strong';
        else if (avg < settings.weakTopicThreshold) status = 'weak';

        metrics[t.id] = {
          paperCount: linkedPapers.length,
          avgPercentage: avg,
          status,
        };
      }
    });

    return metrics;
  }, [topics, papers, settings.weakTopicThreshold]);

  const activeSubInfo = DEFAULT_SUBJECTS.find((s) => s.id === selectedSubject)!;
  const currentSubStats = subjectStats[selectedSubject];

  // Open topic create / edit
  const handleOpenAddTopic = () => {
    setTopicToEdit(null);
    setNewTopicName('');
    setNewTopicSinhala('');
    setNewUnitName(selectedSubject === 'combined_maths' ? 'Pure Mathematics' : 'Unit 1');
    setNewPriority('high');
    setNewSectionsText('');
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (topic: TopicItem) => {
    setTopicToEdit(topic);
    setNewTopicName(topic.name);
    setNewTopicSinhala(topic.sinhalaName);
    setNewUnitName(topic.unitOrLesson);
    setNewPriority(topic.priority);
    setNewSectionsText(topic.sections.map((s) => s.name).join('\n'));
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const parsedSections = newSectionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((name, idx) => ({ id: `sec_${Date.now()}_${idx}`, name }));

    if (topicToEdit) {
      updateTopic(topicToEdit.id, {
        name: newTopicName.trim(),
        sinhalaName: newTopicSinhala.trim(),
        unitOrLesson: newUnitName.trim(),
        priority: newPriority,
        sections: parsedSections.length > 0 ? parsedSections : topicToEdit.sections,
      });
    } else {
      addTopic({
        subjectId: selectedSubject,
        name: newTopicName.trim(),
        sinhalaName: newTopicSinhala.trim(),
        unitOrLesson: newUnitName.trim(),
        priority: newPriority,
        sections: parsedSections,
      });
    }

    setIsTopicModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
            <span>Subject &amp; Syllabus Analysis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Sri Lankan GCE A/L syllabus breakdown with topic strengths, weak areas, and paper correlations.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => {
              if (window.confirm('Reset and sync all syllabus topics to the official Sri Lankan GCE A/L syllabus (Pure & Applied Maths, Physics Units 1-9, Chemistry Units 1-12)?')) {
                resetTopicsToOfficialSyllabus();
              }
            }}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300 shadow-2xs"
            title="Reset topics to standard Sri Lankan A/L syllabus"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Sync Official Syllabus</span>
          </button>

          {activeRole === 'admin' && (
            <button
              onClick={handleOpenAddTopic}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs shadow-blue-200 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Topic</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEFAULT_SUBJECTS.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          const stats = subjectStats[sub.id];
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                setSelectedUnit('all');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black" style={{ color: sub.color }}>
                  {sub.name}
                </span>
                <span className="text-[11px] font-medium text-slate-500">{sub.sinhalaName}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-black text-slate-900">
                  {stats.averagePercentage !== undefined ? `${stats.averagePercentage}%` : '—'}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {stats.totalPapers} Paper{stats.totalPapers === 1 ? '' : 's'}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                <span>Homework: {stats.completionRate}% complete</span>
                <span className="font-semibold text-slate-700">Target: {sub.targetPercentage}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder={`Search ${activeSubInfo.name} lessons or sections...`}
              className="w-full sm:w-72 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Priority:
            </span>
            {(['all', 'high', 'medium', 'low'] as (TopicPriority | 'all')[]).map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  priorityFilter === pr
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>

        {/* Unit / Lesson Category Filters */}
        {availableUnits.length > 2 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 mr-1">
              Unit / Lesson:
            </span>
            {availableUnits.map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedUnit === unit
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {unit === 'all' ? 'All Units & Lessons' : unit}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Topics Hierarchy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSubjectTopics.map((topic) => {
          const metrics = topicMetrics[topic.id];
          return (
            <div
              key={topic.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Unit & Priority Badges */}
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                    {topic.unitOrLesson}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        topic.priority === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : topic.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {topic.priority} Priority
                    </span>

                    {/* Edit/Delete for Admin */}
                    {activeRole === 'admin' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditTopic(topic)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Edit topic"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete topic '${topic.name}'?`)) {
                              deleteTopic(topic.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Topic Name English & Sinhala */}
                <h3 className="text-sm font-bold text-slate-900">{topic.name}</h3>
                <div className="text-xs text-slate-500 font-medium">{topic.sinhalaName}</div>

                {/* Sections / Subtopics */}
                {topic.sections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Syllabus Sections ({topic.sections.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {topic.sections.map((sec) => (
                        <span
                          key={sec.id}
                          className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700"
                        >
                          {sec.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Metrics Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Recorded Papers: </span>
                  <strong className="text-slate-800">{metrics?.paperCount || 0}</strong>
                </div>

                <div>
                  {metrics?.avgPercentage !== undefined ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${
                        metrics.status === 'strong'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : metrics.status === 'weak'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {metrics.status === 'strong' ? (
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      ) : metrics.status === 'weak' ? (
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      )}
                      <span>
                        {metrics.avgPercentage}%{' '}
                        {metrics.status === 'weak'
                          ? '(Weak)'
                          : metrics.status === 'strong'
                          ? '(Strong)'
                          : '(Revise)'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No paper data yet</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Topic Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              {topicToEdit ? 'Edit Topic' : 'Add New Syllabus Topic'}
            </h3>
            <form onSubmit={handleSaveTopic} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic Title (English) *
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Complex Numbers & Argand Diagrams"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic Title (Sinhala)
                </label>
                <input
                  type="text"
                  value={newTopicSinhala}
                  onChange={(e) => setNewTopicSinhala(e.target.value)}
                  placeholder="e.g. සංකීර්ණ සංඛ්‍යා"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Lesson</label>
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    placeholder="e.g. Pure Mathematics"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TopicPriority)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtopics / Sections (one per line)
                </label>
                <textarea
                  rows={3}
                  value={newSectionsText}
                  onChange={(e) => setNewSectionsText(e.target.value)}
                  placeholder="Modulus and Argument&#10;Loci in Argand Diagram&#10;De Moivre's Theorem"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-200"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
