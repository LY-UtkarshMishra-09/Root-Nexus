'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TIMETABLE_DATA, INITIAL_TODOS } from '@/data/mockData';
import DaySelector from '@/components/DaySelector';
import { useTinge } from '@/context/TingeContext';
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  CheckSquare,
  CheckCircle2,
  Circle,
  Plus,
  AlertTriangle,
  Sparkles,
  X,
  Layers,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const STORAGE_TODOS_KEY = 'rootnexus_todos_v1';

export default function DailyBriefingPage() {
  const { tinge } = useTinge();
  const [mounted, setMounted] = useState(false);
  const [currentDay, setCurrentDay] = useState('Monday');
  const [todayDayName, setTodayDayName] = useState('Monday');
  const [currentTimeStr, setCurrentTimeStr] = useState('10:00');
  const [todos, setTodos] = useState(INITIAL_TODOS);

  // Quick Add Assignment Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('24B11CS111');
  const [newSubjectName, setNewSubjectName] = useState('SDF-1');
  const [newPriority, setNewPriority] = useState('High');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    // 1. Detect today's real day of the week
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const detectedDay = dayNames[now.getDay()];
    setTodayDayName(detectedDay);

    // Auto-select today's day on initial render, default to Monday on Sunday
    if (WEEKDAYS.includes(detectedDay)) {
      setCurrentDay(detectedDay);
    } else {
      setCurrentDay('Monday');
    }

    // Format current time HH:MM for live indicator check
    const updateTime = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hh}:${mm}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    // Load persisted assignments
    try {
      const savedTodos = localStorage.getItem(STORAGE_TODOS_KEY);
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch {}

    setMounted(true);
    return () => clearInterval(timer);
  }, []);

  // Save todos to localStorage
  const saveTodos = (updated) => {
    setTodos(updated);
    try {
      localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Toggle task completion
  const handleToggleTask = (id) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTodos(updated);
  };

  // Create new assignment inline
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subjectCode: newSubjectCode,
      subjectName: newSubjectName,
      priority: newPriority,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      completed: false,
      archived: false,
    };

    saveTodos([newTask, ...todos]);
    setNewTitle('');
    setShowAddModal(false);
  };

  // Get sequential classes for current selected day
  const todayClasses = useMemo(() => {
    return TIMETABLE_DATA.filter((slot) => slot.day === currentDay && slot.type !== 'Break');
  }, [currentDay]);

  // Activity indicators map for the DaySelector strip
  const activityMap = useMemo(() => {
    const map = {};
    WEEKDAYS.forEach((d) => {
      // Has scheduled classes or has deadlines
      const hasClasses = TIMETABLE_DATA.some((s) => s.day === d && s.type !== 'Break');
      map[d] = hasClasses;
    });
    return map;
  }, []);

  // Compute countdown label (e.g. "Due Today", "Due Tomorrow", "In X days")
  const getDueCountdown = (dateString) => {
    if (!dateString) return 'Upcoming';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return dateString;
  };

  // Check slot status: 'live' vs 'upcoming' vs 'completed'
  const isViewingToday = currentDay === todayDayName;

  const getSlotStatus = (slot) => {
    if (!isViewingToday) return 'scheduled';
    if (currentTimeStr >= slot.startTime && currentTimeStr <= slot.endTime) {
      return 'live';
    }
    if (currentTimeStr > slot.endTime) {
      return 'completed';
    }
    return 'upcoming';
  };

  const pendingAssignments = todos.filter((t) => !t.completed && !t.archived);
  const completedAssignments = todos.filter((t) => t.completed && !t.archived);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-20 bg-zinc-900/40 rounded-2xl border border-zinc-800/80" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-zinc-900/40 rounded-2xl border border-zinc-800/80" />
          <div className="lg:col-span-5 h-96 bg-zinc-900/40 rounded-2xl border border-zinc-800/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* HEADER + DYNAMIC DAY PICKER (JIIT Pulse Style) */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-800/70">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Daily Briefing
              </h1>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors ${tinge.badgeBg} ${tinge.badgeText} ${tinge.badgeBorder}`}
              >
                Focus Cockpit
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live routine & urgent deliverables for Sector-128 • Semester 1 CSE
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Clock: {currentTimeStr}</span>
            {isViewingToday && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                Viewing Today
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Day & Date Strip (With Active Tinge Color) */}
        <DaySelector
          selectedDay={currentDay}
          onSelectDay={(day) => setCurrentDay(day)}
          includeSaturday={true}
          hasActivityMap={activityMap}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2 CORE MODULES: (Section 1: Schedule + Section 2: Assignments) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* SECTION 1: SELECTED DAY'S CLASS SCHEDULE (7 Cols) */}
        {/* ========================================================================= */}
        <section className="lg:col-span-7 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-all space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {currentDay}&apos;s Class Schedule
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Batch 128-B3 • {todayClasses.length} {todayClasses.length === 1 ? 'Session' : 'Sessions'} Scheduled
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              {currentDay}
            </span>
          </div>

          {/* Sequential Class Cards */}
          <div className="space-y-2.5">
            {todayClasses.length === 0 ? (
              <div className="p-10 text-center rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-zinc-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-300">
                  No classes scheduled for {currentDay}.
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Enjoy your free study block or revise pending lab sheets!
                </p>
              </div>
            ) : (
              todayClasses.map((slot) => {
                const status = getSlotStatus(slot);
                const isLive = status === 'live';
                const isCompleted = status === 'completed';

                // Type badge styling:
                // Lecture (sky-500/20 text-sky-400)
                // Tutorial (purple-500/20 text-purple-400)
                // Lab (emerald-500/20 text-emerald-400)
                const typeStyle =
                  slot.type === 'Lecture'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : slot.type === 'Tutorial'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

                return (
                  <div
                    key={slot.id}
                    className={`rounded-xl p-3.5 transition-all relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                      isLive
                        ? 'bg-sky-950/30 border-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.2)] ring-1 ring-sky-500/40'
                        : isCompleted
                        ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700/80'
                    }`}
                  >
                    {/* Left: Time Slot & Subject Info */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Time Slot Tag */}
                      <div className="shrink-0 text-center min-w-[76px] p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="text-xs font-mono font-bold text-zinc-200">
                          {slot.startTime}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {slot.endTime}
                        </div>
                      </div>

                      {/* Subject Name & Details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-zinc-400">
                            {slot.subjectCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeStyle}`}>
                            {slot.type}
                          </span>
                          {slot.faculty && (
                            <span className="text-[11px] text-zinc-400 hidden sm:inline">
                              • {slot.faculty}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white truncate">
                          {slot.subjectName}
                        </h3>
                      </div>
                    </div>

                    {/* Right: Venue & Live Indicator Ring */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80 shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{slot.room}</span>
                      </div>

                      {/* Real-time Indicator Ring */}
                      {isLive ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center gap-1.5 animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          Live Now
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-2 py-0.5">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider px-2 py-0.5">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: PENDING ASSIGNMENTS & DEADLINES (5 Cols) */}
        {/* ========================================================================= */}
        <section className="lg:col-span-5 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-all space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div
                className="p-2 rounded-xl border transition-colors"
                style={{
                  backgroundColor: `${tinge.hex}1a`,
                  borderColor: `${tinge.hex}33`,
                  color: tinge.hex,
                }}
              >
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pending Assignments
                </h2>
                <p className="text-[11px] text-zinc-400">
                  {pendingAssignments.length} urgent deliverables remaining
                </p>
              </div>
            </div>

            {/* Actions: Link to Calendar & Quick Inline "+ Add Assignment" button */}
            <div className="flex items-center gap-2">
              <Link
                href="/calendar"
                className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                title="Open Synchronized Academic Calendar"
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Calendar</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{
                  backgroundColor: tinge.hex,
                  boxShadow: `0 4px 14px ${tinge.hex}40`,
                }}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer hover:opacity-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Pending Assignment List */}
          <div className="space-y-2">
            {pendingAssignments.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-zinc-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="text-sm font-semibold text-zinc-200">All caught up!</p>
                <p className="text-xs text-zinc-500 mt-0.5">No pending deadlines right now.</p>
              </div>
            ) : (
              pendingAssignments.map((task) => {
                const countdown = getDueCountdown(task.dueDate);
                const isOverdue = countdown === 'Overdue';
                const isToday = countdown === 'Due Today';

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-start justify-between gap-3 group"
                  >
                    {/* 1-Tap Checkbox & Title */}
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                        title="Mark complete"
                      >
                        <Circle className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                          {task.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                          <span className="font-mono font-semibold" style={{ color: tinge.hex }}>
                            {task.subjectCode}
                          </span>
                          <span>•</span>
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-400 font-bold'
                                : isToday
                                ? 'text-amber-400 font-bold'
                                : 'text-zinc-400'
                            }
                          >
                            {countdown}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Priority Pill (High, Med, Low) */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        task.priority === 'High'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : task.priority === 'Med'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Section 2 Bottom Bar: Calendar Link & Completed Summary */}
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
            <Link
              href="/calendar"
              className="text-zinc-400 hover:text-white flex items-center gap-1 group font-medium"
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Timeline Calendar</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {completedAssignments.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (completedAssignments[0]) {
                    handleToggleTask(completedAssignments[0].id);
                  }
                }}
                style={{ color: tinge.hex }}
                className="hover:underline cursor-pointer"
              >
                Undo Last ({completedAssignments.length} done)
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* QUICK INLINE "+ ADD ASSIGNMENT" MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg border"
                  style={{
                    backgroundColor: `${tinge.hex}22`,
                    borderColor: `${tinge.hex}44`,
                    color: tinge.hex,
                  }}
                >
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add New Assignment</h3>
                  <p className="text-[11px] text-zinc-400">Capture a deadline to track in Root Nexus</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Complete SDF-1 Lab Sheet 5 on Pointers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1"
                  style={{ '--tw-ring-color': tinge.hex }}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Subject Code
                  </label>
                  <select
                    value={newSubjectCode}
                    onChange={(e) => {
                      setNewSubjectCode(e.target.value);
                      const map = {
                        '24B11CS111': 'SDF-1',
                        '24B11MA111': 'Maths-1',
                        '24B11PH111': 'Physics',
                        '24B11ME111': 'Workshop',
                        '24B11HS111': 'Soft Skills',
                        '24B17CS171': 'SDF Lab',
                        '24B17PH171': 'Physics Lab',
                        'GEN': 'General',
                      };
                      setNewSubjectName(map[e.target.value] || e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="24B11CS111">24B11CS111 (SDF-1)</option>
                    <option value="24B11MA111">24B11MA111 (Maths-1)</option>
                    <option value="24B11PH111">24B11PH111 (Physics)</option>
                    <option value="24B11ME111">24B11ME111 (Workshop)</option>
                    <option value="24B11HS111">24B11HS111 (Soft Skills)</option>
                    <option value="24B17CS171">24B17CS171 (SDF Lab)</option>
                    <option value="24B17PH171">24B17PH171 (Physics Lab)</option>
                    <option value="GEN">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="High">High Priority</option>
                    <option value="Med">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: tinge.hex,
                    boxShadow: `0 4px 14px ${tinge.hex}40`,
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:opacity-95 active:scale-95"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
