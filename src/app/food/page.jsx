'use client';

import React, { useState, useEffect } from 'react';
import { MESS_MENU, CAFE_ITEMS } from '@/data/mockData';
import {
  Utensils,
  Coffee,
  Search,
  Flame,
  Clock,
  MapPin,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const CATEGORIES = ['All', 'Beverages', 'Quick Bites', 'Meals', 'Stationery'];

export default function FoodPage() {
  const [mounted, setMounted] = useState(false);
  const [segment, setSegment] = useState('mess'); // 'mess' or 'cafe'
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [currentHour, setCurrentHour] = useState(12);

  // Cafe state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setSelectedDay(dayNames[now.getDay()]);
    setCurrentHour(now.getHours());
  }, []);

  // Determine active meal based on the hour of the day
  const getActiveMealType = () => {
    if (currentHour < 10) return 'breakfast';
    if (currentHour < 15) return 'lunch';
    if (currentHour < 19) return 'snacks';
    return 'dinner';
  };

  const activeMealType = getActiveMealType();
  const currentMessDay = MESS_MENU[selectedDay] || MESS_MENU['Monday'];

  // Filtered cafe items
  const filteredCafeItems = CAFE_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
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
      {/* Top Header & Segment Switch */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 hover:border-zinc-700/60 transition-all space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Campus Dining & Snacks
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Sector-128
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Mess Menu & Campus Cafe Rates
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Annapurna hostel meal schedule, Nescafe kiosk rates, and Tuck Shop pricing.
            </p>
          </div>

          {/* Top Segment Switch: Annapurna Mess vs Campus Cafe */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-950 border border-zinc-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSegment('mess')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                segment === 'mess'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Annapurna Mess</span>
            </button>

            <button
              type="button"
              onClick={() => setSegment('cafe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                segment === 'cafe'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Cafe & Tuck Shop</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEGMENT 1: MESS MENU */}
      {segment === 'mess' && (
        <div className="space-y-5">
          {/* Day of the Week Pills (Mon - Sun) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 shadow-md scale-[1.02]'
                      : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{day}</span>
                </button>
              );
            })}
          </div>

          {/* Today's Special Dish Banner */}
          {currentMessDay.special && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>{selectedDay}&apos;s Highlight:</strong> {currentMessDay.special}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Annapurna Mess
              </span>
            </div>
          )}

          {/* 4 Meal Cards Grid: Breakfast, Lunch, Evening Snacks, Dinner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breakfast */}
            <div
              className={`bg-zinc-900/50 backdrop-blur-xl border rounded-2xl p-5 transition-all ${
                activeMealType === 'breakfast'
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-950/10'
                  : 'border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white">Breakfast</h3>
                  <p className="text-xs text-zinc-400">07:30 AM &ndash; 09:30 AM</p>
                </div>
                {activeMealType === 'breakfast' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    Serving Now
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-zinc-400">Morning</span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {currentMessDay.breakfast.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lunch */}
            <div
              className={`bg-zinc-900/50 backdrop-blur-xl border rounded-2xl p-5 transition-all ${
                activeMealType === 'lunch'
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-950/10'
                  : 'border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white">Lunch</h3>
                  <p className="text-xs text-zinc-400">12:30 PM &ndash; 02:30 PM</p>
                </div>
                {activeMealType === 'lunch' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    Serving Now
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-zinc-400">Midday</span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {currentMessDay.lunch.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evening Snacks */}
            <div
              className={`bg-zinc-900/50 backdrop-blur-xl border rounded-2xl p-5 transition-all ${
                activeMealType === 'snacks'
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-950/10'
                  : 'border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white">Evening Snacks & Chai</h3>
                  <p className="text-xs text-zinc-400">05:00 PM &ndash; 06:30 PM</p>
                </div>
                {activeMealType === 'snacks' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    Serving Now
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-zinc-400">Chai Time</span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {currentMessDay.snacks.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dinner */}
            <div
              className={`bg-zinc-900/50 backdrop-blur-xl border rounded-2xl p-5 transition-all ${
                activeMealType === 'dinner'
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-950/10'
                  : 'border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white">Dinner & Dessert</h3>
                  <p className="text-xs text-zinc-400">08:00 PM &ndash; 10:00 PM</p>
                </div>
                {activeMealType === 'dinner' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    Serving Now
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-zinc-400">Night</span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {currentMessDay.dinner.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: CAFE & TUCK SHOP RATES */}
      {segment === 'cafe' && (
        <div className="space-y-5">
          {/* Instant Search Bar + Category Chips */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Maggi, Cold Coffee, Pen..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Cafe Price Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCafeItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {item.category}
                    </span>
                    {item.isPopular && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Popular
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{item.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="text-base font-extrabold text-white font-mono">
                    ₹{item.price}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Verified rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
