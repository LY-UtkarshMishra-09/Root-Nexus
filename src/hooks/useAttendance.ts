'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subject, AttendanceAction, ActionType } from '@/types/attendance';

export const JIIT_INITIAL_SEEDS: Subject[] = [
  {
    id: 'jiit-sdf-1',
    code: '15B11CI111',
    name: 'Software Development Fundamentals - I',
    shortName: 'SDF-1',
    attended: 28,
    total: 32,
    credits: 4,
    faculty: 'Dr. Manish Kumar Thakur',
    roomDefault: 'LT-2',
    category: 'core',
  },
  {
    id: 'jiit-maths-1',
    code: '15B11MA111',
    name: 'Mathematics - I (Calculus & Linear Algebra)',
    shortName: 'Maths-1',
    attended: 22,
    total: 28,
    credits: 4,
    faculty: 'Prof. Alka Tripathi',
    roomDefault: 'LT-1',
    category: 'maths',
  },
  {
    id: 'jiit-physics-1',
    code: '15B11PH111',
    name: 'Physics - I (Oscillations & Modern Optics)',
    shortName: 'Physics-1',
    attended: 18,
    total: 26,
    credits: 4,
    faculty: 'Dr. Navendu Goswami',
    roomDefault: 'LT-3',
    category: 'core',
  },
  {
    id: 'jiit-beee',
    code: '15B11EC111',
    name: 'Basic Electrical & Electronics Engineering',
    shortName: 'BEEE',
    attended: 21,
    total: 25,
    credits: 3,
    faculty: 'Dr. Jitendra Mohan',
    roomDefault: 'LT-2',
    category: 'core',
  },
  {
    id: 'jiit-english',
    code: '15B11HS111',
    name: 'English & Professional Communication',
    shortName: 'English',
    attended: 15,
    total: 16,
    credits: 2,
    faculty: 'Dr. Mukta Mani',
    roomDefault: 'G-12',
    category: 'humanities',
  },
  {
    id: 'jiit-sdf-lab',
    code: '15B17CI171',
    name: 'Software Development Lab - I (C Programming)',
    shortName: 'SDF Lab',
    attended: 10,
    total: 12,
    credits: 2,
    faculty: 'Er. Pulkit Mehrotra',
    roomDefault: 'CL-04 (Abb-III)',
    category: 'lab',
  },
  {
    id: 'jiit-physics-lab',
    code: '15B17PH171',
    name: 'Physics Laboratory - I',
    shortName: 'Physics Lab',
    attended: 7,
    total: 10,
    credits: 1,
    faculty: 'Dr. Anuraj Panwar',
    roomDefault: 'TS-2 Physics Block',
    category: 'lab',
  },
];

const STORAGE_KEYS = {
  SUBJECTS: 'sectorsync_subjects_v2',
  TARGET: 'sectorsync_target_v2',
  AUDIT_LOG: 'sectorsync_audit_log_v2',
};

