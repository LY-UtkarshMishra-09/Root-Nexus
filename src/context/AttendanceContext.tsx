'use client';

import React, { createContext, useContext } from 'react';
import { useAttendance } from '@/hooks/useAttendance';

type AttendanceContextType = ReturnType<typeof useAttendance>;

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const attendance = useAttendance();
  return (
    <AttendanceContext.Provider value={attendance}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useGlobalAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useGlobalAttendance must be used within an AttendanceProvider');
  }
  return context;
}
