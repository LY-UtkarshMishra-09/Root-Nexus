'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { CafeItem, MessDayMenu } from '@/types';
import { MESS_MENU, CAFE_ITEMS } from '@/lib/mockData';
import {
  Utensils,
  Coffee,
  Search,
  Flame,
  Clock,
  MapPin,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface CampusFoodTabProps {
  initialCafeItems?: CafeItem[];
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const CampusFoodTab: React.FC<CampusFoodTabProps> = ({
  initialCafeItems = CAFE_ITEMS,
}) => {
  const { accentStyles, theme } = useTheme();

  // Mode: 'mess' or 'cafe'
  const [activeSubTab, setActiveSubTab] = useState<'mess' | 'cafe'>('mess');

  // Mess State
  const [selectedDay, setSelectedDay] = useState<typeof DAYS_OF_WEEK[number]>('Monday');

  // Cafe State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Interactive Tray / Quick Bill Calculator
  const [cart, setCart] = useState<{ item: CafeItem; quantity: number }[]>([]);

  const handleAddToCart = (item: CafeItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.item.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { item: CafeItem; quantity: number }[]
    );
  };

  const handleClearCart = () => setCart([]);

  const totalBill = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  // Filtered Cafe Items
  const filteredCafeItems = initialCafeItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesLoc =
      selectedLocation === 'all' || item.location === selectedLocation;

    return matchesSearch && matchesCat && matchesLoc;
  });

  const currentMessDay: MessDayMenu = MESS_MENU[selectedDay] || MESS_MENU['Monday'];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="liquid-card p-5 sm:p-6 relative overflow-hidden">
        <div className="specular-glow" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Campus Dining & Canteen
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                JIIT Food Hub
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Campus Food & Cafe Rates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-0.5">
              Annapurna hostel mess meal plan and Nescafe/Tuck Shop rate lists.
            </p>
          </div>

          {/* Toggle between Mess Menu & Cafe Rates */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('mess')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSubTab === 'mess'
                  ? `${accentStyles.primaryBg} text-white shadow-md`
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Annapurna Mess Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('cafe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSubTab === 'cafe'
                  ? `${accentStyles.primaryBg} text-white shadow-md`
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Cafe & Tuck Shop Rates</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MESS MENU */}
      {activeSubTab === 'mess' && (
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md scale-[1.02]'
                      : 'liquid-card text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div>{day.substring(0, 3)}</div>
                  <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
                    {day === 'Monday' || day === 'Wednesday' || day === 'Sunday' ? 'Special' : 'Regular'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Today's Special Alert */}
          {currentMessDay.specialItem && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>{selectedDay}&apos;s Highlight:</strong> {currentMessDay.specialItem}
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                Annapurna Mess
              </span>
            </div>
          )}

          {/* 4 Meal Cards Grid (Breakfast, Lunch, Snacks, Dinner) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breakfast */}
            <div className="liquid-card p-5 relative overflow-hidden">
              <div className="specular-glow" />
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Breakfast
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    07:30 AM &ndash; 09:30 AM
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  Morning
                </span>
              </div>
              <ul className="mt-3.5 space-y-2">
                {currentMessDay.breakfast.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lunch */}
            <div className="liquid-card p-5 relative overflow-hidden">
              <div className="specular-glow" />
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Lunch
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    12:30 PM &ndash; 02:30 PM
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Midday Meal
                </span>
              </div>
              <ul className="mt-3.5 space-y-2">
                {currentMessDay.lunch.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evening Snacks */}
            <div className="liquid-card p-5 relative overflow-hidden">
              <div className="specular-glow" />
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Evening Snacks & Chai
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    05:00 PM &ndash; 06:30 PM
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Chai Time
                </span>
              </div>
              <ul className="mt-3.5 space-y-2">
                {currentMessDay.snacks.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dinner */}
            <div className="liquid-card p-5 relative overflow-hidden">
              <div className="specular-glow" />
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Dinner & Sweet Dish
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    08:00 PM &ndash; 10:00 PM
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Night
                </span>
              </div>
              <ul className="mt-3.5 space-y-2">
                {currentMessDay.dinner.map((dish, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CAFE & TUCK SHOP RATES */}
      {activeSubTab === 'cafe' && (
        <div className="space-y-6">
          {/* Search & Location Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Cold Coffee, Maggi, Roll..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 md:col-span-2">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'Beverages', label: 'Beverages & Coffee' },
                { id: 'Maggi & Rolls', label: 'Maggi & Rolls' },
                { id: 'Quick Bites', label: 'Quick Bites' },
                { id: 'Meals & Combos', label: 'Meals & Combos' },
                { id: 'Bakery & Sweets', label: 'Bakery' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? `${accentStyles.primaryBg} text-white shadow-sm`
                      : 'liquid-card text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Campus Outlets:</span>
            {[
              { id: 'all', label: 'All Outlets' },
              { id: 'Nescafe Kiosk', label: 'Nescafe Kiosk (Grounds)' },
              { id: 'Annapurna Tuck Shop', label: 'Annapurna Tuck Shop' },
              { id: 'Sub-station Cafe', label: 'Sub-station Cafe' },
              { id: 'Jaypee Night Canteen', label: 'Jaypee Night Canteen' },
            ].map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocation(loc.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedLocation === loc.id
                    ? 'bg-slate-800 dark:bg-zinc-700 text-white font-bold'
                    : 'bg-slate-100 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          {/* Grid: Food Menu (8 Cols) + Tray / Quick Bill (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Food items table/cards (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Rate Card ({filteredCafeItems.length} items available)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Prices in Indian Rupees (₹)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCafeItems.map((item) => (
                  <div
                    key={item.id}
                    className="liquid-card p-4 relative group flex flex-col justify-between hover:scale-[1.01] transition-transform"
                  >
                    <div className="specular-glow" />

                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Veg icon */}
                          <span className="w-3.5 h-3.5 rounded-sm border border-emerald-500 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
                            {item.category}
                          </span>
                        </div>

                        {item.isPopular && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Popular
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                        {item.name}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
                        {item.prepTime && (
                          <>
                            <span>•</span>
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.prepTime}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{item.price}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow-sm transition-all active:scale-95 ${accentStyles.primaryBg}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Bill / Tray Simulator (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="liquid-card p-5 relative overflow-hidden">
                <div className="specular-glow" />

                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Quick Order Calculator
                    </h3>
                  </div>

                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                      title="Clear tray"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 dark:text-zinc-400">
                    <Coffee className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">Your quick order tray is empty.</p>
                    <p className="text-[11px] mt-0.5">Click &ldquo;Add&rdquo; on any item to calculate total expense or split with friends!</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {cart.map(({ item, quantity }) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-100 dark:bg-zinc-900/60"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="font-semibold text-slate-900 dark:text-zinc-200 truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ₹{item.price} each
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, -1)}
                              className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, 1)}
                              className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <span className="w-12 text-right font-bold text-slate-900 dark:text-white font-mono">
                              ₹{item.price * quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total & Split Bill */}
                    <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600 dark:text-zinc-400">Total Amount:</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                          ₹{totalBill}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                        <span>Split between 2:</span>
                        <span className="font-mono font-bold">₹{(totalBill / 2).toFixed(1)} each</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                        <span>Split between 3:</span>
                        <span className="font-mono font-bold">₹{(totalBill / 3).toFixed(1)} each</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
