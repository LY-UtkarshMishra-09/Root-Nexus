'use client';

import React, { useState } from 'react';
import { Subject } from '@/types/attendance';
import { calculateSubjectMetrics, simulateOutcome } from '@/utils/attendanceMath';
import { useTheme } from '@/context/ThemeContext';
import {
  Check,
  X,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  User,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  targetThreshold: number;
  onMarkPresent: (id: string) => void;
  onMarkAbsent: (id: string) => void;
  onDecrementPresent: (id: string) => void;
  onDecrementAbsent: (id: string) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  targetThreshold,
  onMarkPresent,
  onMarkAbsent,
  onDecrementPresent,
  onDecrementAbsent,
  onEdit,
  onDelete,
  onReset,
}) => {
  const { accentStyles } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [simulatedBunks, setSimulatedBunks] = useState(0);
  const [showCircularProgress, setShowCircularProgress] = useState(false);

  const metrics = calculateSubjectMetrics(subject, targetThreshold);

  // Hypothetical bunk simulator outcome
  const simulation = simulatedBunks > 0
    ? simulateOutcome(subject.attended, subject.total, 0, simulatedBunks, targetThreshold)
    : null;

  // Circular progress calculations (Radius = 28, Circumference = 2 * PI * 28 = ~175.9)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(metrics.percentage, 100) / 100) * circumference;

  return (
    <div className={`liquid-card p-5 relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${metrics.cardGlowClass}`}>
      <div className="specular-glow" />

      {/* Top Row: Subject Code, Credits, Room & Action Menu */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                {subject.code}
              </span>
              {subject.credits && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  {subject.credits} Cr
                </span>
              )}
              {subject.roomDefault && (
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{subject.roomDefault}</span>
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
              {subject.name}
            </h3>

            {subject.faculty && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>{subject.faculty}</span>
              </p>
            )}
          </div>

          {/* Right: Percentage Badge & More Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Percentage Badge */}
            <button
              type="button"
              onClick={() => setShowCircularProgress(!showCircularProgress)}
              title="Click to toggle circular / bar view"
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-transform hover:scale-105 active:scale-95 ${metrics.badgeColorClass}`}
            >
              <span className="text-sm font-extrabold">{metrics.formattedPercentage}</span>
            </button>

            {/* Dropdown Menu Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Subject options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-44 p-1.5 rounded-xl liquid-card z-30 shadow-xl border border-slate-200 dark:border-zinc-700 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(subject);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Subject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onReset(subject.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Attendance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(subject.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Subject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Counter & Visual Meter */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 mb-1.5">
            <span>
              Attended: <strong className="text-slate-900 dark:text-white font-mono text-sm">{subject.attended}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white font-mono text-sm">{subject.total}</strong> classes
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Cutoff: {targetThreshold}%
            </span>
          </div>

          {/* Toggle between Bar or Circular Indicator */}
          {showCircularProgress ? (
            <div className="py-2 flex items-center justify-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-slate-200 dark:text-zinc-800"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke={metrics.ringColorClass}
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900 dark:text-white">
                  {metrics.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                <div>Circular attendance gauge</div>
                <div className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                  {subject.total - subject.attended} missed
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-200 dark:bg-zinc-800/80 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${metrics.progressBarColorClass}`}
                style={{ width: `${Math.min(metrics.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Prediction / Safe Bunk / Deficit Banner */}
        <div
          className={`mt-3.5 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
            metrics.zone === 'safe'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
              : metrics.zone === 'warning'
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {metrics.zone === 'safe' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span className="font-semibold leading-tight">{metrics.statusText}</span>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 shrink-0">
            {metrics.zone === 'safe' ? 'SAFE' : metrics.zone === 'warning' ? 'BUFFER' : 'DEBAR ZONE'}
          </span>
        </div>

        {/* Hypothetical Bunk Simulator Stepper */}
        <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-zinc-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Simulate skipping next:</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSimulatedBunks((prev) => Math.max(0, prev - 1))}
              disabled={simulatedBunks <= 0}
              className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 flex items-center justify-center disabled:opacity-30 hover:bg-slate-300 transition-colors"
              title="Decrease simulated bunks"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 w-5 text-center">
              {simulatedBunks}
            </span>
            <button
              type="button"
              onClick={() => setSimulatedBunks((prev) => prev + 1)}
              className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300 transition-colors"
              title="Increase simulated bunks"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {simulation && (
          <div className="mt-1.5 p-2 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-[11px] flex items-center justify-between text-slate-700 dark:text-zinc-300 animate-in fade-in">
            <span>After {simulatedBunks} bunks:</span>
            <span className={`font-bold ${simulation.zone === 'danger' ? 'text-rose-500' : simulation.zone === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
              {simulation.formatted} ({simulation.safeBunks > 0 ? `${simulation.safeBunks} safe left` : `Need ${simulation.deficit} to recover`})
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action Controls: Present, Absent & Micro Undo/Decrement Buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        {/* Micro-decrements / Undo for accidental clicks */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDecrementPresent(subject.id)}
            disabled={subject.attended <= 0}
            title="Decrement Present (-1 attended, -1 total)"
            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300 disabled:opacity-30 transition-all active:scale-95"
          >
            - Pres
          </button>
          <button
            type="button"
            onClick={() => onDecrementAbsent(subject.id)}
            disabled={subject.total <= subject.attended}
            title="Decrement Absent (undo accidental absent)"
            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300 disabled:opacity-30 transition-all active:scale-95"
          >
            - Abs
          </button>
        </div>

        {/* Primary Increment Controls */}
        <div className="flex items-center gap-2">
          {/* Mark Absent Button */}
          <button
            type="button"
            onClick={() => onMarkAbsent(subject.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all active:scale-95 shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>+ Absent</span>
          </button>

          {/* Mark Present Button */}
          <button
            type="button"
            onClick={() => onMarkPresent(subject.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${accentStyles.primaryBg}`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>+ Present</span>
          </button>
        </div>
      </div>
    </div>
  );
};
