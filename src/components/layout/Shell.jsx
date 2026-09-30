'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TingeProvider, useTinge } from '@/context/TingeContext';
import TingeChanger from '@/components/TingeChanger';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  GraduationCap,
  Percent,
  UtensilsCrossed,
  FileText,
  CheckSquare,
  Settings2,
  Clock,
  Zap,
  User,
} from 'lucide-react';

const DOCK_ITEMS = [
  { href: '/', label: 'Daily Briefing', icon: LayoutDashboard },
  { href: '/schedule', label: 'Full Timetable', icon: Clock },
  { href: '/calendar', label: 'Academic Calendar', icon: CalendarDays },
  { href: '/attendance', label: 'Attendance Tracker', icon: Percent },
  { href: '/marks', label: 'Marks & CGPA', icon: GraduationCap },
  { href: '/food', label: 'Mess & Cafe', icon: UtensilsCrossed },
  { href: '/notes', label: 'Notes Vault', icon: FileText },
  { href: '/todos', label: 'To-Dos & Deadlines', icon: CheckSquare },
  { href: '/integrations', label: 'Notion MCP Bridge', icon: Settings2 },
  { href: '/account', label: 'Student Profile', icon: User },
];

function ShellInner({ children }) {
  const pathname = usePathname();
  const { tinge } = useTinge();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200">
      {/* Background Atmosphere (Dynamic Ambient Tinge Blobs) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-500">
        <div
          className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b ${tinge.blobs.top} rounded-full blur-[140px] transition-all duration-700`}
        />
        <div
          className={`absolute top-1/2 -left-40 w-[450px] h-[450px] ${tinge.blobs.left} rounded-full blur-[160px] transition-all duration-700`}
        />
        <div
          className={`absolute bottom-10 right-0 w-[500px] h-[400px] ${tinge.blobs.right} rounded-full blur-[160px] transition-all duration-700`}
        />
      </div>

      {/* Top Minimal Status Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#09090b]/80 border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand & Sector Status Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-xl p-[1px] shadow-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${tinge.hex}, #4f46e5)`,
                  boxShadow: `0 4px 14px ${tinge.hex}33`,
                }}
              >
                <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                  <Zap className="w-3.5 h-3.5 transition-transform group-hover:scale-110" style={{ color: tinge.hex }} />
                </div>
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                Root
                <span
                  className={`text-transparent bg-clip-text bg-gradient-to-r ${tinge.gradient} transition-all`}
                >
                  Nexus
                </span>
              </span>
            </Link>

            {/* Subtle Pulsing Status Badge: ● Sec-128 • 1st Year CSE */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.12)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Sec-128 • 1st Year CSE</span>
              <span className="sm:hidden">Sec-128</span>
            </div>
          </div>

          {/* Right Controls: Tinge Changer + Digital Clock with Seconds & Date */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-right">
            {/* Tinge Color Changer Component */}
            <TingeChanger />

            {/* Live Clock */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-200 bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" style={{ color: tinge.hex }} />
              <span>{mounted ? currentTime || '12:00:00 PM' : '--:--:--'}</span>
            </div>

            <span className="text-xs text-zinc-400 hidden lg:inline-block font-medium">
              {mounted ? currentDate || 'Today' : ''}
            </span>

            {/* Student Account Quick Profile Button */}
            <Link
              href="/account"
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all ${
                pathname === '/account'
                  ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                  : 'bg-zinc-900/70 hover:bg-zinc-800 border-zinc-800/90 text-zinc-300'
              }`}
              title="Student Account & Profile"
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${tinge.hex}, #6366f1)` }}
              >
                UM
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Workspace (With Safe pb-28 Padding) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-5 pb-28 relative z-10">
        {children}
      </main>

      {/* Floating Dynamic Bottom Taskbar Tray (Dock) across ALL screen sizes */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
        aria-label="Bottom Navigation Dock"
      >
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/90 shadow-2xl shadow-black/90 rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2.5">
          {DOCK_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <div
                key={item.href}
                className="relative flex flex-col items-center group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Subtle Tooltip on Hover */}
                <div
                  className={`absolute -top-9 px-2.5 py-1 rounded-lg bg-zinc-950/95 border border-zinc-800 text-[11px] font-semibold text-zinc-200 whitespace-nowrap shadow-xl pointer-events-none transition-all duration-150 ${
                    hoveredIdx === idx
                      ? 'opacity-100 -translate-y-1 scale-100'
                      : 'opacity-0 translate-y-1 scale-95'
                  }`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
                </div>

                <Link
                  href={item.href}
                  className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center relative ${
                    isActive
                      ? `${tinge.dockActive} scale-105`
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 hover:scale-110 active:scale-95'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 sm:w-5 sm:h-5 transition-transform" />

                  {/* Active small dot */}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tinge.hex }}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Shell({ children }) {
  return (
    <TingeProvider>
      <ShellInner>{children}</ShellInner>
    </TingeProvider>
  );
}
