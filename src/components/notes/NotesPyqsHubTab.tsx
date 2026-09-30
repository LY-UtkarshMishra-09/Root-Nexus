'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { NoteResource, QuickNote } from '@/types';
import { NOTES_RESOURCES, INITIAL_QUICK_NOTES } from '@/lib/mockData';
import {
  BookOpen,
  Download,
  ExternalLink,
  Search,
  FileText,
  BookmarkPlus,
  Trash2,
  Save,
  Tag,
  CheckCircle2,
  FolderArchive,
  Sparkles,
  Edit3,
} from 'lucide-react';

interface NotesPyqsHubTabProps {
  initialNotes?: NoteResource[];
}

export const NotesPyqsHubTab: React.FC<NotesPyqsHubTabProps> = ({
  initialNotes = NOTES_RESOURCES,
}) => {
  const { accentStyles, theme } = useTheme();

  // Search & Filters for Resources
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Scratchpad & Quick Notes State with LocalStorage Persistence
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(INITIAL_QUICK_NOTES);
  const [scratchpadText, setScratchpadText] = useState('');
  const [scratchpadTitle, setScratchpadTitle] = useState('');
  const [scratchpadTag, setScratchpadTag] = useState('Academic');
  const [saveStatus, setSaveStatus] = useState<string>('Saved to local storage');

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sectorsync_quicknotes');
      if (saved) {
        setQuickNotes(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, []);

  // Save notes helper
  const saveQuickNotes = (updated: QuickNote[]) => {
    setQuickNotes(updated);
    try {
      localStorage.setItem('sectorsync_quicknotes', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scratchpadTitle.trim() && !scratchpadText.trim()) return;

    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      title: scratchpadTitle.trim() || 'Untitled Quick Note',
      content: scratchpadText.trim(),
      updatedAt: 'Just now',
      tag: scratchpadTag,
    };

    const updated = [newNote, ...quickNotes];
    saveQuickNotes(updated);
    setScratchpadTitle('');
    setScratchpadText('');
    setSaveStatus('Note saved successfully!');
    setTimeout(() => setSaveStatus('Saved to local storage'), 2500);
  };

  const handleDeleteNote = (id: string) => {
    const updated = quickNotes.filter((n) => n.id !== id);
    saveQuickNotes(updated);
  };

  const handleDownload = (resId: string) => {
    setDownloadSuccessId(resId);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  // Filtered resources
  const filteredResources = initialNotes.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubject === 'all' || res.subjectCode === selectedSubject;

    const matchesCat =
      selectedCategory === 'all' || res.category === selectedCategory;

    return matchesSearch && matchesSubject && matchesCat;
  });

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="liquid-card p-5 sm:p-6 relative overflow-hidden">
        <div className="specular-glow" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Academic Knowledge Base
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                Verified Material
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Notes & PYQs Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-0.5">
              Subject handouts, T1/T2 past papers, lab manual codes, and personal scratchpad.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px] sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, formula sheets, PYQs..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800/80 flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: '15B11CI111', label: 'SDF-1' },
              { id: '15B11MA111', label: 'Maths-1' },
              { id: '15B11PH111', label: 'Physics-1' },
              { id: '15B11EC111', label: 'BEEE' },
              { id: '15B11HS111', label: 'English' },
              { id: '15B17CI171', label: 'SDF Lab' },
              { id: '15B17PH171', label: 'Physics Lab' },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedSubject === sub.id
                    ? `${accentStyles.primaryBg} text-white font-semibold shadow-sm`
                    : 'bg-white/60 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-700/60'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Resources (7 Cols) + Scratchpad Editor (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Resources List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Verified Study Material ({filteredResources.length})
            </span>

            {/* Category Pills */}
            <div className="flex items-center gap-1 text-[11px]">
              {['all', 'T1 Notes', 'T2 Notes', 'PYQ', 'Lab Sheet'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded-md font-medium capitalize ${
                    selectedCategory === cat
                      ? 'bg-slate-800 dark:bg-zinc-700 text-white'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All Types' : cat}
                </button>
              ))}
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div className="liquid-card p-10 text-center text-slate-500 dark:text-zinc-400">
              <FolderArchive className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No study resources found matching criteria.</p>
              <p className="text-xs mt-1">Try resetting the subject or search query.</p>
            </div>
          ) : (
            filteredResources.map((res) => {
              const isDownloaded = downloadSuccessId === res.id;

              return (
                <div
                  key={res.id}
                  className="liquid-card p-4 sm:p-4.5 relative group overflow-hidden transition-all hover:scale-[1.005]"
                >
                  <div className="specular-glow" />

                  <div className="flex items-start justify-between gap-3">
                    {/* Left details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                          {res.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                          {res.subjectCode}
                        </span>
                        {res.year && (
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-black/5 dark:bg-white/10 px-1.5 py-0.2 rounded">
                            {res.year}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {res.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                        <span>Format: <strong className="text-slate-700 dark:text-zinc-300">{res.format}</strong></span>
                        <span>•</span>
                        <span>Size: {res.size}</span>
                        <span>•</span>
                        <span>Contributed by: {res.contributor}</span>
                      </div>
                    </div>

                    {/* Right Download / External Link Button */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownload(res.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                          isDownloaded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Get File</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Scratchpad & Quick Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="liquid-card p-5 relative overflow-hidden">
            <div className="specular-glow" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Scratchpad
                </h3>
              </div>
              <span className="text-[11px] text-emerald-500 font-medium">
                {saveStatus}
              </span>
            </div>

            {/* Note Entry Form */}
            <form onSubmit={handleAddQuickNote} className="space-y-3">
              <input
                type="text"
                placeholder="Note title (e.g., Pointers formula, Exam date)"
                value={scratchpadTitle}
                onChange={(e) => setScratchpadTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />

              <textarea
                rows={4}
                placeholder="Type your lecture points, hostel reminders, or question links here..."
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono"
              />

              <div className="flex items-center justify-between pt-1">
                {/* Tag selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={scratchpadTag}
                    onChange={(e) => setScratchpadTag(e.target.value)}
                    className="text-xs bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-700 dark:text-zinc-300 focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Doubts">Doubts</option>
                    <option value="Personal">Personal</option>
                    <option value="Exam">T1/T2 Exam</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!scratchpadTitle && !scratchpadText}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-40 transition-all ${accentStyles.primaryBg}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* Persisted Notes List */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
              Saved Pinned Notes ({quickNotes.length})
            </span>

            {quickNotes.map((note) => (
              <div
                key={note.id}
                className="liquid-card p-3.5 relative group border-l-4 border-l-violet-500 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      {note.tag}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {note.title}
                    </h5>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-slate-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1.5 whitespace-pre-line font-mono text-[11px] leading-relaxed">
                  {note.content}
                </p>

                <div className="mt-2 text-[10px] text-slate-400 text-right">
                  {note.updatedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
