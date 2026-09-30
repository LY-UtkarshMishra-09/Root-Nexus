'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const TINGE_OPTIONS = [
  {
    id: 'violet',
    name: 'Violet Aurora',
    hex: '#8b5cf6',
    accentText: 'text-violet-400',
    accentBorder: 'border-violet-500/30',
    accentBg: 'bg-violet-600',
    badgeBg: 'bg-violet-500/10',
    badgeBorder: 'border-violet-500/20',
    badgeText: 'text-violet-400',
    shadowGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    dockActive: 'bg-violet-600/20 text-violet-400 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]',
    dockDot: 'bg-violet-400',
    gradient: 'from-violet-400 to-indigo-400',
    blobs: {
      top: 'from-violet-600/15 via-indigo-600/8 to-transparent',
      left: 'bg-violet-500/8',
      right: 'bg-indigo-500/8',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    hex: '#10b981',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/30',
    accentBg: 'bg-emerald-600',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/20',
    badgeText: 'text-emerald-400',
    shadowGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    dockActive: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    dockDot: 'bg-emerald-400',
    gradient: 'from-emerald-400 to-teal-400',
    blobs: {
      top: 'from-emerald-600/15 via-teal-600/8 to-transparent',
      left: 'bg-emerald-500/8',
      right: 'bg-teal-500/8',
    },
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    hex: '#06b6d4',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-500/30',
    accentBg: 'bg-cyan-600',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/20',
    badgeText: 'text-cyan-400',
    shadowGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    dockActive: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    dockDot: 'bg-cyan-400',
    gradient: 'from-cyan-400 to-sky-400',
    blobs: {
      top: 'from-cyan-600/15 via-sky-600/8 to-transparent',
      left: 'bg-cyan-500/8',
      right: 'bg-sky-500/8',
    },
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    hex: '#f59e0b',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/30',
    accentBg: 'bg-amber-600',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/20',
    badgeText: 'text-amber-400',
    shadowGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    dockActive: 'bg-amber-600/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    dockDot: 'bg-amber-400',
    gradient: 'from-amber-400 to-orange-400',
    blobs: {
      top: 'from-amber-600/15 via-orange-600/8 to-transparent',
      left: 'bg-amber-500/8',
      right: 'bg-orange-500/8',
    },
  },
  {
    id: 'rose',
    name: 'Neon Rose',
    hex: '#f43f5e',
    accentText: 'text-rose-400',
    accentBorder: 'border-rose-500/30',
    accentBg: 'bg-rose-600',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/20',
    badgeText: 'text-rose-400',
    shadowGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]',
    dockActive: 'bg-rose-600/20 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    dockDot: 'bg-rose-400',
    gradient: 'from-rose-400 to-pink-400',
    blobs: {
      top: 'from-rose-600/15 via-pink-600/8 to-transparent',
      left: 'bg-rose-500/8',
      right: 'bg-pink-500/8',
    },
  },
  {
    id: 'indigo',
    name: 'Midnight Indigo',
    hex: '#6366f1',
    accentText: 'text-indigo-400',
    accentBorder: 'border-indigo-500/30',
    accentBg: 'bg-indigo-600',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/20',
    badgeText: 'text-indigo-400',
    shadowGlow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]',
    dockActive: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    dockDot: 'bg-indigo-400',
    gradient: 'from-indigo-400 to-blue-400',
    blobs: {
      top: 'from-indigo-600/15 via-blue-600/8 to-transparent',
      left: 'bg-indigo-500/8',
      right: 'bg-blue-500/8',
    },
  },
];

const STORAGE_KEY = 'rootnexus_tinge_color_v1';

const TingeContext = createContext({
  tinge: TINGE_OPTIONS[0],
  setTingeId: () => {},
  tingeOptions: TINGE_OPTIONS,
});

export function TingeProvider({ children }) {
  const [tingeId, setTingeIdState] = useState('violet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TINGE_OPTIONS.some((opt) => opt.id === saved)) {
        setTingeIdState(saved);
      }
    } catch {}
    setMounted(true);
  }, []);

  const setTingeId = (id) => {
    setTingeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  const activeTinge = TINGE_OPTIONS.find((opt) => opt.id === tingeId) || TINGE_OPTIONS[0];

  return (
    <TingeContext.Provider value={{ tinge: activeTinge, setTingeId, tingeOptions: TINGE_OPTIONS }}>
      {children}
    </TingeContext.Provider>
  );
}

export function useTinge() {
  return useContext(TingeContext);
}
