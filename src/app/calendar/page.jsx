'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_TODOS } from '@/data/mockData';
import { useTinge } from '@/context/TingeContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Filter,
  Plus,
  Sparkles,
} from 'lucide-react';

const TODOS_STORAGE_KEY = 'rootnexus_todos_v1';

// Important Academic Calendar Milestones for JIIT 1st Year (Odd Semester)
const ACADEMIC_EVENTS = [
  { date: '2026-09-28', title: 'T1 Exam Results Displayed', type: 'Exam', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { date: '2026-10-02', title: 'Gandhi Jayanti (Institute Holiday)', type: 'Holiday', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { date: '2026-10-12', title: 'T2 Examination Begins', type: 'Exam', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  { date: '2026-10-17', title: 'T2 Examination Concludes', type: 'Exam', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  { date: '2026-10-24', title: 'Dussehra Break', type: 'Holiday', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { date: '2026-11-10', title: 'Diwali Institute Recess Begins', type: 'Holiday', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { date: '2026-11-28', title: 'End-Sem Lab Vivas & File Verification', type: 'Exam', color: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
  { date: '2026-12-05', title: 'T3 End-Semester Exams Begin', type: 'Exam', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
];

export default function CalendarPage() {
  const { tinge } = useTinge();
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 27)); // Default to Sep 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-09-29');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Assignments' | 'Exams' | 'Holidays'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TODOS_STORAGE_KEY);
      if (saved) {
        setTodos(JSON.parse(saved));
      }
    } catch {}
    setMounted(true);
  }, []);

  const saveTodos = (updated) => {
    setTodos(updated);
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const toggleTodo = (id) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTodos(updated);
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Build grid cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ dayNum: day, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete 35 or 42 grid
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const m = month + 2 > 12 ? 1 : month + 2;
    const y = month + 2 > 12 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ dayNum: day, dateStr, isCurrentMonth: false });
  }

  // Helper to get items for a date
  const getItemsForDate = (dateStr) => {
    const dateTodos = todos.filter((t) => t.dueDate === dateStr && !t.archived);
    const dateEvents = ACADEMIC_EVENTS.filter((e) => e.date === dateStr);
    return { todos: dateTodos, events: dateEvents };
  };

  const selectedDayItems = getItemsForDate(selectedDateStr);

  const totalMonthAssignments = todos.filter((t) => {
    return t.dueDate && t.dueDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
  });

  const completedMonthAssignments = totalMonthAssignments.filter((t) => t.completed).length;

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-md"
              style={{ color: tinge.hex }}
            >
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Academic Calendar & Deadlines</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Interactive schedule linked directly to your assignment tracker, T1/T2 exam milestones, and holidays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/todos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-colors"
          >
            <span>Open Tasks Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            Jump to Today
          </button>
        </div>
      </div>

      {/* Month Progress & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Month Tasks</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{totalMonthAssignments.length}</span>
            <span className="text-xs text-zinc-500">assignments due</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Completion Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">
              {totalMonthAssignments.length > 0
                ? Math.round((completedMonthAssignments / totalMonthAssignments.length) * 100)
                : 100}
              %
            </span>
            <span className="text-xs text-zinc-500">
              ({completedMonthAssignments}/{totalMonthAssignments.length})
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Active View</span>
          <div className="text-lg font-bold text-white mt-1">
            {monthNames[month]} {year}
          </div>
        </div>
      </div>

      {/* Main Grid & Side Detail Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <h2 className="text-base font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const { todos: cellTodos, events: cellEvents } = getItemsForDate(cell.dateStr);
              const isSelected = selectedDateStr === cell.dateStr;
              const hasItems = cellTodos.length > 0 || cellEvents.length > 0;
              const hasHighPriority = cellTodos.some((t) => t.priority === 'High' && !t.completed);
              const hasPending = cellTodos.some((t) => !t.completed);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[72px] sm:min-h-[82px] p-2 rounded-xl text-left flex flex-col justify-between border transition-all ${
                    isSelected
                      ? 'border-violet-500 bg-violet-600/15 shadow-md shadow-violet-500/10'
                      : cell.isCurrentMonth
                      ? 'border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-800/50 hover:border-zinc-700'
                      : 'border-zinc-800/30 bg-zinc-950/10 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-white'
                          : cell.isCurrentMonth
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {cellEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Academic Event" />
                    )}
                  </div>

                  {/* Indicators / Chips */}
                  <div className="w-full space-y-1 mt-1">
                    {cellTodos.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[9px] truncate px-1 py-0.5 rounded font-medium ${
                          t.completed
                            ? 'bg-zinc-800/80 text-zinc-500 line-through'
                            : t.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {t.subjectName || t.title}
                      </div>
                    ))}
                    {cellTodos.length > 1 && (
                      <span className="text-[9px] text-zinc-500 font-medium">
                        +{cellTodos.length - 1} more
                      </span>
                    )}
                    {cellEvents.slice(0, 1).map((e, eIdx) => (
                      <div
                        key={eIdx}
                        className="text-[9px] truncate px-1 py-0.5 rounded font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Drawer (1 Col) */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Selected Day</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {new Date(selectedDateStr).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {selectedDayItems.todos.length} Tasks
            </span>
          </div>

          {/* Academic Events List for Selected Day */}
          {selectedDayItems.events.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Institute Calendar Notice
              </span>
              {selectedDayItems.events.map((evt, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs font-medium space-y-0.5 ${evt.color}`}
                >
                  <div className="font-bold">{evt.title}</div>
                  <div className="text-[10px] opacity-80">{evt.type} Milestone</div>
                </div>
              ))}
            </div>
          )}

          {/* Linked Assignments & Deadlines */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Assignments Due on this Date
            </span>

            {selectedDayItems.todos.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-zinc-950/30 border border-zinc-800/40 text-xs text-zinc-500">
                No assignment submissions due on this date.
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayItems.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="mt-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <p
                          className={`font-semibold ${
                            todo.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                          }`}
                        >
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {todo.subjectName}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              todo.priority === 'High'
                                ? 'text-rose-400'
                                : todo.priority === 'Med'
                                ? 'text-amber-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            {todo.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick link to Todos page */}
          <div className="pt-2">
            <Link
              href="/todos"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-all hover:border-zinc-600"
            >
              <span>Manage All Assignments in To-Dos Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

