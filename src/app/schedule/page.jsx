'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TIMETABLE_DATA } from '@/data/mockData';
import DaySelector from '@/components/DaySelector';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Coffee,
  Filter,
  Search,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SchedulePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'grid'
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDayName, setCurrentDayName] = useState('');

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[now.getDay()];
    setCurrentDayName(dayName);

    // If weekday, set default selectedDay to today
    if (DAYS.includes(dayName)) {
      setSelectedDay(dayName);
    }

    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setCurrentTimeStr(`${hh}:${mm}`);

    const interval = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter slots for selected day
  const daySlots = useMemo(() => {
    return TIMETABLE_DATA.filter((s) => s.day === selectedDay);
  }, [selectedDay]);

  const filteredSlots = useMemo(() => {
    return daySlots.filter((slot) => {
      const matchesType = filterType === 'All' || slot.type === filterType;
      const matchesSearch =
        slot.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (slot.faculty && slot.faculty.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [daySlots, filterType, searchQuery]);

  // Activity map for DaySelector
  const activityMap = useMemo(() => {
    const map = {};
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach((d) => {
      map[d] = TIMETABLE_DATA.some((s) => s.day === d && s.type !== 'Break');
    });
    return map;
  }, []);

  // Summary counts for selected day
  const lecturesCount = daySlots.filter((s) => s.type === 'Lecture').length;
  const labsCount = daySlots.filter((s) => s.type === 'Lab').length;
  const tutsCount = daySlots.filter((s) => s.type === 'Tutorial').length;

  const isCurrentLiveSlot = (slot) => {
    if (!mounted) return false;
    if (currentDayName !== selectedDay) return false;
    if (slot.type === 'Break') return false;
    return currentTimeStr >= slot.startTime && currentTimeStr <= slot.endTime;
  };

  const getSlotTypeBadge = (type) => {
    switch (type) {
      case 'Lecture':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'Lab':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Tutorial':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Break':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-28 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
        <div className="h-64 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Banner & Timetable Header */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 hover:border-zinc-700/60 transition-all space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Official Sector-128 Timetable
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Batch 128-B3 CSE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Class Timetable & Venues
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Lecture Theatres (LT-1), Computer Labs, and Tutorial sessions schedule.
            </p>
          </div>

          {/* View Mode Toggle: [ Day View | 5-Day Grid Overview ] */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>5-Day Grid Overview</span>
            </button>
          </div>
        </div>

        {/* DaySelector Strip (JIIT Pulse Style) */}
        {viewMode === 'day' && (
          <div className="pt-1 border-t border-zinc-800/80">
            <DaySelector
              selectedDay={selectedDay}
              onSelectDay={(day) => setSelectedDay(day)}
              includeSaturday={true}
              hasActivityMap={activityMap}
            />
          </div>
        )}

        {/* Filter and Search Controls (Active in Day View) */}
        {viewMode === 'day' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-zinc-800/60">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {['All', 'Lecture', 'Lab', 'Tutorial'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-white text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {t === 'All' ? 'All Sessions' : `${t}s`}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, room (LT-1), faculty..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SINGLE DAY SCHEDULE CARDS */}
      {/* ========================================================================= */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          {filteredSlots.length === 0 ? (
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-400">
              <Coffee className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="text-sm font-semibold">No classes scheduled for {selectedDay} under this filter!</p>
              <p className="text-xs mt-1">Enjoy your campus break or check other days.</p>
            </div>
          ) : (
            filteredSlots.map((slot, index) => {
              const isLive = isCurrentLiveSlot(slot);
              const isBreak = slot.type === 'Break';
              const badgeClass = getSlotTypeBadge(slot.type);

              if (isBreak) {
                return (
                  <div
                    key={slot.id}
                    className="bg-amber-500/5 border border-dashed border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-300">
                          {slot.subjectName}
                        </h4>
                        <p className="text-xs text-amber-400/80">
                          Venue: {slot.room} • Annapurna Mess & Sub-station Cafe
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-amber-400 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      {slot.startTime} &ndash; {slot.endTime}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={slot.id}
                  className={`bg-zinc-900/50 backdrop-blur-xl border rounded-2xl p-4 sm:p-5 transition-all relative overflow-hidden ${
                    isLive
                      ? 'border-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.2)] bg-sky-950/20'
                      : 'border-zinc-800/80 hover:border-zinc-700/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Slot time & Subject info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Time Slot box */}
                      <div className="shrink-0 text-center min-w-[80px] p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                        <div className="text-xs font-mono font-bold text-zinc-200">
                          {slot.startTime}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {slot.endTime}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-zinc-400">
                            {slot.subjectCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                            {slot.type}
                          </span>
                          {isLive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Live Now
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {slot.subjectName}
                        </h3>

                        {slot.faculty && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{slot.faculty}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Room indicator */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{slot.room}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Period #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COMPREHENSIVE 5-DAY WEEKLY GRID OVERVIEW MATRIX */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
            <span className="font-semibold text-zinc-300">
              Weekly Master Timetable Matrix • 6 Academic Days (Monday – Saturday)
            </span>
            <span className="text-[11px] font-mono text-violet-400">
              CSE Batch 128-B3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {DAYS.map((day) => {
              const slots = TIMETABLE_DATA.filter((s) => s.day === day && s.type !== 'Break');
              const isToday = currentDayName === day;

              return (
                <div
                  key={day}
                  className={`bg-zinc-900/50 backdrop-blur-xl border rounded-2xl p-3.5 space-y-3 flex flex-col ${
                    isToday
                      ? 'border-violet-500/50 ring-1 ring-violet-500/30'
                      : 'border-zinc-800/80'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="font-bold text-sm text-white">{day}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day Slots List */}
                  <div className="space-y-2 flex-1">
                    {slots.map((s) => {
                      const badgeClass = getSlotTypeBadge(s.type);
                      return (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-zinc-400">
                            <span>{s.startTime} - {s.endTime}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${badgeClass}`}>
                              {s.type}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-zinc-200 line-clamp-1">
                            {s.subjectName}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                            <span className="text-rose-400 font-medium flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {s.room}
                            </span>
                            {s.faculty && <span>{s.faculty}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
