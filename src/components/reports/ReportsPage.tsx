import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Award,
  ArrowRight,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { DEFAULT_SUBJECTS, formatSLDate } from '../../lib/storage.ts';
import { SubjectId } from '../../types/index.ts';

export const ReportsPage: React.FC = () => {
  const { papers, homework, sessions, topics, settings, subjectStats, overallAveragePercentage } = useApp();

  const [dateRangeAStart, setDateRangeAStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateRangeAEnd, setDateRangeAEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const [dateRangeBStart, setDateRangeBStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().split('T')[0];
  });
  const [dateRangeBEnd, setDateRangeBEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 31);
    return d.toISOString().split('T')[0];
  });

  const currentDateReport = new Date().toISOString().split('T')[0];

  // Compute Period A papers vs Period B papers
  const periodAPapers = useMemo(() => {
    return papers.filter((p) => p.paperDate >= dateRangeAStart && p.paperDate <= dateRangeAEnd);
  }, [papers, dateRangeAStart, dateRangeAEnd]);

  const periodBPapers = useMemo(() => {
    return papers.filter((p) => p.paperDate >= dateRangeBStart && p.paperDate <= dateRangeBEnd);
  }, [papers, dateRangeBStart, dateRangeBEnd]);

  const periodAAvg = useMemo(() => {
    if (periodAPapers.length === 0) return null;
    return (periodAPapers.reduce((acc, p) => acc + p.percentage, 0) / periodAPapers.length).toFixed(1);
  }, [periodAPapers]);

  const periodBAvg = useMemo(() => {
    if (periodBPapers.length === 0) return null;
    return (periodBPapers.reduce((acc, p) => acc + p.percentage, 0) / periodBPapers.length).toFixed(1);
  }, [periodBPapers]);

  // Strong & Weak topics
  const topicStats = useMemo(() => {
    const list: { name: string; subject: string; avg: number; count: number }[] = [];
    topics.forEach((t) => {
      const pList = papers.filter((p) => p.topicIds?.includes(t.id));
      if (pList.length > 0) {
        const avg = pList.reduce((acc, p) => acc + p.percentage, 0) / pList.length;
        const sub = DEFAULT_SUBJECTS.find((s) => s.id === t.subjectId)?.name || '';
        list.push({ name: t.name, subject: sub, avg: Number(avg.toFixed(1)), count: pList.length });
      }
    });
    const sorted = [...list].sort((a, b) => b.avg - a.avg);
    return {
      strongest: sorted.slice(0, 3),
      weakest: sorted.slice(-3).reverse(),
    };
  }, [topics, papers]);

  // CSV Export functions
  const exportPapersCsv = () => {
    const headers = ['Date', 'Subject', 'Paper Name', 'Type', 'Attempt', 'Marks Obtained', 'Max Marks', 'Percentage', 'Verified'];
    const rows = papers.map((p) => [
      p.paperDate,
      p.subjectId,
      `"${p.paperName.replace(/"/g, '""')}"`,
      p.paperType,
      p.attemptNumber,
      p.marksObtained,
      p.maximumMarks,
      p.percentage,
      p.isVerifiedByReviewer ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AL_Paper_Marks_${currentDateReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHomeworkCsv = () => {
    const headers = ['Deadline', 'Subject', 'Title', 'Teacher', 'Type', 'Assigned Qs', 'Completed Qs', 'Status'];
    const rows = homework.map((h) => [
      h.deadline,
      h.subjectId,
      `"${h.title.replace(/"/g, '""')}"`,
      `"${h.teacherOrClass.replace(/"/g, '""')}"`,
      h.homeworkType,
      h.questionsAssigned,
      h.questionsCompleted,
      h.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AL_Homework_Records_${currentDateReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudySessionsCsv = () => {
    const headers = ['Date', 'Subject', 'Start Time', 'Planned Mins', 'Actual Mins', 'Objective', 'Status'];
    const rows = sessions.map((s) => [
      s.date,
      s.subjectId,
      s.startTime,
      s.plannedMinutes,
      s.actualMinutes || 0,
      `"${s.objective.replace(/"/g, '""')}"`,
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AL_Study_Sessions_${currentDateReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            <span>Academic Performance Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export official CSV datasets, compare custom date intervals, or generate print-friendly reports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </button>

          <div className="relative group">
            <button className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs shadow-blue-200">
              <Download className="w-4 h-4 mr-1.5" />
              <span>Export CSV</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-30 hidden group-hover:block animate-in fade-in">
              <button
                onClick={exportPapersCsv}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Paper Marks CSV
              </button>
              <button
                onClick={exportHomeworkCsv}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Homework Records CSV
              </button>
              <button
                onClick={exportStudySessionsCsv}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Study Sessions CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Meta Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Official Sri Lankan GCE A/L Academic Progress Audit
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{settings.studentName}</h2>
            <div className="text-xs text-slate-500">
              Stream: Physical Science &bull; Target Examination: GCE A/L {settings.examYear}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Report Generated: <strong>{formatSLDate(currentDateReport)}</strong></div>
            <div>Timezone: <strong>Asia/Colombo (Sri Lanka)</strong></div>
          </div>
        </div>

        {/* Subject-Wise Paper Performance Matrix */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">
            1. Subject-Wise Performance Summary Matrix
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Papers Sat</th>
                  <th className="p-3">Average %</th>
                  <th className="p-3">Best Result</th>
                  <th className="p-3">Lowest Result</th>
                  <th className="p-3">Latest Result</th>
                  <th className="p-3">Target %</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEFAULT_SUBJECTS.map((sub) => {
                  const s = subjectStats[sub.id];
                  const target = sub.targetPercentage;
                  const avg = s.averagePercentage;
                  const isMeeting = avg !== undefined && avg >= target;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold" style={{ color: sub.color }}>
                        {sub.name}
                      </td>
                      <td className="p-3">{s.totalPapers}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {avg !== undefined ? `${avg}%` : '—'}
                      </td>
                      <td className="p-3">{s.highestPercentage !== undefined ? `${s.highestPercentage}%` : '—'}</td>
                      <td className="p-3">{s.lowestPercentage !== undefined ? `${s.lowestPercentage}%` : '—'}</td>
                      <td className="p-3">{s.latestPercentage !== undefined ? `${s.latestPercentage}%` : '—'}</td>
                      <td className="p-3">{target}%</td>
                      <td className="p-3">
                        {avg === undefined ? (
                          <span className="text-slate-400">No Data</span>
                        ) : isMeeting ? (
                          <span className="text-emerald-700 font-bold">On Track</span>
                        ) : (
                          <span className="text-amber-700 font-bold">Needs Push</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strongest & Weakest Recorded Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Strongest Recorded Topics (Top Accuracy)</span>
            </div>
            {topicStats.strongest.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No topic paper data available.</div>
            ) : (
              <div className="space-y-1.5">
                {topicStats.strongest.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-emerald-100"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <span className="text-[10px] text-slate-500 block">{t.subject} ({t.count} papers)</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700">{t.avg}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200">
            <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Topics Needing Revision (Priority Attention)</span>
            </div>
            {topicStats.weakest.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No topic paper data available.</div>
            ) : (
              <div className="space-y-1.5">
                {topicStats.weakest.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-rose-100"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <span className="text-[10px] text-slate-500 block">{t.subject} ({t.count} papers)</span>
                    </div>
                    <span className="text-xs font-black text-rose-700">{t.avg}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Comparison Tool */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 print:hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              2. Comparative Period Analysis (Period A vs Period B)
            </h3>
            <p className="text-xs text-slate-500">
              Select two date intervals to measure progress and score trajectory over time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Period A */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-blue-700">Period A (Recent)</div>
              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="date"
                  value={dateRangeAStart}
                  onChange={(e) => setDateRangeAStart(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRangeAEnd}
                  onChange={(e) => setDateRangeAEnd(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="pt-2 flex items-baseline justify-between">
                <span className="text-xs text-slate-500">
                  {periodAPapers.length} Papers Sat
                </span>
                <span className="text-xl font-black text-blue-700">
                  {periodAAvg !== null ? `${periodAAvg}%` : '—'}
                </span>
              </div>
            </div>

            {/* Period B */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700">Period B (Prior)</div>
              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="date"
                  value={dateRangeBStart}
                  onChange={(e) => setDateRangeBStart(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRangeBEnd}
                  onChange={(e) => setDateRangeBEnd(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="pt-2 flex items-baseline justify-between">
                <span className="text-xs text-slate-500">
                  {periodBPapers.length} Papers Sat
                </span>
                <span className="text-xl font-black text-slate-800">
                  {periodBAvg !== null ? `${periodBAvg}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Delta Indicator */}
          {periodAAvg !== null && periodBAvg !== null && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
              <span className="font-semibold">Performance Change (Period A vs Period B):</span>
              <span className="text-sm font-black">
                {Number(periodAAvg) >= Number(periodBAvg) ? '+' : ''}
                {(Number(periodAAvg) - Number(periodBAvg)).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Academic Signature Block for Print */}
        <div className="pt-8 border-t border-slate-200 hidden print:flex items-center justify-between text-xs text-slate-600">
          <div>
            <div>Reviewer / Older Sibling Signature: _______________________</div>
            <div className="text-[10px] text-slate-400 mt-1">Nuwan Perera (Academic Mentor)</div>
          </div>
          <div>
            <div>Candidate Signature: _______________________</div>
            <div className="text-[10px] text-slate-400 mt-1">{settings.studentName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
