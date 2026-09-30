'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { TimetableSlot } from '@/types';
import { Subject } from '@/types/attendance';
import { MESS_MENU } from '@/lib/mockData';
import { calculateAttendanceMetrics } from '@/lib/attendanceUtils';
import {
  Sparkles,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Utensils,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  ChevronRight,
  BookmarkPlus,
  Coffee,
} from 'lucide-react';

interface TodayGlanceTabProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  onNavigateTab: (tab: 'dashboard' | 'attendance' | 'schedule' | 'notes' | 'food') => void;
  targetAttendance?: number;
}

export const TodayGlanceTab: React.FC<TodayGlanceTabProps> = ({
  subjects,
  timetable,
  onNavigateTab,
  targetAttendance = 75,
}) => {
  const { accentStyles, theme } = useTheme();

  // Selected meal view for preview card (default dynamically based on hour)
  const currentHour = new Date().getHours();
  const initialMealType = useMemo(() => {
    if (currentHour < 10) return 'breakfast';
    if (currentHour < 15) return 'lunch';
    if (currentHour < 19) return 'snacks';
    return 'dinner';
  }, [currentHour]);

  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>(initialMealType);

  // Overall attendance calculations
  const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
  const totalHeld = subjects.reduce((acc, s) => acc + s.total, 0);
  const overallMetrics = calculateAttendanceMetrics(totalAttended, totalHeld, targetAttendance);

  const atRiskSubjects = subjects.filter((s) => {
    const met = calculateAttendanceMetrics(s.attended, s.total, targetAttendance);
    return met.status === 'danger';
  });

  const warningSubjects = subjects.filter((s) => {
    const met = calculateAttendanceMetrics(s.attended, s.total, targetAttendance);
    return met.status === 'warning';
  });

  // Calculate upcoming or current lecture for today (e.g., Monday as typical day)
  const todayDayName = 'Monday'; // Default to standard class day
  const todaySlots = timetable.filter((s) => s.day === todayDayName && s.type !== 'Break');

  // We highlight the prominent upcoming slot:
  // e.g. slot 1 or 2
  const nextUpSlot = todaySlots[0] || {
    id: 'sample',
    subjectCode: '15B11CI111',
    subjectName: 'Software Development Fundamentals-1 (SDF-1)',
    room: 'CL-04 (Computer Lab)',
    startTime: '09:00',
    endTime: '09:50',
    faculty: 'Dr. Manish K. Thakur',
    type: 'Lab',
  };

  // Find corresponding subject for nextUpSlot
  const nextSubject = subjects.find((s) => s.code === nextUpSlot.subjectCode);
  const nextSubjectMetrics = nextSubject 
    ? calculateAttendanceMetrics(nextSubject.attended, nextSubject.total, targetAttendance)
    : null;

  // Today's mess menu
  const todayMenu = MESS_MENU['Monday'] || MESS_MENU['Wednesday'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="liquid-card p-5 sm:p-6 overflow-hidden relative">
        <div className="specular-glow" />
        <div 
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: `rgb(${accentStyles.glowRgb})` }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Academic Session Active
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                JIIT Sector 62 Campus
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, <span className={accentStyles.primaryText}>Utkarsh</span>! 👋
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-300 mt-0.5">
              You have <span className="font-semibold text-slate-800 dark:text-zinc-100">{todaySlots.length} sessions</span> scheduled today. Overall attendance is healthy at{' '}
              <span className={`font-semibold ${overallMetrics.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {overallMetrics.formattedPercentage}
              </span>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg transition-all duration-200 flex items-center gap-2 ${accentStyles.primaryBg}`}
            >
              <span>Manage Attendance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Attendance */}
        <div className="liquid-card p-4 sm:p-5 relative group">
          <div className="specular-glow" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Overall Attendance
            </span>
            <div className={`p-2 rounded-xl ${overallMetrics.bgColor} border ${overallMetrics.borderColor}`}>
              <TrendingUp className={`w-4 h-4 ${overallMetrics.textColor}`} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${overallMetrics.textColor}`}>
              {overallMetrics.formattedPercentage}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              ({totalAttended}/{totalHeld} classes)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${overallMetrics.progressBarColor}`}
              style={{ width: `${Math.min(overallMetrics.percentage, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Target: {targetAttendance}%</span>
            <span className="text-slate-400 dark:text-zinc-600">•</span>
            <span className={overallMetrics.status === 'safe' ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
              {overallMetrics.status === 'safe' ? `${overallMetrics.canBunkCount} bunk safe` : 'Below cutoff'}
            </span>
          </p>
        </div>

        {/* Card 2: Attendance Health / Risk Watch */}
        <div className="liquid-card p-4 sm:p-5 relative group">
          <div className="specular-glow" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Classes at Risk (&lt;75%)
            </span>
            <div className={`p-2 rounded-xl ${atRiskSubjects.length > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border`}>
              <AlertTriangle className={`w-4 h-4 ${atRiskSubjects.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${atRiskSubjects.length > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {atRiskSubjects.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {atRiskSubjects.length === 1 ? 'subject requires recovery' : 'critical alerts'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-zinc-400">
            {atRiskSubjects.length > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                {atRiskSubjects.map((s) => s.shortName).join(', ')}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All subjects &ge; 75%
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
            {warningSubjects.length} on warning edge (75-79%)
          </p>
        </div>

        {/* Card 3: Today's Schedule Load */}
        <div className="liquid-card p-4 sm:p-5 relative group">
          <div className="specular-glow" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Schedule Load (Mon)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {todaySlots.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Sessions Total
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">3 Lec</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">1 Lab (2h)</span>
            <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">2 Tut</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
            09:00 AM &ndash; 04:50 PM
          </p>
        </div>

        {/* Card 4: Campus Life / Mess Today */}
        <div className="liquid-card p-4 sm:p-5 relative group">
          <div className="specular-glow" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Mess Special Today
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-base font-bold text-amber-600 dark:text-amber-400 line-clamp-1">
              {todayMenu.specialItem || 'Hot Gulab Jamun Night'}
            </span>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Dinner @ Annapurna Hall
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-zinc-400">Lunch: Rajma Chawal</span>
            <button
              type="button"
              onClick={() => onNavigateTab('food')}
              className={`font-semibold ${accentStyles.primaryText} hover:underline flex items-center gap-0.5`}
            >
              <span>Menu</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Mid Section: Next Up Card + Today's Mess Menu Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Up Live Class Card (7 cols) */}
        <div className="lg:col-span-7 liquid-card p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="specular-glow" />
          <div 
            className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: `rgb(${accentStyles.glowRgb})` }}
          />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                  Next Up / Current Class
                </span>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {nextUpSlot.type} Session
              </span>
            </div>

            {/* Subject Title & Details */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-zinc-400">
                  {nextUpSlot.subjectCode}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {nextUpSlot.subjectName}
                </h3>
              </div>

              {/* Room & Time Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 font-semibold text-slate-800 dark:text-zinc-200">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Room: {nextUpSlot.room}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 font-medium text-slate-700 dark:text-zinc-300">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{nextUpSlot.startTime} &ndash; {nextUpSlot.endTime}</span>
                </div>

                {nextUpSlot.faculty && (
                  <div className="text-xs text-slate-500 dark:text-zinc-400">
                    Faculty: <span className="text-slate-700 dark:text-zinc-300 font-medium">{nextUpSlot.faculty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bunk Simulator & Impact for this Subject */}
            {nextSubjectMetrics && (
              <div className="mt-5 p-3.5 rounded-xl bg-slate-100/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-zinc-400">
                    Attendance for {nextSubject?.shortName}:
                  </span>
                  <span className={`font-bold ${nextSubjectMetrics.textColor}`}>
                    {nextSubjectMetrics.formattedPercentage} ({nextSubject?.attended}/{nextSubject?.total})
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${nextSubjectMetrics.progressBarColor}`}
                    style={{ width: `${Math.min(nextSubjectMetrics.percentage, 100)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-600 dark:text-zinc-400 flex items-center justify-between pt-1">
                  <span>{nextSubjectMetrics.statusMessage}</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    {nextSubjectMetrics.canBunkCount > 0 ? '🟢 Safe to bunk' : '🔴 Class mandatory'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              Next period: <span className="font-medium text-slate-700 dark:text-zinc-200">Maths-1 @ LT-1 (10:00 AM)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('schedule')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                View Full Day
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('attendance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${accentStyles.primaryBg} shadow-sm transition-all`}
              >
                Mark Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Today's Mess Menu Preview Card (5 cols) */}
        <div className="lg:col-span-5 liquid-card p-5 sm:p-6 relative flex flex-col justify-between">
          <div className="specular-glow" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Mess Menu
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Annapurna Mess (Ground Floor)
              </span>
            </div>

            {/* Meal Selector Tabs (Breakfast, Lunch, Snacks, Dinner) */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 mb-4 text-xs font-medium">
              {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setSelectedMeal(meal)}
                  className={`py-1.5 rounded-lg capitalize transition-all duration-200 ${
                    selectedMeal === meal
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>

            {/* Meal Timing & Items Display */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
                <span>
                  {selectedMeal === 'breakfast' && 'Timing: 07:30 AM – 09:30 AM'}
                  {selectedMeal === 'lunch' && 'Timing: 12:30 PM – 02:30 PM'}
                  {selectedMeal === 'snacks' && 'Timing: 05:00 PM – 06:30 PM'}
                  {selectedMeal === 'dinner' && 'Timing: 08:00 PM – 10:00 PM'}
                </span>
                <span className="text-emerald-500 font-medium">Included in Hostel</span>
              </div>

              {/* Dishes list */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 space-y-2">
                {todayMenu[selectedMeal].map((dish, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-medium">{dish}</span>
                  </div>
                ))}
              </div>

              {/* Special dish banner */}
              {todayMenu.specialItem && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-amber-700 dark:text-amber-300 font-semibold">
                    Special: {todayMenu.specialItem}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Jump to Full Campus Food button */}
          <div className="mt-5 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Craving outside snacks?
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('food')}
              className={`text-xs font-semibold ${accentStyles.primaryText} hover:underline flex items-center gap-1`}
            >
              <span>Explore Nescafe & Tuck Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Shortcuts Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('attendance')}
          className="liquid-card p-3.5 flex items-center gap-3 text-left hover:scale-[1.01] transition-transform"
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Bunk Calculator</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Test hypothetical bunks</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('schedule')}
          className="liquid-card p-3.5 flex items-center gap-3 text-left hover:scale-[1.01] transition-transform"
        >
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Weekly Timetable</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Mon - Fri lecture slots</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('notes')}
          className="liquid-card p-3.5 flex items-center gap-3 text-left hover:scale-[1.01] transition-transform"
        >
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500">
            <BookmarkPlus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">PYQs & Lab Sheets</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">T1, T2 & End Sem</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('food')}
          className="liquid-card p-3.5 flex items-center gap-3 text-left hover:scale-[1.01] transition-transform"
        >
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Nescafe & Canteen</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Menu & price rate list</div>
          </div>
        </button>
      </div>
    </div>
  );
};
