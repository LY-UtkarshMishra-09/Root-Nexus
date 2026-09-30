'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useGlobalAttendance } from '@/context/AttendanceContext';
import { calculateAggregate } from '@/utils/attendanceMath';
import {
  LayoutDashboard,
  Calendar,
  Percent,
  UtensilsCrossed,
  FileText,
  CheckSquare,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: controlledCollapsed,
  setIsCollapsed: setControlledCollapsed,
}) => {
  const { accentStyles } = useTheme();
  const pathname = usePathname();
  const { subjects, targetThreshold } = useGlobalAttendance();
  const aggregate = calculateAggregate(subjects, targetThreshold);

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setIsCollapsed = setControlledCollapsed || setInternalCollapsed;

  const navItems = [
    {
      href: '/',
      label: 'Command Center',
      shortLabel: 'Command',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/schedule',
      label: 'Class Schedule',
      shortLabel: 'Schedule',
      icon: Calendar,
      badge: 'Live',
      badgeVariant: 'accent',
    },
    {
      href: '/attendance',
      label: 'Attendance Tracker',
      shortLabel: 'Attendance',
      icon: Percent,
      badge: aggregate.atRiskCount > 0 ? `${aggregate.atRiskCount} risk` : `${aggregate.overallPercentage.toFixed(0)}%`,
      badgeVariant: aggregate.atRiskCount > 0 ? 'warning' : 'safe',
    },
    {
      href: '/food',
      label: 'Mess & Cafe Rates',
      shortLabel: 'Food',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      href: '/notes',
      label: 'Notes & PYQs Hub',
      shortLabel: 'Notes',
      icon: FileText,
      badge: null,
    },
    {
      href: '/todos',
      label: 'To-Do & Deadlines',
      shortLabel: 'To-Dos',
      icon: CheckSquare,
      badge: null,
    },
    {
      href: '/integrations',
      label: 'Notion MCP Bridge',
      shortLabel: 'MCP Sync',
      icon: Settings2,
      badge: 'MCP',
      badgeVariant: 'accent',
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between transition-all duration-300 ease-in-out liquid-card my-3 ml-2 lg:ml-4 p-3.5 relative select-none shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        style={{ minHeight: 'calc(100vh - 5.5rem)' }}
      >
        <div className="specular-glow" />

        {/* Top: Header & Nav */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
                  Nexus Cockpit
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50 hover:bg-slate-200/50 dark:hover:bg-zinc-700/60 transition-colors text-slate-600 dark:text-zinc-300 ml-auto"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group overflow-hidden ${
                    isActive
                      ? 'bg-slate-200/80 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active highlight glow indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full"
                      style={{ backgroundColor: `rgb(${accentStyles.glowRgb})` }}
                    />
                  )}

                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive
                          ? accentStyles.primaryText
                          : 'text-slate-500 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                      }`}
                    />
                  </div>

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.badgeVariant === 'warning'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : item.badgeVariant === 'safe'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : accentStyles.badgeBg
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Student Profile Pill */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
              RN
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                    Utkarsh Mishra
                  </p>
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>JIIT Sec-128</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-medium">B3 CSE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Fixed) */}
      <div className="md:hidden fixed bottom-2 left-2 right-2 z-40">
        <div className="liquid-card px-1 py-1.5 flex items-center justify-around shadow-2xl border border-slate-200 dark:border-zinc-700/80">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl relative transition-all duration-200 ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? `${accentStyles.primaryText} scale-110` : ''
                    }`}
                  />
                  {item.badgeVariant === 'warning' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">
                  {item.shortLabel}
                </span>

                {isActive && (
                  <span
                    className="w-4 h-0.5 rounded-full mt-0.5"
                    style={{ backgroundColor: `rgb(${accentStyles.glowRgb})` }}
                  />
                )}
              </Link>
            );
          })}

          {/* More trigger for todos & integrations on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl relative transition-all duration-200 ${
              pathname === '/todos' || pathname === '/integrations'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Modal for Remaining Links */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full liquid-card rounded-t-3xl p-5 border-t border-slate-200 dark:border-zinc-700 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                All Cockpit Features
              </span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white'
                        : 'bg-slate-100 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
