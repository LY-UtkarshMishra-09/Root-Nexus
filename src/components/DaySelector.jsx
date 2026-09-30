'use client';

import React, { useMemo } from 'react';
import { useTinge } from '@/context/TingeContext';
import { CalendarDays, Sparkles } from 'lucide-react';

const WEEKDAY_CONFIG = [
  { name: 'Monday', short: 'MON', index: 0 },
  { name: 'Tuesday', short: 'TUE', index: 1 },
  { name: 'Wednesday', short: 'WED', index: 2 },
  { name: 'Thursday', short: 'THU', index: 3 },
  { name: 'Friday', short: 'FRI', index: 4 },
  { name: 'Saturday', short: 'SAT', index: 5 },
];

/**
 * Reusable Day & Date Selector Strip (JIIT Pulse Style with Dynamic Tinge)
 */
export default function DaySelector({
  selectedDay,
  onSelectDay,
  includeSaturday = true,
  hasActivityMap = {},
  className = '',
}) {
  const { tinge } = useTinge();

  // Compute dates of current week (Monday through Saturday)
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    // Calculate difference to current week's Monday
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const activeList = includeSaturday ? WEEKDAY_CONFIG : WEEKDAY_CONFIG.slice(0, 5);

    return activeList.map((day) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + day.index);

      const isToday =
        now.getFullYear() === d.getFullYear() &&
        now.getMonth() === d.getMonth() &&
        now.getDate() === d.getDate();

      return {
        ...day,
        dateNumber: d.getDate(),
        monthShort: d.toLocaleString('en-US', { month: 'short' }),
        fullDateString: d.toDateString(),
        isToday,
        hasActivity: hasActivityMap[day.name] ?? (day.index < 5), // default true for Mon-Fri classes
      };
    });
  }, [includeSaturday, hasActivityMap]);

  return (
    <div className={`w-full ${className}`}>
      {/* Scrollable / Flex Capsule Strip */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none no-scrollbar">
        {weekDays.map((day) => {
          const isSelected = selectedDay === day.name;

          return (
            <button
              key={day.name}
              type="button"
              onClick={() => onSelectDay(day.name)}
              style={
                isSelected
                  ? {
                      backgroundColor: tinge.hex,
                      boxShadow: `0 10px 25px -5px ${tinge.hex}66`,
                      borderColor: `${tinge.hex}99`,
                    }
                  : undefined
              }
              className={`group relative flex-1 min-w-[70px] sm:min-w-[84px] py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ease-out select-none cursor-pointer border ${
                isSelected
                  ? 'text-white scale-105 z-10'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800/60 hover:text-zinc-200 hover:border-zinc-700/80'
              }`}
              aria-label={`Select ${day.name} ${day.dateNumber}`}
            >
              {/* Today Micro-Badge */}
              {day.isToday && (
                <span
                  className={`absolute -top-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm transition-colors ${
                    isSelected
                      ? 'bg-white text-zinc-950 shadow-black/40'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  Today
                </span>
              )}

              {/* Short Day Name */}
              <span
                className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase ${
                  isSelected ? 'text-white/90 font-extrabold' : 'text-zinc-400 group-hover:text-zinc-300'
                }`}
              >
                {day.short}
              </span>

              {/* Date Number */}
              <span
                className={`text-lg sm:text-xl font-black font-mono leading-tight my-0.5 ${
                  isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'
                }`}
              >
                {day.dateNumber}
              </span>

              {/* Dot Indicator for Activity / Classes / Assignments */}
              <div className="flex items-center gap-1 mt-0.5">
                {day.hasActivity ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isSelected
                        ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                        : 'bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
                    }`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
