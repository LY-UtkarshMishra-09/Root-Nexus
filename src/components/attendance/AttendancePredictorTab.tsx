'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { EnrolledSubject } from '@/types';
import { calculateAttendanceMetrics } from '@/lib/attendanceUtils';
import {
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Filter,
  Info,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

interface AttendancePredictorTabProps {
  subjects: EnrolledSubject[];
  onUpdateSubject: (subjectId: string, deltaAttended: number, deltaTotal: number) => void;
  onResetSubject: (subjectId: string) => void;
  targetAttendance: number;
  setTargetAttendance: (target: number) => void;
}

export const AttendancePredictorTab: React.FC<AttendancePredictorTabProps> = ({
  subjects,
  onUpdateSubject,
  onResetSubject,
  targetAttendance,
  setTargetAttendance,
}) => {
  const { accentStyles, theme } = useTheme();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [simulationOffsets, setSimulationOffsets] = useState<Record<string, number>>({});

  // Calculations across all subjects
  const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
  const totalHeld = subjects.reduce((acc, s) => acc + s.total, 0);
  const overallMetrics = calculateAttendanceMetrics(totalAttended, totalHeld, targetAttendance);

  const filteredSubjects = subjects.filter((s) => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  const handleSimulateChange = (id: string, delta: number) => {
    setSimulationOffsets((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Target Controller */}
      <div className="liquid-card p-5 sm:p-6 relative overflow-hidden">
        <div className="specular-glow" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                JIIT Academic Compliance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                75% Rule Enforced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Attendance & Bunk Predictor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-0.5">
              Live semester tracker with dynamic bunk buffer & recovery projection.
            </p>
          </div>

          {/* Target Threshold Selector */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 pl-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Target:</span>
            </div>
            <div className="flex items-center gap-1">
              {[75, 80, 85].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetAttendance(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    targetAttendance === val
                      ? `${accentStyles.primaryBg} text-white shadow-sm`
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Summary Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Total Enrolled</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {subjects.length} Subjects
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Aggregated Attendance</span>
            <div className={`text-lg font-bold mt-0.5 ${overallMetrics.textColor}`}>
              {overallMetrics.formattedPercentage}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Classes Attended</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {totalAttended} / {totalHeld}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Status Outlook</span>
            <div className="text-xs font-semibold mt-1 flex items-center gap-1.5">
              {overallMetrics.status === 'safe' ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Above Threshold
                </span>
              ) : (
                <span className="text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Action Needed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'core', label: 'Core CSE & Engg' },
            { id: 'lab', label: 'Laboratories' },
            { id: 'maths', label: 'Mathematics' },
            { id: 'humanities', label: 'Humanities' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
                  : 'liquid-card text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubjects.map((subject) => {
          const metrics = calculateAttendanceMetrics(subject.attended, subject.total, targetAttendance);
          const simulatedBunks = simulationOffsets[subject.id] || 0;
          
          // Simulated metrics if user tests bunks
          const simulatedMetrics = simulatedBunks > 0
            ? calculateAttendanceMetrics(subject.attended, subject.total + simulatedBunks, targetAttendance)
            : null;

          return (
            <div
              key={subject.id}
              className="liquid-card p-5 relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="specular-glow" />

              <div>
                {/* Header: Code, Title & Status Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {subject.code}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {subject.credits} Credits • {subject.roomDefault}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Faculty: {subject.faculty}
                    </p>
                  </div>

                  {/* Percentage Pill */}
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${metrics.pillColor} shrink-0 text-center`}>
                    <div className="text-sm">{metrics.formattedPercentage}</div>
                  </div>
                </div>

                {/* Attended Count & Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <span>
                      Attended: <strong className="text-slate-800 dark:text-zinc-200">{subject.attended}</strong> of{' '}
                      <strong className="text-slate-800 dark:text-zinc-200">{subject.total}</strong> classes
                    </span>
                    <span className="text-[11px]">
                      Target: {targetAttendance}%
                    </span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-zinc-800/80 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${metrics.progressBarColor}`}
                      style={{ width: `${Math.min(metrics.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Safe Bunk or Deficit Insight Box */}
                <div className={`mt-3.5 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  metrics.status === 'safe'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : metrics.status === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {metrics.status === 'safe' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-semibold">{metrics.statusMessage}</span>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 shrink-0">
                    {metrics.status.toUpperCase()}
                  </span>
                </div>

                {/* Interactive Bunk Simulator Drawer */}
                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-zinc-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span className="text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Hypothetical bunk test:</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSimulateChange(subject.id, -1)}
                      disabled={simulatedBunks <= 0}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 flex items-center justify-center disabled:opacity-30 hover:bg-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      +{simulatedBunks}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSimulateChange(subject.id, 1)}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {simulatedMetrics && (
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-[11px] flex items-center justify-between text-slate-700 dark:text-zinc-300">
                    <span>If you bunk {simulatedBunks} more classes:</span>
                    <span className={`font-bold ${simulatedMetrics.textColor}`}>
                      {simulatedMetrics.formattedPercentage} ({simulatedMetrics.canBunkCount} safe left)
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: + Present, + Absent, Reset */}
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onResetSubject(subject.id)}
                  title="Reset to initial data"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSubject(subject.id, 0, 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>+ Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSubject(subject.id, 1, 1)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${accentStyles.primaryBg}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>+ Present</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
