'use client';

import React, { useState } from 'react';
import { Subject } from '@/types/attendance';
import { calculateAggregate } from '@/utils/attendanceMath';
import { useAttendance } from '@/hooks/useAttendance';
import { useTheme } from '@/context/ThemeContext';
import { SubjectCard } from '@/components/SubjectCard';
import { SubjectModal } from '@/components/SubjectModal';
import { AuditLogDrawer } from '@/components/AuditLogDrawer';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Undo2,
  History,
  RotateCcw,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

interface AttendanceTrackerProps {
  // Optional controlled props if parent passes them, or uses internal useAttendance hook
  customAttendanceHook?: ReturnType<typeof useAttendance>;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ customAttendanceHook }) => {
  const internalHook = useAttendance();
  const {
    subjects,
    targetThreshold,
    auditLog,
    isHydrated,
    markPresent,
    markAbsent,
    decrementPresent,
    decrementAbsent,
    undoLastAction,
    addSubject,
    editSubject,
    deleteSubject,
    resetSubjectAttendance,
    resetAllToSeed,
    clearAuditLog,
    setTargetThreshold,
  } = customAttendanceHook || internalHook;

  const { accentStyles } = useTheme();

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals & Drawers State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Aggregated calculations across all subjects
  const aggregate = calculateAggregate(subjects, targetThreshold);

  // Filtered subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.shortName && subject.shortName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || subject.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data: Omit<Subject, 'id'> | Subject) => {
    if ('id' in data) {
      editSubject(data as Subject);
    } else {
      addSubject(data);
    }
  };

  const handleDeletePrompt = (id: string) => {
    setDeleteCandidateId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteCandidateId) {
      deleteSubject(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  const recentAction = auditLog.length > 0 ? auditLog[0] : null;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Global Metric Header & Target Controls */}
      <div className="liquid-card p-5 sm:p-6 relative overflow-hidden">
        <div className="specular-glow" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Phase 2 Engine • JIIT Semester 1
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  aggregate.atRiskCount === 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                {aggregate.statusBadge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Attendance & Bunk Predictor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-0.5">
              Production-grade mathematical engine with granular undo, audit history, and live persistence.
            </p>
          </div>

          {/* Target Safety Buffer & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Target Threshold Selector */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 pl-1.5 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>Target:</span>
              </span>
              <div className="flex items-center gap-1">
                {[75, 80, 85].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetThreshold(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      targetThreshold === val
                        ? `${accentStyles.primaryBg} text-white shadow-sm`
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Audit History Drawer Button */}
            <button
              type="button"
              onClick={() => setIsAuditDrawerOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/70 hover:bg-slate-100 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="View Action History"
            >
              <History className="w-4 h-4 text-violet-500" />
              <span className="hidden sm:inline">History ({auditLog.length})</span>
            </button>

            {/* Add Subject Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95 ${accentStyles.primaryBg}`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Global Metric Cards Grid */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Metric 1: Overall Percentage */}
          <div className="p-3.5 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Overall Aggregate</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className={`text-2xl font-black mt-1 ${
              aggregate.zone === 'safe'
                ? 'text-emerald-600 dark:text-emerald-400'
                : aggregate.zone === 'warning'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {aggregate.formattedOverallPercentage}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Cutoff requirement: {targetThreshold}%
            </div>
          </div>

          {/* Metric 2: Classes Attended */}
          <div className="p-3.5 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Classes Attended</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {aggregate.totalAttended} <span className="text-sm font-normal text-slate-400">/ {aggregate.totalConducted}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {aggregate.totalConducted - aggregate.totalAttended} classes missed
            </div>
          </div>

          {/* Metric 3: Safe Bunk Buffer */}
          <div className="p-3.5 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Aggregate Bunk Buffer</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {aggregate.canBunkAggregate} <span className="text-sm font-normal text-slate-400">bunks</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Before dropping to {targetThreshold}%
            </div>
          </div>

          {/* Metric 4: Debarment Risk Count */}
          <div className="p-3.5 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Debarment Risk (&lt;75%)</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${aggregate.atRiskCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-black mt-1 font-mono ${
              aggregate.atRiskCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {aggregate.atRiskCount} <span className="text-sm font-normal text-slate-400">courses</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {aggregate.warningCount} on warning edge (75-79%)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Audit Log Banner with Single-Click Undo */}
      {recentAction && (
        <div className="p-3 rounded-2xl liquid-card border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="truncate">
              <span className="text-slate-500 dark:text-zinc-400">Latest Action: </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {recentAction.description}
              </span>
              <span className="text-slate-400 dark:text-zinc-500 ml-1.5 font-mono text-[11px]">
                ({recentAction.formattedTime})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={undoLastAction}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-200/80 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Undo this specific change"
            >
              <Undo2 className="w-3.5 h-3.5 text-violet-500" />
              <span>Undo</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Search & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'core', label: 'Core CSE' },
            { id: 'lab', label: 'Labs' },
            { id: 'maths', label: 'Maths' },
            { id: 'humanities', label: 'Humanities' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'liquid-card text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input & Reset option */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or subject..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>

          <button
            type="button"
            onClick={resetAllToSeed}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Reset all courses to initial JIIT seed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Subject Cards Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="liquid-card p-12 text-center text-slate-500 dark:text-zinc-400">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No subjects match the search query or filter.</p>
          <p className="text-xs mt-1">Try clearing your search or add a new subject using the &ldquo;Add Subject&rdquo; button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              targetThreshold={targetThreshold}
              onMarkPresent={markPresent}
              onMarkAbsent={markAbsent}
              onDecrementPresent={decrementPresent}
              onDecrementAbsent={decrementAbsent}
              onEdit={handleOpenEditModal}
              onDelete={handleDeletePrompt}
              onReset={resetSubjectAttendance}
            />
          ))}
        </div>
      )}

      {/* 5. Subject Add / Edit Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingSubject}
      />

      {/* 6. Action Audit Log Drawer */}
      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        auditLog={auditLog}
        onUndoLastAction={undoLastAction}
        onClearLog={clearAuditLog}
      />

      {/* 7. Delete Confirmation Dialog */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="liquid-card w-full max-w-sm p-6 relative overflow-hidden shadow-2xl border border-rose-500/30">
            <div className="specular-glow" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Subject?
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2">
              Are you sure you want to remove this subject from your active semester enrollment?
              You can undo this immediately from the audit history if needed.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
