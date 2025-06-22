export interface HabitPair {
  id: string;
  goodHabit: string;
  badHabit: string;
  weight: HabitWeight;
  createdAt: Date;
}

export enum HabitWeight {
  SMALL = 0.0005,    // 0.05%
  LOW = 0.001,       // 0.10% 
  MEDIUM = 0.0025,   // 0.25%
  HIGH = 0.004       // 0.40%
}

export enum HabitLogState {
  GOOD = 'good',     // Did the good habit
  BAD = 'bad',       // Did the bad habit  
  UNLOGGED = 'unlogged' // No entry for this day
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  state: HabitLogState;
}

export interface MomentumData {
  date: string;
  value: number;
  dailyRate: number;
  epoch?: number;
  isProjection?: boolean;
}

export interface AppData {
  habits: HabitPair[];
  logs: HabitLog[];
  settings: {
    theme: 'light' | 'dark';
    nerdMode: boolean;
  };
}

export type ViewMode = 'day' | 'week' | 'month';

export const WEIGHT_LABELS = {
  [HabitWeight.SMALL]: 'Small (+0.05%)',
  [HabitWeight.LOW]: 'Low (+0.10%)', 
  [HabitWeight.MEDIUM]: 'Medium (+0.25%)',
  [HabitWeight.HIGH]: 'High (+0.40%)'
};

export const WEIGHT_VALUES = [
  HabitWeight.SMALL,
  HabitWeight.LOW,
  HabitWeight.MEDIUM,
  HabitWeight.HIGH
];
