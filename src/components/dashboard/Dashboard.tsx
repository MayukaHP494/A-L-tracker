import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileText,
  CheckSquare,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { DEFAULT_SUBJECTS, formatSLDate, getDaysUntilExam, getRelativeDeadline } from '../../lib/storage.ts';
import { SubjectId, PaperRecord } from '../../types/index.ts';

type TimeFilter = '4w' | '12w' | '6m' | 'all';

export const Dashboard: React.FC = () => {
  const {
    settings,
    papers,
    homework,
    sessions,
    goals,
    subjectStats,
    overallAveragePercentage,
    setActiveTab,
    loadDemoRecords,
    activeRole,
    topics,
  } = useApp();

  // Chart state
  const [selectedSubjects, setSelectedSubjects] = useState<Record<SubjectId, boolean>>({
    combined_maths: true,
    physics: true,
    chemistry: true,
  });
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    paper: PaperRecord;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const daysLeft = getDaysUntilExam(settings.examDate);

  // Filter papers by time
  const filteredPapers = useMemo(() => {
    let list = [...papers].filter((p) =>
      settings.showOnlyApprovedMarksInDashboard ? p.isVerifiedByReviewer : true
    );

    if (timeFilter !== 'all') {
      const now = new Date();
      let daysBack = 28;
      if (timeFilter === '12w') daysBack = 84;
      if (timeFilter === '6m') daysBack = 180;
      const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      list = list.filter((p) => new Date(p.paperDate) >= cutoff);
    }

    return list.sort((a, b) => new Date(a.paperDate).getTime() - new Date(b.paperDate).getTime());
  }, [papers, timeFilter, settings.showOnlyApprovedMarksInDashboard]);

  // Overall homework stats
  const totalHomework = homework.filter((h) => h.status !== 'cancelled').length;
  const completedHomework = homework.filter((h) => h.status === 'completed').length;
  const homeworkRate = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueHomework = homework.filter((h) => h.status !== 'completed' && h.deadline < todayStr);
  const pendingHomework = homework.filter((h) => h.status === 'in_progress' || h.status === 'not_started');

  // Study hours goal
  const currentGoal = goals[0];
  const totalPlannedMins = sessions.reduce((acc, s) => acc + s.plannedMinutes, 0);
  const totalActualMins = sessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  const actualStudyHours = Number((totalActualMins / 60).toFixed(1));
  const plannedStudyHours = Number((totalPlannedMins / 60).toFixed(1));

  // Weak topic detection
  const weakTopics = useMemo(() => {
    return topics
      .filter((t) => {
        // Find papers tagging this topic
        const topicPapers = papers.filter((p) => p.topicIds?.includes(t.id));
        if (topicPapers.length === 0) return false;
        const avg =
          topicPapers.reduce((sum, p) => sum + p.percentage, 0) / topicPapers.length;
        return avg < settings.weakTopicThreshold;
      })
      .slice(0, 4);
  }, [topics, papers, settings.weakTopicThreshold]);

  // SVG Line Chart Dimensions & Scaling
  const chartHeight = 240;
  const chartWidth = 650;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Compute points for selected subjects
  const chartDataBySubject = useMemo(() => {
    const result: Record<SubjectId, { paper: PaperRecord; x: number; y: number }[]> = {
      combined_maths: [],
      physics: [],
      chemistry: [],
    };

    if (filteredPapers.length === 0) return result;

    const allDates = filteredPapers.map((p) => new Date(p.paperDate).getTime());
    const minDate = Math.min(...allDates);
    const maxDate = Math.max(...allDates);
    const dateRange = maxDate === minDate ? 1 : maxDate - minDate;

    DEFAULT_SUBJECTS.forEach((sub) => {
      const subPapers = filteredPapers.filter((p) => p.subjectId === sub.id);
      result[sub.id] = subPapers.map((p) => {
        const pTime = new Date(p.paperDate).getTime();
        const xRatio = maxDate === minDate ? 0.5 : (pTime - minDate) / dateRange;
        const x = padding.left + xRatio * innerWidth;
        // Y scale from 0 to 100%
        const y = padding.top + innerHeight - (p.percentage / 100) * innerHeight;
        return { paper: p, x, y };
      });
    });

    return result;
  }, [filteredPapers, innerWidth, innerHeight]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Exam Countdown Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Award className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Sri Lankan GCE A/L Physical Science</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {settings.studentName}&apos;s Academic Monitor
            </h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              Targeting top university placement in Engineering & Physical Sciences. Monitoring weekly paper
              classes, syllabus mastery, and homework consistency.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
            <Calendar className="w-8 h-8 text-blue-300 shrink-0" />
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-blue-200">
                Examination Target
              </div>
              <div className="text-xl font-black">{daysLeft} Days Remaining</div>
              <div className="text-xs text-blue-200/90">{formatSLDate(settings.examDate)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (If weak topics or overdue homework exist) */}
      {(overdueHomework.length > 0 || weakTopics.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Academic Attention Required</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {overdueHomework.length > 0 && (
                  <span>
                    <strong>{overdueHomework.length} homework task(s)</strong> are currently overdue.{' '}
                  </span>
                )}
                {weakTopics.length > 0 && (
                  <span>
                    Weak paper scores detected in:{' '}
                    <strong>{weakTopics.map((t) => t.name).join(', ')}</strong> (threshold:{' '}
                    {settings.weakTopicThreshold}%).
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {overdueHomework.length > 0 && (
              <button
                onClick={() => setActiveTab('homework')}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shrink-0"
              >
                Resolve Homework
              </button>
            )}
            {weakTopics.length > 0 && (
              <button
                onClick={() => setActiveTab('subjects')}
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors shrink-0"
              >
                View Weak Topics
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall 3-Subject Average */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Overall 3-Subject Mean</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900">
              {overallAveragePercentage !== undefined ? `${overallAveragePercentage}%` : '—'}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Target: 75%
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Arithmetic mean of paper %</span>
            <span className="font-semibold text-slate-700">
              {papers.length} paper{papers.length === 1 ? '' : 's'} recorded
            </span>
          </div>
        </div>

        {/* Combined Mathematics Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="font-semibold text-blue-700">Combined Maths</span>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {subjectStats.combined_maths.latestPercentage !== undefined
                ? `${subjectStats.combined_maths.latestPercentage}%`
                : '—'}
            </div>
            <div className="text-xs text-slate-500">
              Avg:{' '}
              <strong className="text-slate-800">
                {subjectStats.combined_maths.averagePercentage !== undefined
                  ? `${subjectStats.combined_maths.averagePercentage}%`
                  : '—'}
              </strong>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Best: {subjectStats.combined_maths.highestPercentage !== undefined ? `${subjectStats.combined_maths.highestPercentage}%` : '—'}
            </span>
            <div className="flex items-center">
              {subjectStats.combined_maths.trendDelta !== undefined && (
                <span
                  className={`flex items-center font-semibold ${
                    subjectStats.combined_maths.trendDelta > 0
                      ? 'text-emerald-600'
                      : subjectStats.combined_maths.trendDelta < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  {subjectStats.combined_maths.trendDelta > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : subjectStats.combined_maths.trendDelta < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {subjectStats.combined_maths.trendDelta > 0 ? `+${subjectStats.combined_maths.trendDelta}%` : `${subjectStats.combined_maths.trendDelta}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Physics Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="font-semibold text-indigo-700">Physics</span>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {subjectStats.physics.latestPercentage !== undefined
                ? `${subjectStats.physics.latestPercentage}%`
                : '—'}
            </div>
            <div className="text-xs text-slate-500">
              Avg:{' '}
              <strong className="text-slate-800">
                {subjectStats.physics.averagePercentage !== undefined
                  ? `${subjectStats.physics.averagePercentage}%`
                  : '—'}
              </strong>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Best: {subjectStats.physics.highestPercentage !== undefined ? `${subjectStats.physics.highestPercentage}%` : '—'}
            </span>
            <div className="flex items-center">
              {subjectStats.physics.trendDelta !== undefined && (
                <span
                  className={`flex items-center font-semibold ${
                    subjectStats.physics.trendDelta > 0
                      ? 'text-emerald-600'
                      : subjectStats.physics.trendDelta < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  {subjectStats.physics.trendDelta > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : subjectStats.physics.trendDelta < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {subjectStats.physics.trendDelta > 0 ? `+${subjectStats.physics.trendDelta}%` : `${subjectStats.physics.trendDelta}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chemistry Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="font-semibold text-cyan-700">Chemistry</span>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {subjectStats.chemistry.latestPercentage !== undefined
                ? `${subjectStats.chemistry.latestPercentage}%`
                : '—'}
            </div>
            <div className="text-xs text-slate-500">
              Avg:{' '}
              <strong className="text-slate-800">
                {subjectStats.chemistry.averagePercentage !== undefined
                  ? `${subjectStats.chemistry.averagePercentage}%`
                  : '—'}
              </strong>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Best: {subjectStats.chemistry.highestPercentage !== undefined ? `${subjectStats.chemistry.highestPercentage}%` : '—'}
            </span>
            <div className="flex items-center">
              {subjectStats.chemistry.trendDelta !== undefined && (
                <span
                  className={`flex items-center font-semibold ${
                    subjectStats.chemistry.trendDelta > 0
                      ? 'text-emerald-600'
                      : subjectStats.chemistry.trendDelta < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  {subjectStats.chemistry.trendDelta > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : subjectStats.chemistry.trendDelta < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {subjectStats.chemistry.trendDelta > 0 ? `+${subjectStats.chemistry.trendDelta}%` : `${subjectStats.chemistry.trendDelta}%`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Marks Over Time Line Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Paper Marks Over Time</h2>
              <p className="text-xs text-slate-500">
                Weekly paper class test scores (Paper percentage = obtained / max × 100)
              </p>
            </div>

            {/* Time filter buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              {(['4w', '12w', '6m', 'all'] as TimeFilter[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    timeFilter === tf
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf === '4w' ? '4 Weeks' : tf === '12w' ? '12 Weeks' : tf === '6m' ? '6 Months' : 'All Data'}
                </button>
              ))}
            </div>
          </div>

          {/* Subject toggles */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Subjects:
            </span>
            {DEFAULT_SUBJECTS.map((sub) => (
              <label
                key={sub.id}
                className="flex items-center space-x-1.5 text-xs font-medium cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedSubjects[sub.id]}
                  onChange={(e) =>
                    setSelectedSubjects((prev) => ({ ...prev, [sub.id]: e.target.checked }))
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span style={{ color: sub.color }} className="font-semibold">
                  {sub.name}
                </span>
              </label>
            ))}
          </div>

          {/* SVG Line Chart */}
          <div className="mt-4 relative overflow-hidden">
            {filteredPapers.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center">
                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">No Paper Marks Recorded Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Add paper marks in the &ldquo;Paper Marks&rdquo; tab or upload marked PDFs to build your
                  real progress trend.
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('papers')}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add First Paper
                  </button>
                  <button
                    onClick={loadDemoRecords}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Load Sample Data
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-64 select-none"
                >
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const y = padding.top + innerHeight - (val / 100) * innerHeight;
                    return (
                      <g key={val}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#E2E8F0"
                          strokeDasharray={val === 50 || val === 75 ? '3 3' : 'none'}
                          strokeWidth="1"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#94A3B8"
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw Lines & Points for Selected Subjects */}
                  {DEFAULT_SUBJECTS.map((sub) => {
                    if (!selectedSubjects[sub.id]) return null;
                    const points = chartDataBySubject[sub.id];
                    if (points.length === 0) return null;

                    const pathString = points
                      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                      .join(' ');

                    return (
                      <g key={sub.id}>
                        {/* Line */}
                        <path
                          d={pathString}
                          fill="none"
                          stroke={sub.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Points */}
                        {points.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4.5"
                            fill="#FFFFFF"
                            stroke={sub.color}
                            strokeWidth="2.5"
                            className="cursor-pointer hover:r-6 transition-all"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredPoint({
                                paper: p.paper,
                                x: p.x,
                                y: p.y,
                                color: sub.color,
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        ))}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-slate-900 text-white p-2.5 rounded-xl shadow-xl pointer-events-none z-20 text-xs border border-slate-700 max-w-xs animate-in fade-in duration-100"
                    style={{
                      left: Math.min(hoveredPoint.x, chartWidth - 180),
                      top: Math.max(hoveredPoint.y - 85, 10),
                    }}
                  >
                    <div className="font-bold flex items-center space-x-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: hoveredPoint.color }}
                      />
                      <span>{hoveredPoint.paper.paperName}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] mt-0.5">
                      Date: {formatSLDate(hoveredPoint.paper.paperDate)}
                    </div>
                    <div className="mt-1 font-semibold text-amber-300">
                      Score: {hoveredPoint.paper.marksObtained} / {hoveredPoint.paper.maximumMarks} (
                      {hoveredPoint.paper.percentage}%)
                    </div>
                    {hoveredPoint.paper.notes && (
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        &quot;{hoveredPoint.paper.notes}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Subject Comparison & Weekly Activity (1 col) */}
        <div className="space-y-6">
          {/* Subject Average Comparison */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Subject Performance Summary</h3>
            <p className="text-xs text-slate-500 mt-0.5">Average paper marks vs 75% target</p>

            <div className="mt-4 space-y-3.5">
              {DEFAULT_SUBJECTS.map((sub) => {
                const avg = subjectStats[sub.id].averagePercentage || 0;
                return (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sub.name}</span>
                      <span className="font-bold text-slate-900">{avg > 0 ? `${avg}%` : 'No data'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, avg)}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Homework Completion Overview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Homework & Tutorials</h3>
                <p className="text-xs text-slate-500">Overall completion track</p>
              </div>
              <button
                onClick={() => setActiveTab('homework')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span>Tracker</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xl font-bold text-slate-900">{totalHomework}</div>
                <div className="text-[10px] font-medium text-slate-500 uppercase">Assigned</div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-xl font-bold text-emerald-700">{completedHomework}</div>
                <div className="text-[10px] font-medium text-emerald-600 uppercase">Completed</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${overdueHomework.length > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`text-xl font-bold ${overdueHomework.length > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  {overdueHomework.length}
                </div>
                <div className={`text-[10px] font-medium ${overdueHomework.length > 0 ? 'text-rose-600' : 'text-slate-500'} uppercase`}>
                  Overdue
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Completion Rate</span>
                <span className="font-bold text-slate-900">{homeworkRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${homeworkRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Deadlines & Weekly Study Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Classes & Homework Deadlines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Clock className="w-4 h-4 text-blue-600 mr-2" />
              <span>Upcoming Homework Deadlines & Classes</span>
            </h3>
            <button
              onClick={() => setActiveTab('homework')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {pendingHomework.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                No pending homework deadlines! All clear.
              </div>
            ) : (
              pendingHomework.slice(0, 4).map((hw) => {
                const deadlineInfo = getRelativeDeadline(hw.deadline);
                return (
                  <div
                    key={hw.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{hw.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {hw.teacherOrClass} • {hw.questionsCompleted}/{hw.questionsAssigned} Qs
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        deadlineInfo.isOverdue
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {deadlineInfo.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Study Goal & Hours Track */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Calendar className="w-4 h-4 text-indigo-600 mr-2" />
              <span>Weekly Study Consistency</span>
            </h3>
            <button
              onClick={() => setActiveTab('planner')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Open Planner
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span className="font-medium">Study Hours Logged</span>
                <span className="font-bold text-slate-900">
                  {actualStudyHours} hrs / {currentGoal?.targetStudyHours || 25} hrs Target
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((actualStudyHours || 0) / (currentGoal?.targetStudyHours || 25)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950">
              <div className="font-bold text-indigo-900 mb-0.5">Weekly Review Note</div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                {currentGoal?.achievements ||
                  'Consistent daily practice in Pure Maths integration and Physics mechanics is the key to achieving an &ldquo;A&rdquo; grade.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
