export interface HabitPair {
  id: string;
  goodHabit: string;
  badHabit: string;
  weight: HabitWeight;
  createdAt: Date;
}

export enum HabitWeight {
  MICRO = 0.0001,     // 0.01%
  SMALL = 0.00025,    // 0.025%
  MEDIUM = 0.0004,    // 0.04%
  LARGE = 0.0008,     // 0.08%
  KEYSTONE = 0.0018   // 0.18%
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

export const WEIGHT_VALUES = [
  HabitWeight.MICRO,
  HabitWeight.SMALL,
  HabitWeight.MEDIUM,
  HabitWeight.LARGE,
  HabitWeight.KEYSTONE
];

export const WEIGHT_LABELS = {
  [HabitWeight.MICRO]: 'Micro (+0.01%)',
  [HabitWeight.SMALL]: 'Small (+0.025%)',
  [HabitWeight.MEDIUM]: 'Medium (+0.04%)',
  [HabitWeight.LARGE]: 'Large (+0.08%)',
  [HabitWeight.KEYSTONE]: 'Keystone (+0.18%)'
};