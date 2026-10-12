import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Trash2,
  Edit2,
  RotateCcw,
  UploadCloud,
  CheckCircle,
  Clock,
  ArrowUpDown,
  FileCheck,
  AlertCircle,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Calendar,
  Sparkles,
  FileText,
  BarChart3,
  CheckCircle2,
  Calculator,
  Zap,
  FlaskConical,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { PaperRecord, SubjectId, PaperType } from '../../types/index.ts';
import { DEFAULT_SUBJECTS, formatSLDate } from '../../lib/storage.ts';
import { PaperModal } from './PaperModal.tsx';

type TimeFilter = '4w' | '12w' | '6m' | 'all';
type AttemptFilter = 'all' | 'first_only';

interface ProgressGraphProps {
  subjectId: SubjectId;
  subjectName: string;
  subjectSinhala: string;
  subjectColor: string;
  targetPercentage: number;
  papers: PaperRecord[];
  onRecordPaper: () => void;
}

const SubjectProgressGraph: React.FC<ProgressGraphProps> = ({
  subjectId,
  subjectName,
  subjectSinhala,
  subjectColor,
  targetPercentage,
  papers,
  onRecordPaper,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [attemptFilter, setAttemptFilter] = useState<AttemptFilter>('all');
  const [paperTypeFilter, setPaperTypeFilter] = useState<PaperType | 'all'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    paper: PaperRecord;
    x: number;
    y: number;
    index: number;
    delta?: number;
  } | null>(null);

  // Filter papers for this subject chronologically
  const filteredPapers = useMemo(() => {
    const now = new Date().getTime();
    let cutoff = 0;
    if (timeFilter === '4w') cutoff = now - 4 * 7 * 24 * 60 * 60 * 1000;
    else if (timeFilter === '12w') cutoff = now - 12 * 7 * 24 * 60 * 60 * 1000;
    else if (timeFilter === '6m') cutoff = now - 180 * 24 * 60 * 60 * 1000;

    return papers
      .filter((p) => {
        if (p.subjectId !== subjectId) return false;
        if (paperTypeFilter !== 'all' && p.paperType !== paperTypeFilter) return false;
        if (attemptFilter === 'first_only' && p.attemptNumber > 1) return false;
        if (cutoff > 0 && new Date(p.paperDate).getTime() < cutoff) return false;
        return true;
      })
      .sort((a, b) => new Date(a.paperDate).getTime() - new Date(b.paperDate).getTime());
  }, [papers, subjectId, timeFilter, attemptFilter, paperTypeFilter]);

  // Compute stats for current graph dataset
  const graphStats = useMemo(() => {
    if (filteredPapers.length === 0) {
      return {
        avg: undefined,
        latest: undefined,
        highest: undefined,
        lowest: undefined,
        delta: undefined,
      };
    }
    const sum = filteredPapers.reduce((acc, p) => acc + p.percentage, 0);
    const avg = Number((sum / filteredPapers.length).toFixed(1));
    const latest = filteredPapers[filteredPapers.length - 1].percentage;
    const previous = filteredPapers.length > 1 ? filteredPapers[filteredPapers.length - 2].percentage : undefined;
    const delta = previous !== undefined ? Number((latest - previous).toFixed(1)) : undefined;

    const pcts = filteredPapers.map((p) => p.percentage);
    const highest = Math.max(...pcts);
    const lowest = Math.min(...pcts);

    return { avg, latest, highest, lowest, delta };
  }, [filteredPapers]);

  // SVG Chart Geometry
  const width = 760;
  const height = 230;
  const padding = { top: 30, right: 35, bottom: 40, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Generate plot points
  const points = useMemo(() => {
    if (filteredPapers.length === 0) return [];
    if (filteredPapers.length === 1) {
      const y = padding.top + innerHeight - (filteredPapers[0].percentage / 100) * innerHeight;
      return [{ x: padding.left + innerWidth / 2, y, paper: filteredPapers[0], delta: undefined }];
    }

    return filteredPapers.map((paper, idx) => {
      const x = padding.left + (idx / (filteredPapers.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - (Math.min(100, Math.max(0, paper.percentage)) / 100) * innerHeight;
      const prevPaper = idx > 0 ? filteredPapers[idx - 1] : undefined;
      const delta = prevPaper ? Number((paper.percentage - prevPaper.percentage).toFixed(1)) : undefined;
      return { x, y, paper, delta };
    });
  }, [filteredPapers, innerWidth, innerHeight, padding.left, padding.top]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = padding.top + innerHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [points, linePath, padding.top, innerHeight]);

  const targetY = padding.top + innerHeight - (targetPercentage / 100) * innerHeight;
  const avgY = graphStats.avg !== undefined ? padding.top + innerHeight - (graphStats.avg / 100) * innerHeight : undefined;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subjectColor }} />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {subjectName} Progress Trend
            </h3>
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              ({subjectSinhala})
            </span>
            {graphStats.delta !== undefined && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  graphStats.delta > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : graphStats.delta < 0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {graphStats.delta > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : graphStats.delta < 0 ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : (
                  <Minus className="w-3 h-3 mr-1" />
                )}
                {graphStats.delta > 0 ? `+${graphStats.delta}%` : `${graphStats.delta}%`} vs prev
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real paper-by-paper score progression (Target: {targetPercentage}%)
          </p>
        </div>

        {/* Time filters & attempt toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Attempt filter */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium text-slate-600">
            <button
              onClick={() => setAttemptFilter('all')}
              className={`px-2 py-1 rounded-md transition-all ${
                attemptFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              All Attempts
            </button>
            <button
              onClick={() => setAttemptFilter('first_only')}
              className={`px-2 py-1 rounded-md transition-all ${
                attemptFilter === 'first_only' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              1st Attempts Only
            </button>
          </div>

          {/* Time range buttons */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium text-slate-600">
            {(['4w', '12w', '6m', 'all'] as TimeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-2 py-1 rounded-md transition-all ${
                  timeFilter === tf ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                {tf === '4w' ? '4W' : tf === '12w' ? '12W' : tf === '6m' ? '6M' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas & Tooltip */}
      <div className="relative">
        {filteredPapers.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center px-4">
            <FileText className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">
              No {subjectName} Papers Recorded Yet
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Record your weekly class tests or past papers to generate a live progress line chart and track performance trends.
            </p>
            <button
              onClick={onRecordPaper}
              className="mt-3.5 inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Record First {subjectName} Paper</span>
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-56 select-none"
              style={{ minWidth: '550px' }}
            >
              <defs>
                <linearGradient id={`grad_${subjectId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={subjectColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={subjectColor} stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Y-axis Horizontal Grid Lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = padding.top + innerHeight - (val / 100) * innerHeight;
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94A3B8"
                      fontFamily="sans-serif"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Target Cutoff Line (75%) */}
              <line
                x1={padding.left}
                y1={targetY}
                x2={width - padding.right}
                y2={targetY}
                stroke="#10B981"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />
              <text
                x={width - padding.right}
                y={targetY - 5}
                textAnchor="end"
                fontSize="9"
                fontWeight="600"
                fill="#059669"
              >
                Target: {targetPercentage}%
              </text>

              {/* Current Subject Average Line */}
              {avgY !== undefined && (
                <>
                  <line
                    x1={padding.left}
                    y1={avgY}
                    x2={width - padding.right}
                    y2={avgY}
                    stroke="#64748B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    strokeOpacity="0.7"
                  />
                  <text
                    x={padding.left + 5}
                    y={avgY - 4}
                    fontSize="9"
                    fontWeight="600"
                    fill="#64748B"
                  >
                    Avg: {graphStats.avg}%
                  </text>
                </>
              )}

              {/* Filled Gradient Area */}
              {areaPath && <path d={areaPath} fill={`url(#grad_${subjectId})`} />}

              {/* Trend Stroke Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={subjectColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Point Nodes */}
              {points.map((p, idx) => {
                const isHovered = hoveredPoint?.index === idx;
                const isRepeat = p.paper.attemptNumber > 1;

                return (
                  <g key={p.paper.id}>
                    {/* Repeat Attempt outer ring indicator */}
                    {isRepeat && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 8 : 6.5}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Main point circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4.5}
                      fill="#FFFFFF"
                      stroke={subjectColor}
                      strokeWidth={isHovered ? 3 : 2.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => {
                        setHoveredPoint({
                          paper: p.paper,
                          x: p.x,
                          y: p.y,
                          index: idx,
                          delta: p.delta,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* X-axis date labels (spread out) */}
                    {(points.length <= 8 || idx % Math.ceil(points.length / 8) === 0 || idx === points.length - 1) && (
                      <text
                        x={p.x}
                        y={height - padding.bottom + 16}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748B"
                        fontFamily="sans-serif"
                      >
                        {formatSLDate(p.paper.paperDate).slice(0, 5)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Floating Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-xl shadow-xl px-3 py-2 text-xs border border-slate-700 animate-in fade-in duration-100"
            style={{
              left: `${Math.min(width - 200, Math.max(10, (hoveredPoint.x / width) * 100))}%`,
              top: `${Math.max(10, hoveredPoint.y - 85)}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold flex items-center justify-between space-x-2 text-slate-100">
              <span className="truncate max-w-[150px]">{hoveredPoint.paper.paperName}</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                {hoveredPoint.paper.percentage}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between space-x-3 mt-0.5">
              <span>{formatSLDate(hoveredPoint.paper.paperDate)}</span>
              <span>
                {hoveredPoint.paper.marksObtained} / {hoveredPoint.paper.maximumMarks} marks
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate-800 text-slate-300">
              <span>
                {hoveredPoint.paper.attemptNumber > 1
                  ? `Repeat Attempt #${hoveredPoint.paper.attemptNumber}`
                  : 'First Attempt'}
              </span>
              {hoveredPoint.delta !== undefined && (
                <span
                  className={
                    hoveredPoint.delta > 0
                      ? 'text-emerald-400 font-semibold'
                      : hoveredPoint.delta < 0
                      ? 'text-rose-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {hoveredPoint.delta > 0 ? `+${hoveredPoint.delta}%` : `${hoveredPoint.delta}%`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Stats Quickbar */}
      {filteredPapers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Average</span>
            <span className="text-base font-extrabold text-slate-900">{graphStats.avg}%</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Latest</span>
            <span className="text-base font-extrabold text-slate-900">{graphStats.latest}%</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Best Score</span>
            <span className="text-base font-extrabold text-emerald-700">{graphStats.highest}%</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Lowest</span>
            <span className="text-base font-extrabold text-slate-700">{graphStats.lowest}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PaperMarksPage: React.FC = () => {
  const { papers, deletePaper, subjectStats, setActiveTab, activeRole } = useApp();

  // Active Subject Tab: Combined Maths, Physics, Chemistry, or All
  const [activeSubjectTab, setActiveSubjectTab] = useState<SubjectId | 'all'>('combined_maths');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PaperType | 'all'>('all');
  const [minPercentage, setMinPercentage] = useState<number>(0);
  const [sortField, setSortField] = useState<'paperDate' | 'percentage' | 'marksObtained'>('paperDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paperToEdit, setPaperToEdit] = useState<PaperRecord | null>(null);
  const [repeatFromPaper, setRepeatFromPaper] = useState<PaperRecord | null>(null);
  const [paperToDelete, setPaperToDelete] = useState<PaperRecord | null>(null);
  const [comparePaper, setComparePaper] = useState<PaperRecord | null>(null);

  // Active subject info
  const activeSubjectInfo = useMemo(() => {
    if (activeSubjectTab === 'all') return null;
    return DEFAULT_SUBJECTS.find((s) => s.id === activeSubjectTab) || null;
  }, [activeSubjectTab]);

  // Filter & sort papers for table
  const filteredPapers = useMemo(() => {
    return papers
      .filter((p) => {
        if (activeSubjectTab !== 'all' && p.subjectId !== activeSubjectTab) return false;
        if (typeFilter !== 'all' && p.paperType !== typeFilter) return false;
        if (p.percentage < minPercentage) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.paperName.toLowerCase().includes(q);
          const matchNum = p.paperNumber?.toLowerCase().includes(q) || false;
          const matchNotes = p.notes?.toLowerCase().includes(q) || false;
          if (!matchName && !matchNum && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (sortField === 'paperDate') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [papers, activeSubjectTab, typeFilter, minPercentage, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: 'paperDate' | 'percentage' | 'marksObtained') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Find repeat attempts for compare modal
  const relatedAttempts = useMemo(() => {
    if (!comparePaper) return [];
    const rootId = comparePaper.parentPaperId || comparePaper.id;
    return papers
      .filter((p) => p.id === rootId || p.parentPaperId === rootId)
      .sort((a, b) => a.attemptNumber - b.attemptNumber);
  }, [comparePaper, papers]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <FileSpreadsheet className="w-6 h-6 mr-2 text-blue-600" />
            <span>Examination Paper Marks</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor progress with subject-specific trend graphs, paper class tests, and attempt comparisons.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('submissions')}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" />
            <span>Upload Paper PDF</span>
          </button>

          <button
            onClick={() => {
              setPaperToEdit(null);
              setRepeatFromPaper(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs shadow-blue-200"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>
              {activeSubjectInfo ? `Record ${activeSubjectInfo.name} Paper` : 'Record New Paper'}
            </span>
          </button>
        </div>
      </div>

      {/* THREE INDIVIDUAL SUBJECT ANALYSIS TABS + ALL SUBJECTS OVERVIEW */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-px" aria-label="Subject Analysis Tabs">
          {DEFAULT_SUBJECTS.map((sub) => {
            const isSelected = activeSubjectTab === sub.id;
            const stats = subjectStats[sub.id];
            const SubjectIcon =
              sub.id === 'combined_maths'
                ? Calculator
                : sub.id === 'physics'
                ? Zap
                : FlaskConical;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubjectTab(sub.id)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold rounded-t-xl border-t-2 border-l border-r transition-all whitespace-nowrap cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white border-l-slate-200 border-r-slate-200 text-slate-900 shadow-2xs -mb-px'
                    : 'bg-slate-100/70 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                style={{
                  borderTopColor: isSelected ? sub.color : 'transparent',
                }}
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${sub.color}18`,
                    color: sub.color,
                  }}
                >
                  <SubjectIcon className="w-3.5 h-3.5" />
                </span>
                <span className="font-extrabold">{sub.name}</span>
                <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                  ({sub.sinhalaName})
                </span>
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {stats.totalPapers}
                </span>
                {stats.averagePercentage !== undefined && (
                  <span className="text-[11px] font-bold" style={{ color: sub.color }}>
                    {stats.averagePercentage}%
                  </span>
                )}
              </button>
            );
          })}

          {/* All Papers Overview Tab */}
          <button
            onClick={() => setActiveSubjectTab('all')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold rounded-t-xl border-t-2 border-l border-r transition-all whitespace-nowrap cursor-pointer select-none ${
              activeSubjectTab === 'all'
                ? 'bg-white border-t-slate-800 border-l-slate-200 border-r-slate-200 text-slate-900 shadow-2xs -mb-px'
                : 'bg-slate-100/70 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-slate-200/70 text-slate-700">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span>All Subjects (Overview)</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeSubjectTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {papers.length}
            </span>
          </button>
        </nav>
      </div>

      {/* INDIVIDUAL SUBJECT ANALYSIS TAB CONTENT */}
      {activeSubjectInfo && (
        <div className="space-y-6">
          {/* Individual Subject Analysis Banner Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{
                  backgroundColor: `${activeSubjectInfo.color}15`,
                  color: activeSubjectInfo.color,
                }}
              >
                {activeSubjectInfo.id === 'combined_maths' ? (
                  <Calculator className="w-5 h-5" />
                ) : activeSubjectInfo.id === 'physics' ? (
                  <Zap className="w-5 h-5" />
                ) : (
                  <FlaskConical className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {activeSubjectInfo.name} Individual Analysis
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">
                    ({activeSubjectInfo.sinhalaName})
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: <strong className="text-emerald-700 font-bold">{activeSubjectInfo.targetPercentage}%</strong> cutoff for A Grade • Monitor progress trend, average scores, and repeat attempts.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  setPaperToEdit(null);
                  setRepeatFromPaper(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                style={{ backgroundColor: activeSubjectInfo.color }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Record {activeSubjectInfo.name} Paper</span>
              </button>
            </div>
          </div>

          {/* Progress Monitoring Graph for this Subject */}
          <SubjectProgressGraph
            subjectId={activeSubjectInfo.id}
            subjectName={activeSubjectInfo.name}
            subjectSinhala={activeSubjectInfo.sinhalaName}
            subjectColor={activeSubjectInfo.color}
            targetPercentage={activeSubjectInfo.targetPercentage}
            papers={papers}
            onRecordPaper={() => {
              setPaperToEdit(null);
              setRepeatFromPaper(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      )}

      {/* ALL SUBJECTS OVERVIEW TAB */}
      {activeSubjectTab === 'all' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEFAULT_SUBJECTS.map((sub) => {
              const stats = subjectStats[sub.id];
              return (
                <div
                  key={sub.id}
                  onClick={() => setActiveSubjectTab(sub.id)}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: sub.color }}>
                      {sub.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {stats.totalPapers} Paper{stats.totalPapers === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-2xl font-black text-slate-900">
                      {stats.averagePercentage !== undefined ? `${stats.averagePercentage}%` : '—'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Latest: {stats.latestPercentage !== undefined ? `${stats.latestPercentage}%` : '—'}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                    <span>Best: {stats.highestPercentage !== undefined ? `${stats.highestPercentage}%` : '—'}</span>
                    <span className="text-blue-600 font-semibold hover:underline">Analyse Tab →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filters Card for Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search query */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSubjectInfo
                  ? `Search ${activeSubjectInfo.name} papers...`
                  : 'Search all papers by name, number, or notes...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Paper Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs rounded-xl border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Paper Types</option>
              <option value="full_paper">Full Examination Paper</option>
              <option value="structured_essay">Structured Essay / Theory</option>
              <option value="mcq">MCQ Paper</option>
              <option value="topical_paper">Topical Paper</option>
              <option value="class_test">Weekly Class Test</option>
            </select>
          </div>
        </div>

        {/* Min Percentage Slider */}
        <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1 border-t border-slate-100">
          <span className="font-medium shrink-0">Min Percentage: {minPercentage}%</span>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={minPercentage}
            onChange={(e) => setMinPercentage(parseInt(e.target.value, 10))}
            className="w-40 sm:w-48 accent-blue-600 cursor-pointer"
          />
          {minPercentage > 0 && (
            <button
              onClick={() => setMinPercentage(0)}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Reset filter
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            Showing {filteredPapers.length} of {papers.length} records
          </span>
        </div>
      </div>

      {/* Papers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPapers.length === 0 ? (
          <div className="py-16 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Paper Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {papers.length === 0
                ? 'Begin tracking by clicking "Record New Paper" or loading sample data from settings.'
                : activeSubjectInfo
                ? `No papers recorded for ${activeSubjectInfo.name} matching your filter.`
                : 'No papers match your current search and filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => toggleSort('paperDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date (DD/MM)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Paper Name &amp; Type</th>
                  <th className="p-3.5">Attempt</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => toggleSort('marksObtained')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Marks (Raw / Max)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => toggleSort('percentage')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Percentage</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPapers.map((paper) => {
                  const subInfo = DEFAULT_SUBJECTS.find((s) => s.id === paper.subjectId);
                  return (
                    <tr
                      key={paper.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Date */}
                      <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">
                        {formatSLDate(paper.paperDate)}
                      </td>

                      {/* Subject */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className="font-bold px-2 py-0.5 rounded text-[11px]"
                          style={{
                            color: subInfo?.color,
                            backgroundColor: `${subInfo?.color}15`,
                          }}
                        >
                          {subInfo?.name}
                        </span>
                      </td>

                      {/* Paper Name & Type */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-slate-900">{paper.paperName}</div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {paper.paperType.replace('_', ' ')}
                          {paper.durationMinutes && ` • ${paper.durationMinutes}m`}
                          {paper.paperNumber && ` • #${paper.paperNumber}`}
                        </div>
                      </td>

                      {/* Attempt */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            paper.attemptNumber > 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Attempt {paper.attemptNumber}
                        </span>
                      </td>

                      {/* Raw / Max Marks */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {paper.marksObtained}
                        </span>
                        <span className="text-slate-400 font-medium"> / {paper.maximumMarks}</span>
                      </td>

                      {/* Percentage Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                            paper.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : paper.percentage >= 50
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {paper.percentage}%
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {paper.isVerifiedByReviewer ? (
                          <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600 font-medium text-[11px]">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            Provisional
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Repeat Attempt button */}
                          <button
                            onClick={() => {
                              setRepeatFromPaper(paper);
                              setPaperToEdit(null);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Sit this paper again (Record Attempt 2+)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Compare attempts if multiple attempts exist */}
                          {(paper.attemptNumber > 1 || paper.parentPaperId) && (
                            <button
                              onClick={() => setComparePaper(paper)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Compare attempts"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setPaperToEdit(paper);
                              setRepeatFromPaper(null);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Edit paper record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button (with confirmation) */}
                          <button
                            onClick={() => setPaperToDelete(paper)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete paper record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paper Add/Edit Modal */}
      <PaperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paperToEdit={paperToEdit}
        repeatFromPaper={repeatFromPaper}
        defaultSubjectId={activeSubjectInfo?.id}
      />

      {/* Delete Confirmation Modal */}
      {paperToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete the paper record &ldquo;
              <strong>{paperToDelete.paperName}</strong>&rdquo; (Attempt {paperToDelete.attemptNumber})?
              This will update your subject averages and cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-center space-x-3">
              <button
                onClick={() => setPaperToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePaper(paperToDelete.id);
                  setPaperToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs shadow-rose-200"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Attempts Modal */}
      {comparePaper && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Attempt Comparison: {comparePaper.paperName}
              </h3>
              <button
                onClick={() => setComparePaper(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {relatedAttempts.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Attempt #{att.attemptNumber}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Date: {formatSLDate(att.paperDate)} • Raw: {att.marksObtained}/{att.maximumMarks}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-blue-600">{att.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
