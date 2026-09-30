'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTinge } from '@/context/TingeContext';
import { Palette, Check, Sparkles } from 'lucide-react';

export default function TingeChanger({ compact = false }) {
  const { tinge, setTingeId, tingeOptions } = useTinge();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all select-none cursor-pointer ${
          isOpen ? 'ring-1 ring-violet-500/40 border-violet-500/30' : ''
        }`}
        title="Change ambient tinge color"
        aria-label="Change ambient tinge color"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-all"
          style={{ backgroundColor: tinge.hex, color: tinge.hex }}
        />
        <Palette className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-200 transition-colors" />
        {!compact && (
          <span className="hidden md:inline-block text-[11px] text-zinc-300 font-medium">
            Tinge: <span className="font-bold text-white">{tinge.name.split(' ')[0]}</span>
          </span>
        )}
      </button>

      {/* Floating Glassmorphic Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-3 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Ambient Tinge
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">Live Atmosphere</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {tingeOptions.map((opt) => {
              const isSelected = opt.id === tinge.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTingeId(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-700 text-white font-bold shadow-sm'
                      : 'hover:bg-zinc-900/60 border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{
                        backgroundColor: opt.hex,
                        boxShadow: isSelected ? `0 0 10px ${opt.hex}` : 'none',
                      }}
                    />
                    <span className="text-xs">{opt.name}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
