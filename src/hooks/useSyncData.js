'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';

const TODOS_STORAGE_KEY = 'rootnexus_todos_v1';
const ATTENDANCE_STORAGE_KEY = 'rootnexus_attendance_v1';
const NOTES_STORAGE_KEY = 'rootnexus_markdown_notes_v1';

/**
 * Custom hook to monitor real-time browser connectivity
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Offline-First Hook for Tasks & Deadlines
 * Implements Optimistic UI with Cloud (Supabase) + LocalStorage Fallback
 */
export function useSyncedTodos(initialSeeds = []) {
  const isOnline = useOnlineStatus();
  const [todos, setTodos] = useState(initialSeeds);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('local'); // 'cloud' | 'local' | 'syncing' | 'offline'

  // Load initial data (LocalStorage first for zero-latency paint, then Supabase if online)
  useEffect(() => {
    let localData = initialSeeds;
    try {
      const saved = localStorage.getItem(TODOS_STORAGE_KEY);
      if (saved) {
        localData = JSON.parse(saved);
        setTodos(localData);
      }
    } catch {}

    async function loadCloudTodos() {
      if (isSupabaseConfigured && supabase && isOnline) {
        setSyncStatus('syncing');
        try {
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            // Map DB schema to frontend format
            const mapped = data.map((d) => ({
              id: d.id,
              title: d.title,
              subjectCode: d.subject_code,
              subjectName: d.subject_tag,
              priority: d.priority,
              dueDate: d.due_date,
              completed: d.completed,
              archived: d.archived || false,
            }));
            setTodos(mapped);
            localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(mapped));
            setSyncStatus('cloud');
          } else {
            setSyncStatus('local');
          }
        } catch {
          setSyncStatus('local');
        }
      } else {
        setSyncStatus(isOnline ? 'local' : 'offline');
      }
      setLoading(false);
    }

    loadCloudTodos();
  }, [isOnline, initialSeeds]);

  // Save todos with Optimistic UI + Background Cloud Sync
  const saveTodos = useCallback(
    async (updated) => {
      // 1. Instant optimistic update
      setTodos(updated);

      // 2. Persist to LocalStorage immediately
      try {
        localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      // 3. Asynchronously sync to Supabase if connected
      if (isSupabaseConfigured && supabase && isOnline) {
        setSyncStatus('syncing');
        try {
          const dbRows = updated.map((t) => ({
            id: t.id,
            title: t.title,
            subject_tag: t.subjectName || 'General',
            subject_code: t.subjectCode || '24B11CS111',
            priority: t.priority || 'Med',
            due_date: t.dueDate || new Date().toISOString().split('T')[0],
            completed: !!t.completed,
            archived: !!t.archived,
          }));

          const { error } = await supabase.from('todos').upsert(dbRows, { onConflict: 'id' });
          if (!error) {
            setSyncStatus('cloud');
          } else {
            setSyncStatus('local');
          }
        } catch {
          setSyncStatus('local');
        }
      } else {
        setSyncStatus(isOnline ? 'local' : 'offline');
      }
    },
    [isOnline]
  );

  const toggleTask = useCallback(
    (id) => {
      const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      saveTodos(updated);
    },
    [todos, saveTodos]
  );

  const addTask = useCallback(
    (newTask) => {
      const updated = [newTask, ...todos];
      saveTodos(updated);
    },
    [todos, saveTodos]
  );

  const deleteTask = useCallback(
    async (id) => {
      const updated = todos.filter((t) => t.id !== id);
      setTodos(updated);
      try {
        localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      if (isSupabaseConfigured && supabase && isOnline) {
        try {
          await supabase.from('todos').delete().eq('id', id);
        } catch {}
      }
    },
    [todos, isOnline]
  );

  return {
    todos,
    loading,
    syncStatus,
    isOnline,
    saveTodos,
    toggleTask,
    addTask,
    deleteTask,
  };
}

/**
 * Offline-First Hook for Subject Attendance
 */
export function useSyncedAttendance(initialSubjects = []) {
  const isOnline = useOnlineStatus();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('local');

  useEffect(() => {
    let localData = initialSubjects;
    try {
      const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (saved) {
        localData = JSON.parse(saved);
        setSubjects(localData);
      }
    } catch {}

    async function loadCloudAttendance() {
      if (isSupabaseConfigured && supabase && isOnline) {
        try {
          const { data, error } = await supabase.from('attendance').select('*');
          if (!error && data && data.length > 0) {
            const mapped = localData.map((sub) => {
              const cloudRecord = data.find((d) => d.id === sub.id || d.subject_code === sub.code);
              if (cloudRecord) {
                return {
                  ...sub,
                  attended: cloudRecord.attended,
                  total: cloudRecord.total,
                };
              }
              return sub;
            });
            setSubjects(mapped);
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(mapped));
            setSyncStatus('cloud');
          }
        } catch {}
      }
      setLoading(false);
    }

    loadCloudAttendance();
  }, [isOnline, initialSubjects]);

  const saveAttendance = useCallback(
    async (updated) => {
      setSubjects(updated);
      try {
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      if (isSupabaseConfigured && supabase && isOnline) {
        try {
          const dbRows = updated.map((s) => ({
            id: s.id,
            subject_code: s.code,
            subject_name: s.name,
            attended: s.attended,
            total: s.total,
          }));
          await supabase.from('attendance').upsert(dbRows, { onConflict: 'id' });
          setSyncStatus('cloud');
        } catch {}
      }
    },
    [isOnline]
  );

  return {
    subjects,
    loading,
    syncStatus,
    isOnline,
    saveAttendance,
  };
}

