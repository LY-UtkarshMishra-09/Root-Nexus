'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { TimetableSlot, SlotType } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Coffee,
  Code,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface ScheduleTimetableTabProps {
  timetable: TimetableSlot[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const ScheduleTimetableTab: React.FC<ScheduleTimetableTabProps> = ({ timetable }) => {
  const { accentStyles, theme } = useTheme();
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('Monday');
  const [filterType, setFilterType] = useState<string>('All');

  // Filter slots for the selected day
  const daySlots = timetable.filter((slot) => slot.day === selectedDay);

  const filteredSlots = daySlots.filter((slot) => {
    if (filterType === 'All') return true;
    return slot.type === filterType;
  });

  // Calculate day summary metrics
  const lecturesCount = daySlots.filter((s) => s.type === 'Lecture').length;
  const labsCount = daySlots.filter((s) => s.type === 'Lab').length;
  const tutsCount = daySlots.filter((s) => s.type === 'Tutorial').length;

  const getSlotTypeBadge = (type: SlotType) => {
    switch (type) {
      case 'Lecture':
        return {
          label: 'Lecture',
          color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          dotColor: 'bg-blue-500',
        };
      case 'Lab':
        return {
          label: 'Lab Session (2h)',
          color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dotColor: 'bg-emerald-500',
        };
      case 'Tutorial':
        return {
          label: 'Tutorial / Sheet',
          color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
          dotColor: 'bg-violet-500',
        };
      case 'Break':
        return {
          label: 'Campus Break',
          color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dotColor: 'bg-amber-500',
        };
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Day Selector */}
      <div className="liquid-card p-5 sm:p-6 relative overflow-hidden">
        <div className="specular-glow" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Official JIIT Timetable
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Batch B3 CSE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Schedule & Academic Slots
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-0.5">
              Daily lecture rooms, computer labs in Abb-III, and tutorial schedules.
            </p>
          </div>

          {/* Quick Day Stats */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/80 p-2 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
              {lecturesCount} Lectures
            </span>
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              {labsCount} Lab
            </span>
            <span className="px-2 py-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold">
              {tutsCount} Tut
            </span>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center relative overflow-hidden ${
                  isSelected
                    ? `${accentStyles.primaryBg} text-white shadow-md scale-[1.02]`
                    : 'liquid-card text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{day.substring(0, 3)}</span>
                <span className="hidden sm:inline">{day.substring(3)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {['All', 'Lecture', 'Lab', 'Tutorial'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterType === t
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
                  : 'liquid-card text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t === 'All' ? 'All Slots' : `${t}s`}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-zinc-400">
          Selected: <strong className="text-slate-800 dark:text-zinc-200">{selectedDay}</strong> ({filteredSlots.length} sessions)
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-3 relative">
        {filteredSlots.length === 0 ? (
          <div className="liquid-card p-12 text-center text-slate-500 dark:text-zinc-400">
            <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No classes scheduled on this day or filter!</p>
            <p className="text-xs mt-1">Enjoy your free time or prepare for upcoming T1/T2 exams.</p>
          </div>
        ) : (
          filteredSlots.map((slot, index) => {
            const badge = getSlotTypeBadge(slot.type);
            const isBreak = slot.type === 'Break';

            if (isBreak) {
              return (
                <div
                  key={slot.id}
                  className="liquid-card p-4 border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                        {slot.subjectName}
                      </h4>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                        Location: {slot.room} • Annapurna Mess & Sub-station Cafe
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 px-3 py-1 rounded-lg bg-amber-500/10">
                    {slot.startTime} &ndash; {slot.endTime}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className="liquid-card p-4 sm:p-5 relative group overflow-hidden transition-all hover:scale-[1.005]"
              >
                <div className="specular-glow" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Time & Subject info */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Time Slot Box */}
                    <div className="shrink-0 text-center min-w-[75px] p-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono">
                        {slot.startTime}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                        {slot.endTime}
                      </div>
                    </div>

                    {/* Subject Name & Faculty */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                          {slot.subjectCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {slot.batch && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                            {slot.batch}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {slot.subjectName}
                      </h4>

                      {slot.faculty && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          <span>{slot.faculty}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Room indicator */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{slot.room}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Period #{index + 1}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
