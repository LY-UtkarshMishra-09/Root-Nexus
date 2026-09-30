'use client';

import React, { useState, useEffect } from 'react';
import { NOTES_RESOURCES, INITIAL_QUICK_NOTE } from '@/data/mockData';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  BookOpen,
  Edit3,
  Eye,
  CheckCircle2,
  FolderArchive,
  Save,
  Bold,
  Heading,
  List,
  Code,
  Tag,
  Sparkles,
} from 'lucide-react';

const SUBJECT_TABS = ['All', 'SDF-1', 'Maths-1', 'Physics', 'Soft Skills'];

export default function NotesPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [savedBadge, setSavedBadge] = useState('Saved');
  const [downloadSuccessId, setDownloadSuccessId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rootnexus_markdown_notes_v1');
      if (saved) {
        setMarkdownContent(saved);
      } else {
        setMarkdownContent(INITIAL_QUICK_NOTE);
      }
    } catch {}
    setMounted(true);
  }, []);

  const handleContentChange = (text) => {
    setMarkdownContent(text);
    setSavedBadge('Saving...');
    try {
      localStorage.setItem('rootnexus_markdown_notes_v1', text);
      setTimeout(() => setSavedBadge('Saved'), 400);
    } catch {
      setSavedBadge('Error');
    }
  };

  const handleDownloadResource = (id) => {
    setDownloadSuccessId(id);
    setTimeout(() => setDownloadSuccessId(null), 2500);
  };

  const insertHelper = (syntax) => {
    let addition = '';
    switch (syntax) {
      case 'bold':
        addition = ' **bold text** ';
        break;
      case 'heading':
        addition = '\n## Heading 2\n';
        break;
      case 'list':
        addition = '\n- Item 1\n- Item 2\n';
        break;
      case 'code':
        addition = '\n```c\n#include <stdio.h>\nint main() {\n  return 0;\n}\n```\n';
        break;
    }
    handleContentChange(markdownContent + addition);
  };

  // Filtered resources
  const filteredResources = NOTES_RESOURCES.filter((res) => {
    const matchesSub = selectedSubject === 'All' || res.subject === selectedSubject;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSub && matchesSearch;
  });

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
      {/* Top Header & Subject Tabs */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 hover:border-zinc-700/60 transition-all space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Academic Vault
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                JIIT Sec-128
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Academic Vault & Notes
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Subject repository, lab manuals, past year papers (PYQs), and persistent markdown revision pad.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PYQs, manuals, notes..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Subject Category Tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-zinc-800 overflow-x-auto">
          {SUBJECT_TABS.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedSubject === sub
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Direct Resource Cards (7 Cols) + Embedded Markdown Scratchpad (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Curated Resource Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Curated Resources & PYQs ({filteredResources.length})
            </span>
            <span className="text-[11px] text-zinc-500">Official syllabus repository</span>
          </div>

          {filteredResources.length === 0 ? (
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-10 text-center text-zinc-400">
              <FolderArchive className="w-8 h-8 mx-auto mb-2 opacity-40 text-violet-400" />
              <p className="text-sm font-semibold">No resource files found for this tab.</p>
              <p className="text-xs mt-1">Select &quot;All&quot; to view the complete vault.</p>
            </div>
          ) : (
            filteredResources.map((res) => {
              const isDownloaded = downloadSuccessId === res.id;

              return (
                <div
                  key={res.id}
                  className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-700/60 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {res.category}
                      </span>
                      <span className="font-mono text-xs text-zinc-500">
                        {res.subjectCode}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {res.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>Format: <strong className="text-zinc-300">{res.format}</strong></span>
                      <span>•</span>
                      <span>Size: {res.size}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadResource(res.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                      isDownloaded
                        ? 'bg-emerald-500 text-zinc-950 font-bold'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-700'
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
              );
            })
          )}
        </div>

        {/* Right Side: Embedded Clean Markdown Scratchpad */}
        <div className="lg:col-span-5 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-all space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Markdown Scratchpad
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                ● {savedBadge}
              </span>
            </div>

            {/* Markdown Syntax Toolbar */}
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-zinc-950 border border-zinc-800 mt-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertHelper('bold')}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertHelper('heading')}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Heading"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertHelper('list')}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Bulleted List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertHelper('code')}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Edit / Preview Toggle */}
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  previewMode
                    ? 'bg-violet-600 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
              </button>
            </div>

            {/* Content Field */}
            {previewMode ? (
              <div className="w-full min-h-[220px] max-h-80 overflow-y-auto p-3 mt-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {markdownContent || <span className="text-zinc-500">Nothing to preview.</span>}
              </div>
            ) : (
              <textarea
                rows={9}
                value={markdownContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write revision notes, key formulas, viva cheat sheets..."
                className="w-full mt-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
              />
            )}
          </div>

          <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
            Notes are saved instantly to your browser storage and accessible offline.
          </div>
        </div>
      </div>
    </div>
  );
}
