'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, TingeColor } from '@/types';

interface ThemeContextType {
  theme: ThemeMode;
  tinge: TingeColor;
  setTheme: (theme: ThemeMode) => void;
  setTinge: (tinge: TingeColor) => void;
  toggleTheme: () => void;
  accentStyles: {
    primaryBg: string;
    primaryText: string;
    borderGlow: string;
    subtleBg: string;
    glowRgb: string;
    badgeBg: string;
  };
}

const TINGE_MAP: Record<TingeColor, {
  primaryBg: string;
  primaryText: string;
  borderGlow: string;
  subtleBg: string;
  glowRgb: string;
  badgeBg: string;
}> = {
  violet: {
    primaryBg: 'bg-violet-600 hover:bg-violet-500',
    primaryText: 'text-violet-500 dark:text-violet-400',
    borderGlow: 'border-violet-500/30 hover:border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    subtleBg: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-300',
    glowRgb: '139, 92, 246',
    badgeBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30',
  },
  cyan: {
    primaryBg: 'bg-cyan-600 hover:bg-cyan-500',
    primaryText: 'text-cyan-600 dark:text-cyan-400',
    borderGlow: 'border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    subtleBg: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300',
    glowRgb: '6, 182, 212',
    badgeBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
  },
  emerald: {
    primaryBg: 'bg-emerald-600 hover:bg-emerald-500',
    primaryText: 'text-emerald-600 dark:text-emerald-400',
    borderGlow: 'border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    subtleBg: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
    glowRgb: '16, 185, 129',
    badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  },
  amber: {
    primaryBg: 'bg-amber-600 hover:bg-amber-500',
    primaryText: 'text-amber-600 dark:text-amber-400',
    borderGlow: 'border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    subtleBg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300',
    glowRgb: '245, 158, 11',
    badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
  },
  rose: {
    primaryBg: 'bg-rose-600 hover:bg-rose-500',
    primaryText: 'text-rose-600 dark:text-rose-400',
    borderGlow: 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    subtleBg: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300',
    glowRgb: '244, 63, 94',
    badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [tinge, setTingeState] = useState<TingeColor>('violet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load persisted theme and tinge
    try {
      const savedTheme = localStorage.getItem('sectorsync_theme') as ThemeMode;
      const savedTinge = localStorage.getItem('sectorsync_tinge') as TingeColor;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setThemeState(savedTheme);
      }
      if (savedTinge && TINGE_MAP[savedTinge]) {
        setTingeState(savedTinge);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    try {
      localStorage.setItem('sectorsync_theme', theme);
      localStorage.setItem('sectorsync_tinge', tinge);
    } catch {
      // ignore
    }
  }, [theme, tinge, mounted]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setTinge = (newTinge: TingeColor) => {
    setTingeState(newTinge);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const accentStyles = TINGE_MAP[tinge] || TINGE_MAP.violet;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        tinge,
        setTheme,
        setTinge,
        toggleTheme,
        accentStyles,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
