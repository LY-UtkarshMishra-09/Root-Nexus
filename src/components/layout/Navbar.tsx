'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useGlobalAttendance } from '@/context/AttendanceContext';
import { calculateAggregate } from '@/utils/attendanceMath';
import { TingeColor } from '@/types';
import {
  Sun,
  Moon,
  Sparkles,
  Clock,
  GraduationCap,
  Percent,
  CalendarDays,
  Palette,
  Terminal,
  Layers,
} from 'lucide-react';

const TINGE_OPTIONS: { id: TingeColor; label: string; colorClass: string; bgHex: string }[] = [
  { id: 'emerald', label: 'Emerald Matrix', colorClass: 'bg-emerald-500', bgHex: '#10b981' },
  { id: 'violet', label: 'Indigo / Violet', colorClass: 'bg-violet-500', bgHex: '#8b5cf6' },
  { id: 'cyan', label: 'Cyan Frost', colorClass: 'bg-cyan-500', bgHex: '#06b6d4' },
  { id: 'amber', label: 'Sunset Amber', colorClass: 'bg-amber-500', bgHex: '#f59e0b' },
  { id: 'rose', label: 'Rose Blush', colorClass: 'bg-rose-500', bgHex: '#f43f5e' },
];

export const Navbar: React.FC = () => {
  const { theme, tinge, setTinge, toggleTheme, accentStyles } = useTheme();
  const { subjects, targetThreshold } = useGlobalAttendance();
  const aggregate = calculateAggregate(subjects, targetThreshold);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showTingeMenu, setShowTingeMenu] = useState(false);
  const [studentBatch, setStudentBatch] = useState<string>('128-B3');

  useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem('rootnexus_student_profile_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.batch) setStudentBatch(parsed.batch);
        }
      } catch {}
    };

    loadProfile();
    window.addEventListener('storage', loadProfile);
    window.addEventListener('rootnexus_profile_updated', loadProfile);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', loadProfile);
      window.removeEventListener('rootnexus_profile_updated', loadProfile);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full transition-all duration-300">
      {/* Top subtle highlight border line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500/40 dark:via-emerald-400/30 to-transparent" />

      <div className="liquid-card mx-2 sm:mx-4 mt-2 sm:mt-3 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-lg">
        {/* Brand & Required Indicator Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/15'
                  : 'bg-white border border-slate-200/80 shadow-slate-200'
              }`}
            >
              <div
                className="absolute inset-0 opacity-40 blur-[6px] transition-all group-hover:opacity-75"
                style={{ backgroundColor: `rgb(${accentStyles.glowRgb})` }}
              />
              <Terminal className="w-5 h-5 text-emerald-500 dark:text-emerald-400 relative z-10 transition-transform group-hover:scale-110" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Root <span className={accentStyles.primaryText}>Nexus</span>
                </h1>
                <span className="hidden xs:inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                Personal Student Cockpit
              </p>
            </div>
          </Link>

          {/* Prompt Required Indicator Badge: JIIT Sec-128 | Dynamic Batch */}
          <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              <span>JIIT Sec-128 | Batch: {studentBatch}</span>
            </div>
          </div>
        </div>

        {/* Live Date, Time & Attendance Badge */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick attendance average pill */}
          <Link
            href="/attendance"
            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium border bg-white/50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-colors"
            title="Click to view Attendance & Bunk Predictor"
          >
            <Percent
              className={`w-3.5 h-3.5 ${
                aggregate.overallPercentage >= 75 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            />
            <span className="text-slate-600 dark:text-zinc-400">Att:</span>
            <span
              className={`font-bold font-mono ${
                aggregate.overallPercentage >= 75
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {aggregate.formattedOverallPercentage}
            </span>
          </Link>

          {/* Live Date & Time Display */}
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
              <span className="tabular-nums font-semibold tracking-wide font-mono">
                {currentTime || '04:00:00 PM'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
              <CalendarDays className="w-3 h-3" />
              <span>{currentDate || 'Sunday, 27 Sep'}</span>
            </div>
          </div>

          {/* Theme & Accent Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-zinc-800 relative">
            {/* Tinge / Accent selector dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTingeMenu(!showTingeMenu)}
                title="Customize Accent Highlight"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700/80 shadow-sm"
              >
                <div
                  className="w-4 h-4 rounded-full shadow-inner ring-2 ring-white/50 dark:ring-black/50 transition-transform hover:scale-110"
                  style={{ backgroundColor: `rgb(${accentStyles.glowRgb})` }}
                />
              </button>

              {/* Tinge Popover */}
              {showTingeMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 p-2 rounded-2xl liquid-card z-50 shadow-2xl border border-slate-200 dark:border-zinc-700 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowTingeMenu(false)}
                >
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    <Palette className="w-3 h-3" />
                    <span>Accent Theme</span>
                  </div>
                  <div className="space-y-1">
                    {TINGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTinge(opt.id);
                          setShowTingeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          tinge === opt.id
                            ? 'bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-sm"
                            style={{ backgroundColor: opt.bgHex }}
                          />
                          <span>{opt.label}</span>
                        </div>
                        {tinge === opt.id && (
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700/80 shadow-sm text-slate-700 dark:text-zinc-200"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