export function useAttendance() {
  const [subjects, setSubjects] = useState<Subject[]>(JIIT_INITIAL_SEEDS);
  const [targetThreshold, setTargetThresholdState] = useState<number>(75);
  const [auditLog, setAuditLog] = useState<AttendanceAction[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydration-safe initial load from localStorage
  useEffect(() => {
    try {
      const storedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      const storedTarget = localStorage.getItem(STORAGE_KEYS.TARGET);
      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);

      if (storedSubjects) {
        setSubjects(JSON.parse(storedSubjects));
      }
      if (storedTarget) {
        const parsedTarget = Number(storedTarget);
        if ([75, 80, 85].includes(parsedTarget)) {
          setTargetThresholdState(parsedTarget);
        }
      }
      if (storedAudit) {
        setAuditLog(JSON.parse(storedAudit));
      }
    } catch (err) {
      console.error('Failed to parse attendance data from localStorage:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage whenever subjects change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (err) {
      console.error('Failed to save subjects to localStorage:', err);
    }
  }, [subjects, isHydrated]);

  // Sync target threshold to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TARGET, targetThreshold.toString());
    } catch (err) {
      console.error('Failed to save target threshold to localStorage:', err);
    }
  }, [targetThreshold, isHydrated]);

  // Sync audit log to localStorage (limit to last 30 actions for performance)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(auditLog.slice(0, 30)));
    } catch (err) {
      console.error('Failed to save audit log to localStorage:', err);
    }
  }, [auditLog, isHydrated]);

  // Helper to format timestamps for audit logs
  const formatActionTime = () => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date());
  };

  // Push an action to the audit log
  const recordAction = useCallback((
    type: ActionType,
    subject: Subject,
    previousSubject: Subject | null,
    newSubject: Subject | null,
    customDescription?: string
  ) => {
    let description = customDescription;
    if (!description) {
      switch (type) {
        case 'MARK_PRESENT':
          description = `Marked Present in ${subject.shortName || subject.code} (${subject.attended + 1}/${subject.total + 1})`;
          break;
        case 'MARK_ABSENT':
          description = `Marked Absent in ${subject.shortName || subject.code} (${subject.attended}/${subject.total + 1})`;
          break;
        case 'DECREMENT_PRESENT':
          description = `Decremented Present in ${subject.shortName || subject.code} (${subject.attended - 1}/${subject.total - 1})`;
          break;
        case 'DECREMENT_ABSENT':
          description = `Decremented Absent in ${subject.shortName || subject.code} (${subject.attended}/${subject.total - 1})`;
          break;
        case 'EDIT_SUBJECT':
          description = `Edited details for ${subject.shortName || subject.code}`;
          break;
        case 'RESET_SUBJECT':
          description = `Reset attendance counts for ${subject.shortName || subject.code}`;
          break;
        case 'ADD_SUBJECT':
          description = `Enrolled new subject ${subject.shortName || subject.code}`;
          break;
        case 'DELETE_SUBJECT':
          description = `Removed subject ${subject.shortName || subject.code}`;
          break;
      }
    }

    const newAction: AttendanceAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      formattedTime: formatActionTime(),
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      type,
      description: description || 'Action recorded',
      previousSubjectState: previousSubject ? { ...previousSubject } : null,
      newSubjectState: newSubject ? { ...newSubject } : null,
    };

    setAuditLog((prev) => [newAction, ...prev.slice(0, 29)]);
  }, []);

  // 1. Mark Present (+1 attended, +1 total)
  const markPresent = useCallback((subjectId: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const previous = { ...sub };
        const updated = {
          ...sub,
          attended: sub.attended + 1,
          total: sub.total + 1,
        };
        recordAction('MARK_PRESENT', sub, previous, updated);
        return updated;
      })
    );
  }, [recordAction]);

  // 2. Mark Absent (+0 attended, +1 total)
  const markAbsent = useCallback((subjectId: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const previous = { ...sub };
        const updated = {
          ...sub,
          total: sub.total + 1,
        };
        recordAction('MARK_ABSENT', sub, previous, updated);
        return updated;
      })
    );
  }, [recordAction]);

  // 3. Decrement Present (-1 attended, -1 total) in case of accidental click
  const decrementPresent = useCallback((subjectId: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        if (sub.attended <= 0 || sub.total <= 0) return sub;
        const previous = { ...sub };
        const updated = {
          ...sub,
          attended: sub.attended - 1,
          total: sub.total - 1,
        };
        recordAction('DECREMENT_PRESENT', sub, previous, updated);
        return updated;
      })
    );
  }, [recordAction]);

  // 4. Decrement Absent (-0 attended, -1 total) in case of accidental click
  const decrementAbsent = useCallback((subjectId: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        // Total cannot drop below attended classes
        if (sub.total <= sub.attended || sub.total <= 0) return sub;
        const previous = { ...sub };
        const updated = {
          ...sub,
          total: sub.total - 1,
        };
        recordAction('DECREMENT_ABSENT', sub, previous, updated);
        return updated;
      })
    );
  }, [recordAction]);

  // 5. Undo Last Action
  const undoLastAction = useCallback(() => {
    if (auditLog.length === 0) return false;

    const [lastAction, ...remainingLog] = auditLog;
    if (!lastAction) return false;

    setSubjects((prev) => {
      // If the action was adding a subject, undo means removing it
      if (lastAction.type === 'ADD_SUBJECT') {
        return prev.filter((s) => s.id !== lastAction.subjectId);
      }

      // If the action was deleting a subject, undo means re-adding it
      if (lastAction.type === 'DELETE_SUBJECT' && lastAction.previousSubjectState) {
        return [...prev, lastAction.previousSubjectState];
      }

      // If there is previous state, revert to it
      if (lastAction.previousSubjectState) {
        const prevSub = lastAction.previousSubjectState;
        return prev.map((s) => (s.id === lastAction.subjectId ? prevSub : s));
      }

      return prev;
    });

    setAuditLog(remainingLog);
    return true;
  }, [auditLog]);

  // 6. Add New Subject
  const addSubject = useCallback((subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      shortName: subjectData.shortName || subjectData.code,
      attended: Math.max(0, subjectData.attended),
      total: Math.max(subjectData.attended, subjectData.total),
    };

    setSubjects((prev) => [...prev, newSubject]);
    recordAction('ADD_SUBJECT', newSubject, null, newSubject);
  }, [recordAction]);

  // 7. Edit Subject
  const editSubject = useCallback((updatedSubject: Subject) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== updatedSubject.id) return s;
        const sanitized: Subject = {
          ...updatedSubject,
          attended: Math.max(0, updatedSubject.attended),
          total: Math.max(updatedSubject.attended, updatedSubject.total),
        };
        recordAction('EDIT_SUBJECT', s, s, sanitized);
        return sanitized;
      })
    );
  }, [recordAction]);

  // 8. Delete Subject
  const deleteSubject = useCallback((subjectId: string) => {
    const subjectToDelete = subjects.find((s) => s.id === subjectId);
    if (!subjectToDelete) return;

    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    recordAction('DELETE_SUBJECT', subjectToDelete, subjectToDelete, null);
  }, [subjects, recordAction]);

  // 9. Reset Subject Attendance
  const resetSubjectAttendance = useCallback((subjectId: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const seed = JIIT_INITIAL_SEEDS.find((s) => s.id === subjectId || s.code === sub.code);
        const previous = { ...sub };
        const updated: Subject = {
          ...sub,
          attended: seed ? seed.attended : 0,
          total: seed ? seed.total : 0,
        };
        recordAction('RESET_SUBJECT', sub, previous, updated, `Reset attendance for ${sub.shortName || sub.code}`);
        return updated;
      })
    );
  }, [recordAction]);

  // 10. Reset All to Initial Seeds
  const resetAllToSeed = useCallback(() => {
    setSubjects(JIIT_INITIAL_SEEDS);
    setAuditLog([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOG);
    } catch {
      // ignore
    }
  }, []);

  // 11. Clear Audit Log
  const clearAuditLog = useCallback(() => {
    setAuditLog([]);
  }, []);

  // 12. Adjust Target Safety Buffer (75%, 80%, 85%)
  const setTargetThreshold = useCallback((target: number) => {
    if ([75, 80, 85].includes(target)) {
      setTargetThresholdState(target);
    }
  }, []);

  return {
    subjects,
    targetThreshold,
    auditLog,
    isHydrated,
    markPresent,
    markAbsent,
    decrementPresent,
    decrementAbsent,
    undoLastAction,
    addSubject,
    editSubject,
    deleteSubject,
    resetSubjectAttendance,
    resetAllToSeed,
    clearAuditLog,
    setTargetThreshold,
  };
}
