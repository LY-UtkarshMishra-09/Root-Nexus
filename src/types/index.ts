export type ThemeMode = 'dark' | 'light';

export type TingeColor = 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';

export interface EnrolledSubject {
  id: string;
  code: string;
  name: string;
  shortName: string;
  attended: number;
  total: number;
  credits: number;
  faculty: string;
  roomDefault: string;
  category: 'core' | 'lab' | 'humanities' | 'maths';
}

export type SlotType = 'Lecture' | 'Lab' | 'Tutorial' | 'Break';

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "09:50"
  subjectCode: string;
  subjectName: string;
  type: SlotType;
  room: string;
  faculty?: string;
  batch?: string; // e.g., "All" or "B3"
}

export interface NoteResource {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  category: 'T1 Notes' | 'T2 Notes' | 'End-Sem' | 'Lab Sheet' | 'PYQ' | 'Formula Sheet';
  year?: string;
  semester: string;
  format: 'PDF' | 'ZIP' | 'DOC' | 'DRIVE';
  size: string;
  contributor: string;
  downloadsCount: number;
  previewUrl?: string;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tag: string;
  subject?: string;
}

export interface MessDayMenu {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
  specialItem?: string;
}

export interface CafeItem {
  id: string;
  name: string;
  category: 'Beverages' | 'Quick Bites' | 'Maggi & Rolls' | 'Meals & Combos' | 'Bakery & Sweets' | 'Stationery';
  price: number;
  location: 'Annapurna Tuck Shop' | 'Nescafe Kiosk' | 'Sub-station Cafe' | 'Jaypee Night Canteen';
  isPopular?: boolean;
  isVeg: boolean;
  prepTime?: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Assignments' | 'T1/T2 prep' | 'Lab records' | 'General';

export interface TodoTask {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  dueDate: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  createdAt: string;
}

export type McpConnectionStatus = 'Connected' | 'Syncing' | 'Offline / Local Fallback';

export interface NotionMcpConfig {
  token: string;
  notesDbId: string;
  todosDbId: string;
  endpointUrl: string;
  syncTodos: boolean;
  exportNotes: boolean;
  autoSyncOnChange: boolean;
  status: McpConnectionStatus;
  lastSyncedAt?: string;
  latencyMs?: number;
}

export interface McpSyncLog {
  id: string;
  timestamp: string;
  type: 'success' | 'info' | 'error' | 'sync';
  message: string;
  details?: string;
}
