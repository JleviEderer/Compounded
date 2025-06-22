export interface HabitPair {
  id: string;
  goodHabit: string;
  badHabit: string;
  weight: HabitWeight;
  createdAt: Date;
}

export enum HabitWeight {
  MICRO = 0.00010,    // 0.010%
  SMALL = 0.00020,    // 0.020%
  MEDIUM = 0.00030,   // 0.030%
  LARGE = 0.00050,    // 0.050%
  KEYSTONE = 0.00100  // 0.100%
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
  [HabitWeight.MICRO]: 'Micro (+0.010%)',
  [HabitWeight.SMALL]: 'Small (+0.020%)',
  [HabitWeight.MEDIUM]: 'Medium (+0.030%)',
  [HabitWeight.LARGE]: 'Large (+0.050%)',
  [HabitWeight.KEYSTONE]: 'Keystone (+0.100%)'
};

export const WEIGHT_VALUES = [
  HabitWeight.MICRO,
  HabitWeight.SMALL,
  HabitWeight.MEDIUM,
  HabitWeight.LARGE,
  HabitWeight.KEYSTONE
];
