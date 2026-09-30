'use client';

import React from 'react';
import { AttendanceAction } from '@/types/attendance';
import { useTheme } from '@/context/ThemeContext';
import {
  History,
  X,
  Undo2,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  Clock,
} from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AttendanceAction[];
  onUndoLastAction: () => void;
  onClearLog: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  auditLog,
  onUndoLastAction,
  onClearLog,
}) => {
  const { accentStyles } = useTheme();

  if (!isOpen) return null;

  const getActionIcon = (type: AttendanceAction['type']) => {
    switch (type) {
      case 'MARK_PRESENT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'MARK_ABSENT':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'DECREMENT_PRESENT':
      case 'DECREMENT_ABSENT':
        return <MinusCircle className="w-4 h-4 text-amber-500" />;
      case 'EDIT_SUBJECT':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'RESET_SUBJECT':
        return <RotateCcw className="w-4 h-4 text-violet-500" />;
      case 'ADD_SUBJECT':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'DELETE_SUBJECT':
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="liquid-card w-full max-w-md h-full p-5 sm:p-6 flex flex-col justify-between shadow-2xl border-l border-slate-200 dark:border-zinc-700 animate-in slide-in-from-right duration-300">
        <div className="specular-glow" />

        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Action Audit Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {auditLog.length} recent operations recorded
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Undo Toolbar */}
          <div className="mt-4 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onUndoLastAction}
              disabled={auditLog.length === 0}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all ${accentStyles.primaryBg}`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo Last Action</span>
            </button>

            {auditLog.length > 0 && (
              <button
                type="button"
                onClick={onClearLog}
                className="py-1.5 px-2.5 rounded-lg text-xs text-slate-500 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors"
                title="Clear all logs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Action List */}
        <div className="flex-1 my-4 overflow-y-auto space-y-2.5 pr-1">
          {auditLog.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 dark:text-zinc-500 p-4">
              <History className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-semibold">No recent actions logged</p>
              <p className="text-[11px] mt-0.5">Click &ldquo;+ Present&rdquo; or &ldquo;+ Absent&rdquo; on any subject to record actions.</p>
            </div>
          ) : (
            auditLog.map((action, index) => (
              <div
                key={action.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                  index === 0
                    ? 'bg-slate-50 dark:bg-zinc-900/80 border-slate-300 dark:border-zinc-700 shadow-sm'
                    : 'bg-white/40 dark:bg-zinc-900/40 border-slate-200/70 dark:border-zinc-800/60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {getActionIcon(action.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {action.description}
                    </span>
                    {index === 0 && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        Latest
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{action.formattedTime}</span>
                    <span>•</span>
                    <span className="font-mono">{action.subjectCode}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Actions are stored in browser memory & local storage for instant rollbacks.
          </p>
        </div>
      </div>
    </div>
  );
};
