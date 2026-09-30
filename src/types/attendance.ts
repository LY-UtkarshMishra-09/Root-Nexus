export type AttendanceZone = 'safe' | 'warning' | 'danger';

export interface Subject {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  attended: number;
  total: number;
  credits?: number;
  faculty?: string;
  roomDefault?: string;
  category?: 'core' | 'lab' | 'humanities' | 'maths';
}

export type ActionType = 
  | 'MARK_PRESENT'
  | 'MARK_ABSENT'
  | 'DECREMENT_PRESENT'
  | 'DECREMENT_ABSENT'
  | 'EDIT_SUBJECT'
  | 'RESET_SUBJECT'
  | 'ADD_SUBJECT'
  | 'DELETE_SUBJECT';

export interface AttendanceAction {
  id: string;
  timestamp: number;
  formattedTime: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  type: ActionType;
  description: string;
  previousSubjectState: Subject | null;
  newSubjectState: Subject | null;
}

export interface SubjectCalculation {
  percentage: number;
  formattedPercentage: string;
  zone: AttendanceZone;
  isDebarred: boolean; // strictly below 75%
  isSafe: boolean; // >= target
  isWarning: boolean; // between 75% and 79.9%
  safeBunkCount: number;
  deficitCount: number;
  statusText: string;
  badgeColorClass: string;
  textColorClass: string;
  progressBarColorClass: string;
  ringColorClass: string;
  cardGlowClass: string;
}

export interface AttendanceAggregate {
  totalAttended: number;
  totalConducted: number;
  overallPercentage: number;
  formattedOverallPercentage: string;
  zone: AttendanceZone;
  atRiskCount: number;
  warningCount: number;
  safeCount: number;
  statusBadge: 'All Clear' | `${number} Subject(s) at Risk`;
  canBunkAggregate: number;
  deficitAggregate: number;
}

export interface AttendanceState {
  subjects: Subject[];
  targetThreshold: number; // 75, 80, 85
  auditLog: AttendanceAction[];
  isHydrated: boolean;
}
