'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_TODOS } from '@/data/mockData';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  RotateCcw,
  Clock,
  Sparkles,
  Archive,
  ArchiveRestore,
} from 'lucide-react';

const STORAGE_KEY = 'rootnexus_todos_v1';

export default function TodosPage() {
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'Completed' | 'Archived'
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Task Input fields
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('24B11CS111');
  const [subjectName, setSubjectName] = useState('SDF-1');
  const [priority, setPriority] = useState('Med');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTodos(JSON.parse(saved));
      }
    } catch {}
    setMounted(true);
  }, []);

  const saveTodos = (updated) => {
    setTodos(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: `todo-${Date.now()}`,
      title: title.trim(),
      subjectCode,
      subjectName,
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      archived: false,
    };

    saveTodos([newTask, ...todos]);
    setTitle('');
  };

  const handleToggleTask = (id) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTodos(updated);
  };

  const handleToggleArchive = (id) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, archived: !t.archived } : t));
    saveTodos(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  const handleResetToSeeds = () => {
    if (confirm('Reset tasks back to initial academic list?')) {
      saveTodos(INITIAL_TODOS);
    }
  };

  // Filter tasks based on activeTab and searchQuery
  const filteredTodos = todos.filter((t) => {
    let matchesTab = true;
    if (activeTab === 'All') {
      matchesTab = !t.archived;
    } else if (activeTab === 'Pending') {
      matchesTab = !t.archived && !t.completed;
    } else if (activeTab === 'Completed') {
      matchesTab = !t.archived && t.completed;
    } else if (activeTab === 'Archived') {
      matchesTab = !!t.archived;
    }

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const pendingCount = todos.filter((t) => !t.archived && !t.completed).length;
  const completedCount = todos.filter((t) => !t.archived && t.completed).length;
  const archivedCount = todos.filter((t) => !!t.archived).length;
  const allActiveCount = todos.filter((t) => !t.archived).length;
  const highPriorityCount = todos.filter((t) => !t.archived && !t.completed && t.priority === 'High').length;

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-28 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
        <div className="h-64 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Metrics */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 hover:border-zinc-700/60 transition-all space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Task & Deadline Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Synced with LocalStorage
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Task & Deadline Tracker
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Keep on top of assignments, practical records, and T1/T2 revision milestones.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetToSeeds}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors self-start md:self-auto"
            title="Reset to default tasks"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stat Matrix */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Pending Tasks
            </span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {pendingCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Urgent High Priority
            </span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
              {highPriorityCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Completed Tasks
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {completedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Task Input Form */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-all space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-violet-400" />
          <span>Quick Task Input</span>
        </h3>

        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              required
              placeholder="e.g., Complete SDF-1 Lab Sheet 5 on Pointers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deadline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Subject Selector */}
            <select
              value={subjectCode}
              onChange={(e) => {
                setSubjectCode(e.target.value);
                const map = {
                  '24B11CS111': 'SDF-1',
                  '24B11MA111': 'Maths-1',
                  '24B11PH111': 'Physics',
                  '24B11ME111': 'Workshop',
                  '24B11HS111': 'Soft Skills',
                  '24B17CS171': 'SDF-1 Lab',
                  '24B17PH171': 'Physics Lab',
                  'GEN': 'General Campus',
                };
                setSubjectName(map[e.target.value] || e.target.value);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none"
            >
              <option value="24B11CS111">24B11CS111 • SDF-1</option>
              <option value="24B11MA111">24B11MA111 • Maths-1</option>
              <option value="24B11PH111">24B11PH111 • Physics</option>
              <option value="24B11ME111">24B11ME111 • Workshop</option>
              <option value="24B11HS111">24B11HS111 • Soft Skills</option>
              <option value="24B17CS171">24B17CS171 • SDF-1 Lab</option>
              <option value="24B17PH171">24B17PH171 • Physics Lab</option>
              <option value="GEN">General • Campus</option>
            </select>

            {/* Priority Selector */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {['High', 'Med', 'Low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                    priority === p
                      ? p === 'High'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : p === 'Med'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Due Date */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs: All, Pending, Completed, Archived */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
          {[
            { id: 'All', label: 'All Tasks', count: allActiveCount },
            { id: 'Pending', label: 'Pending', count: pendingCount },
            { id: 'Completed', label: 'Completed', count: completedCount },
            { id: 'Archived', label: 'Archived', count: archivedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task title or code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-10 text-center text-zinc-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
            <p className="text-sm font-semibold">No tasks found matching this tab.</p>
            <p className="text-xs mt-1">Add a new deadline above to stay ahead of submissions.</p>
          </div>
        ) : (
          filteredTodos.map((task) => (
            <div
              key={task.id}
              className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                  title={task.completed ? 'Mark pending' : 'Mark completed'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0 space-y-1">
                  <h4
                    className={`text-sm font-bold leading-snug truncate ${
                      task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {task.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono text-violet-400 font-semibold">
                      {task.subjectCode}
                    </span>
                    <span>•</span>
                    <span>{task.subjectName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      Due: {task.dueDate}
                    </span>
                    {task.archived && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Archived
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    task.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : task.priority === 'Med'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {task.priority} Priority
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleArchive(task.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                  title={task.archived ? 'Restore task' : 'Archive task'}
                >
                  {task.archived ? (
                    <ArchiveRestore className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
