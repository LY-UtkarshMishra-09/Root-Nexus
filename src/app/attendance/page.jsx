'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_SUBJECTS } from '@/data/mockData';
import {
  Percent,
  Plus,
  Minus,
  RotateCcw,
  Undo2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  Search,
  RefreshCw,
} from 'lucide-react';
import WebkioskSyncModal from '@/components/attendance/WebkioskSyncModal';

const STORAGE_KEY = 'rootnexus_attendance_v1';
const HISTORY_KEY = 'rootnexus_attendance_history_v1';

export default function AttendancePage() {
  const [mounted, setMounted] = useState(false);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Hydration safety: read from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSubjects(JSON.parse(saved));
      }
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch {}
    setMounted(true);
  }, []);

  // Save to localStorage helper
  const updateSubjectsWithHistory = useCallback((newSubjects, description) => {
    setHistory((prev) => [
      {
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        previousState: subjects,
        description,
      },
      ...prev.slice(0, 19),
    ]);
    setSubjects(newSubjects);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSubjects));
    } catch {}
  }, [subjects]);

  const handleApplyWebkioskSync = (syncedSubjects, msg) => {
    const merged = syncedSubjects.map((synced) => {
      const existing = subjects.find(
        (s) => s.code.toUpperCase() === synced.code.toUpperCase() || s.id === synced.id
      );
      return {
        ...existing,
        ...synced,
        faculty: existing?.faculty || 'Dept. of CSE',
      };
    });
    updateSubjectsWithHistory(merged, msg || 'Webkiosk Portal Synchronized');
  };

  // Save history whenever it updates
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }, [history, mounted]);

  // + Present: (+1 attended, +1 total)
  const handleMarkPresent = (subjectId) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        attended: sub.attended + 1,
        total: sub.total + 1,
      };
    });
    const sub = subjects.find((s) => s.id === subjectId);
    updateSubjectsWithHistory(updated, `Marked Present in ${sub?.shortName || sub?.code}`);
  };

  // + Absent: (+0 attended, +1 total)
  const handleMarkAbsent = (subjectId) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        total: sub.total + 1,
      };
    });
    const sub = subjects.find((s) => s.id === subjectId);
    updateSubjectsWithHistory(updated, `Marked Absent in ${sub?.shortName || sub?.code}`);
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0) return;
    const [lastAction, ...restHistory] = history;
    if (lastAction && lastAction.previousState) {
      setSubjects(lastAction.previousState);
      setHistory(restHistory);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lastAction.previousState));
      } catch {}
    }
  };

  // Reset to default seeds
  const handleResetToSeeds = () => {
    if (confirm('Reset all subjects attendance back to initial college seeds?')) {
      setSubjects(INITIAL_SUBJECTS);
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HISTORY_KEY);
      } catch {}
    }
  };

  // Aggregated calculations
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;
  const isOverallSafe = overallPercentage >= 75;

  const atRiskSubjects = subjects.filter((s) => {
    const pct = s.total > 0 ? (s.attended / s.total) * 100 : 100;
    return pct < 75;
  });

  const totalSafeBunksAggregate = isOverallSafe
    ? Math.floor((totalAttended - 0.75 * totalConducted) / 0.75)
    : 0;

  const totalDeficitAggregate = !isOverallSafe
    ? Math.ceil((0.75 * totalConducted - totalAttended) / 0.25)
    : 0;

  // Filtered by search
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
          <div className="h-48 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Global Summary Banner (JIIT Pulse Aesthetic) */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 hover:border-zinc-700/60 transition-all space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Official 75% Rule Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                JIIT Sec-128
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Attendance Tracker & Bunk Predictor
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Calculate safe bunks without falling below 75% or recovery classes required for exam eligibility.
            </p>
          </div>

          {/* Quick Undo, Reset & Webkiosk Sync Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
              title="Extract live attendance from JIIT Webkiosk"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Webkiosk</span>
            </button>

            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-700 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm"
              title="Undo last action"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo ({history.length})</span>
            </button>

            <button
              type="button"
              onClick={handleResetToSeeds}
              className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 hover:text-rose-400 transition-colors"
              title="Reset all to initial seeds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Overall Percentage
            </div>
            <div className={`text-2xl font-black font-mono mt-0.5 ${isOverallSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overallPercentage.toFixed(1)}%
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {totalAttended} / {totalConducted} classes attended
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Debarment Warning
            </div>
            <div className="text-xl font-bold font-mono mt-0.5">
              {atRiskSubjects.length === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>All Clear</span>
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{atRiskSubjects.length} At Risk</span>
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {atRiskSubjects.length === 0 ? 'No subjects < 75%' : 'Debarred from T1/T2 unless attended'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Safe Bunk Buffer
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              +{totalSafeBunksAggregate} classes
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Aggregate safe skip headroom
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Deficit Recovery
            </div>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
              {totalDeficitAggregate > 0 ? `Must attend ${totalDeficitAggregate}` : '0 Needed'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Consecutive classes to maintain 75%
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Enrolled 1st Year Subjects ({filteredSubjects.length})
        </span>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject or faculty..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 2. Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubjects.map((subject) => {
          const percentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 100;
          const isSafe = percentage >= 80;
          const isWarning = percentage >= 75 && percentage < 80;
          const isDebarred = percentage < 75;

          // Safe Bunks: Math.floor((attended - 0.75 * total) / 0.75)
          const safeBunkCount = isSafe || isWarning
            ? Math.floor((subject.attended - 0.75 * subject.total) / 0.75)
            : 0;

          // Deficit: Math.ceil((0.75 * total - attended) / 0.25)
          const deficitCount = isDebarred
            ? Math.ceil((0.75 * subject.total - subject.attended) / 0.25)
            : 0;

          // Progress color token
          let statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          let progressBarClass = 'bg-emerald-400';
          let cardBorderHover = 'hover:border-emerald-500/40';

          if (isWarning) {
            statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            progressBarClass = 'bg-amber-400';
            cardBorderHover = 'hover:border-amber-500/40';
          } else if (isDebarred) {
            statusBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
            progressBarClass = 'bg-rose-400';
            cardBorderHover = 'hover:border-rose-500/40';
          }

          return (
            <div
              key={subject.id}
              className={`bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 ${cardBorderHover} transition-all relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                {/* Header: Code, Title, Category Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-400">
                        {subject.code}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                        {subject.credits || 4} Cr
                      </span>
                      {subject.room && (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          • {subject.room}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {subject.faculty}
                    </p>
                  </div>

                  {/* Percentage Pill */}
                  <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${statusBadgeClass}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar & Class counts */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      Attended: <strong className="text-white font-mono">{subject.attended}</strong> / {subject.total}
                    </span>
                    <span className="text-xs font-semibold font-mono text-zinc-400">
                      75% Target
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden relative border border-zinc-800/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressBarClass}`}
                      style={{ width: `${Math.min(100, Math.max(3, percentage))}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/70 z-10"
                      style={{ left: '75%' }}
                      title="75% Official Cutoff Marker"
                    />
                  </div>
                </div>

                {/* Safe Bunk / Deficit Predictor Statement */}
                <div className="mt-3.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Predictor Verdict:</span>
                  {isDebarred ? (
                    <span className="font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Attend next {deficitCount} {deficitCount === 1 ? 'class' : 'classes'} to hit 75%
                    </span>
                  ) : safeBunkCount > 0 ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Can safely bunk {safeBunkCount} {safeBunkCount === 1 ? 'class' : 'classes'}
                    </span>
                  ) : (
                    <span className="font-bold text-amber-400">
                      On the brink! Don&apos;t skip next class
                    </span>
                  )}
                </div>
              </div>

              {/* Instant Action Buttons: + Present, + Absent */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkPresent(subject.id)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkAbsent(subject.id)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>+ Absent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Webkiosk Ingestion Modal */}
      <WebkioskSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentSubjects={subjects}
        onApplySync={handleApplyWebkioskSync}
      />
    </div>
  );
}
