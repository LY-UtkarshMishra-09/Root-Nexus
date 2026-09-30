'use client';

import React, { useState, useEffect } from 'react';
import { Subject } from '@/types/attendance';
import { useTheme } from '@/context/ThemeContext';
import { X, Check, BookPlus, Edit3, AlertCircle } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subjectData: Omit<Subject, 'id'> | Subject) => void;
  initialData?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { accentStyles } = useTheme();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [attended, setAttended] = useState(0);
  const [total, setTotal] = useState(0);
  const [credits, setCredits] = useState(4);
  const [faculty, setFaculty] = useState('');
  const [roomDefault, setRoomDefault] = useState('LT-2');
  const [category, setCategory] = useState<Subject['category']>('core');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setShortName(initialData.shortName || '');
      setAttended(initialData.attended);
      setTotal(initialData.total);
      setCredits(initialData.credits || 4);
      setFaculty(initialData.faculty || '');
      setRoomDefault(initialData.roomDefault || 'LT-2');
      setCategory(initialData.category || 'core');
    } else {
      setCode('');
      setName('');
      setShortName('');
      setAttended(0);
      setTotal(0);
      setCredits(4);
      setFaculty('');
      setRoomDefault('LT-2');
      setCategory('core');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Course Code and Subject Name are required.');
      return;
    }

    if (attended > total) {
      setError('Attended classes cannot be greater than Total classes held.');
      return;
    }

    if (attended < 0 || total < 0) {
      setError('Class counts cannot be negative.');
      return;
    }

    if (initialData) {
      onSubmit({
        ...initialData,
        code: code.trim(),
        name: name.trim(),
        shortName: shortName.trim() || code.trim(),
        attended: Number(attended),
        total: Number(total),
        credits: Number(credits),
        faculty: faculty.trim(),
        roomDefault: roomDefault.trim(),
        category,
      });
    } else {
      onSubmit({
        code: code.trim(),
        name: name.trim(),
        shortName: shortName.trim() || code.trim(),
        attended: Number(attended),
        total: Number(total),
        credits: Number(credits),
        faculty: faculty.trim(),
        roomDefault: roomDefault.trim(),
        category,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="liquid-card w-full max-w-lg p-6 relative overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-700">
        <div className="specular-glow" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${accentStyles.primaryBg}`}>
              {initialData ? <Edit3 className="w-4 h-4" /> : <BookPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'Edit Subject Details' : 'Enroll New Subject'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                JIIT Curriculum Compliance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                placeholder="e.g. 15B11CI111"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Short Name / Acronym
              </label>
              <input
                type="text"
                placeholder="e.g. SDF-1"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Full Subject Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Software Development Fundamentals - I"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Attended Classes
              </label>
              <input
                type="number"
                min="0"
                value={attended}
                onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Total Classes Held
              </label>
              <input
                type="number"
                min="0"
                value={total}
                onChange={(e) => setTotal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Faculty In-Charge
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Manish Thakur"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Default Room / Lab
              </label>
              <input
                type="text"
                placeholder="e.g. LT-2 or CL-04"
                value={roomDefault}
                onChange={(e) => setRoomDefault(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Subject['category'])}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="core">Core CSE</option>
                <option value="lab">Laboratory</option>
                <option value="maths">Mathematics</option>
                <option value="humanities">Humanities</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all ${accentStyles.primaryBg}`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? 'Save Changes' : 'Enroll Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
