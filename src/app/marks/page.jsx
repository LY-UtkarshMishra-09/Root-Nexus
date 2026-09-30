'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_MARKS } from '@/data/mockData';
import { useTinge } from '@/context/TingeContext';
import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart3,
  Percent,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STORAGE_KEY = 'rootnexus_marks_v1';

// Calculate Letter Grade and Grade Points on JIIT 10-point scale
function calculateGrade(percentage) {
  if (percentage >= 90) return { grade: 'A+', points: 10, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (percentage >= 80) return { grade: 'A', points: 9, color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (percentage >= 70) return { grade: 'B+', points: 8, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' };
  if (percentage >= 60) return { grade: 'B', points: 7, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' };
  if (percentage >= 50) return { grade: 'C+', points: 6, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  if (percentage >= 40) return { grade: 'C', points: 5, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
  if (percentage >= 35) return { grade: 'D', points: 4, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  return { grade: 'F', points: 0, color: 'text-red-500', bg: 'bg-red-500/20 border-red-500/40' };
}

export default function MarksPage() {
  const { tinge } = useTinge();
  const [mounted, setMounted] = useState(false);
  const [marksData, setMarksData] = useState(INITIAL_MARKS || []);
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All' | 'Theory' | 'Labs'
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [editingComponent, setEditingComponent] = useState(null); // { subjectId, compIndex }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMarksData(parsed);
        }
      }
    } catch {}
    setMounted(true);
  }, []);

  const saveMarks = (newData) => {
    setMarksData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {}
  };

  const handleReset = () => {
    if (confirm('Reset all marks and assessment scores back to academic initial seeds?')) {
      saveMarks(INITIAL_MARKS || []);
    }
  };

  const handleUpdateScore = (subjectId, compIndex, newScore) => {
    const parsed = parseFloat(newScore);
    if (isNaN(parsed) || parsed < 0) return;

    const updated = (marksData || []).map((sub) => {
      if (sub.id !== subjectId) return sub;
      const newComps = [...sub.components];
      const max = newComps[compIndex].maxMarks;
      newComps[compIndex] = {
        ...newComps[compIndex],
        scoredMarks: Math.min(parsed, max),
      };
      return { ...sub, components: newComps };
    });

    saveMarks(updated);
    setEditingComponent(null);
  };

  // Calculations across courses
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let totalMarksScored = 0;
  let totalMaxMarks = 0;

  const currentMarks = marksData || [];

  const subjectStats = currentMarks.map((sub) => {
    const components = sub.components || [];
    const subMax = components.reduce((sum, c) => sum + (c.maxMarks || 0), 0);
    const subScored = components.reduce((sum, c) => sum + (c.scoredMarks || 0), 0);
    const percentage = subMax > 0 ? (subScored / subMax) * 100 : 0;
    const gradeObj = calculateGrade(percentage);

    totalWeightedPoints += gradeObj.points * (sub.credits || 1);
    totalCredits += sub.credits || 1;
    totalMarksScored += subScored;
    totalMaxMarks += subMax;

    return {
      ...sub,
      totalMax: subMax,
      totalScored: subScored,
      percentage,
      grade: gradeObj,
    };
  });

  const estimatedSGPA = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';
  const overallPercentage = totalMaxMarks > 0 ? ((totalMarksScored / totalMaxMarks) * 100).toFixed(1) : '0';

  // Find best and lowest performing subjects
  const sortedSubjects = [...subjectStats].sort((a, b) => b.percentage - a.percentage);
  const bestSubject = sortedSubjects[0] || null;
  const lowestSubject = sortedSubjects[sortedSubjects.length - 1] || null;

  const filteredSubjects = subjectStats.filter((sub) => {
    if (selectedFilter === 'Theory') return !sub.shortName?.toLowerCase().includes('lab') && !sub.shortName?.toLowerCase().includes('workshop');
    if (selectedFilter === 'Labs') return sub.shortName?.toLowerCase().includes('lab') || sub.shortName?.toLowerCase().includes('workshop');
    return true;
  });

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
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Marks & Academic CGPA Portal</h1>
          </div>
          <p className="text-xs text-zinc-400">
            JIIT Sector-128 1st-Year CSE evaluation scheme (T1, T2, T3 End-Sem & Teacher Assessments).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Initial Marks
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated SGPA */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Estimated SGPA</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{estimatedSGPA}</span>
            <span className="text-xs text-zinc-500">/ 10.00</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            First Class with Distinction
          </p>
        </div>

        {/* Total Aggregate */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Overall Aggregate</span>
            <Percent className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{overallPercentage}%</span>
            <span className="text-xs text-zinc-500">
              ({totalMarksScored.toFixed(1)} / {totalMaxMarks})
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">Total {totalCredits} Credits Registered</p>
        </div>

        {/* Best Performance */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Top Course</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">{bestSubject?.shortName || 'N/A'}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-emerald-400">
              {bestSubject ? `${bestSubject.percentage.toFixed(1)}%` : '0%'}
            </span>
            {bestSubject && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${bestSubject.grade.bg} ${bestSubject.grade.color}`}>
                Grade {bestSubject.grade.grade}
              </span>
            )}
          </div>
        </div>

        {/* Focus Needed */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Needs Focus</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">{lowestSubject?.shortName || 'N/A'}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-amber-400">
              {lowestSubject ? `${lowestSubject.percentage.toFixed(1)}%` : '0%'}
            </span>
            {lowestSubject && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${lowestSubject.grade.bg} ${lowestSubject.grade.color}`}>
                Grade {lowestSubject.grade.grade}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          {['All', 'Theory', 'Labs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedFilter === tab
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {tab === 'All' ? 'All Subjects' : tab === 'Theory' ? 'Theory Courses' : 'Labs & Practicals'}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">{filteredSubjects.length} courses</span>
      </div>

      {/* Course Marks Cards */}
      <div className="space-y-4">
        {filteredSubjects.map((sub) => {
          const isExpanded = expandedSubject === sub.id;

          return (
            <div
              key={sub.id}
              className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all"
            >
              {/* Card Header Row */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                      {sub.subjectCode}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-300">
                      {sub.credits} Credits
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${sub.grade.bg} ${sub.grade.color}`}>
                      Grade {sub.grade.grade} ({sub.grade.points} pts)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{sub.subjectName}</h3>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  {/* Score & Progress */}
                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-xl font-bold text-white">{sub.totalScored.toFixed(1)}</span>
                      <span className="text-xs text-zinc-500">/ {sub.totalMax}</span>
                      <span className="text-sm font-semibold text-emerald-400 ml-1">
                        ({sub.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-36 h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(sub.percentage, 100)}%`,
                          backgroundColor: tinge.hex,
                        }}
                      />
                    </div>
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                    className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-colors"
                    title={isExpanded ? 'Collapse breakdown' : 'Expand evaluation breakdown'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Detailed Components Table / List (When Expanded) */}
              {isExpanded && (
                <div className="border-t border-zinc-800/70 bg-zinc-950/40 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium pb-2 border-b border-zinc-800/40">
                    <span>Evaluation Component</span>
                    <div className="flex items-center gap-8">
                      <span>Max</span>
                      <span>Scored</span>
                      <span className="w-16 text-right">Action</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sub.components?.map((comp, idx) => {
                      const isEditing =
                        editingComponent?.subjectId === sub.id && editingComponent?.compIndex === idx;

                      return (
                        <div
                          key={comp.name}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/60 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                comp.type === 'Test'
                                  ? 'bg-amber-400'
                                  : comp.type === 'EndSem'
                                  ? 'bg-rose-400'
                                  : 'bg-sky-400'
                              }`}
                            />
                            <div>
                              <span className="font-semibold text-zinc-200">{comp.name}</span>
                              <span className="ml-2 text-[10px] text-zinc-500 uppercase">({comp.type})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <span className="text-zinc-400 font-mono">{comp.maxMarks}</span>

                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max={comp.maxMarks}
                                  defaultValue={comp.scoredMarks}
                                  id={`edit-input-${sub.id}-${idx}`}
                                  className="w-16 px-2 py-1 rounded bg-zinc-950 border border-violet-500 text-white font-mono text-xs focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const input = document.getElementById(`edit-input-${sub.id}-${idx}`);
                                    if (input) handleUpdateScore(sub.id, idx, input.value);
                                  }}
                                  className="px-2 py-1 rounded bg-violet-600 text-white font-medium hover:bg-violet-500"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono font-bold text-white w-12 text-right">
                                {comp.scoredMarks.toFixed(1)}
                              </span>
                            )}

                            <div className="w-16 text-right">
                              {!isEditing && (
                                <button
                                  onClick={() => setEditingComponent({ subjectId: sub.id, compIndex: idx })}
                                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                                  title="Edit score"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

