export interface HabitPair {
  id: string;
  goodHabit: string;
  weight: HabitWeight;
  goalIds?: string[]; // Links to goals
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  createdAt: Date;
}

export enum HabitWeight {
  MICRO = 0.0001,     // 0.010%
  SMALL = 0.0002,     // 0.020%
  MEDIUM = 0.0003,    // 0.030%
  LARGE = 0.0005,     // 0.050%
  KEYSTONE = 0.001    // 0.100%
}

export enum HabitLogState {
  GOOD = 'good',     // Did the good habit
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
  goals: Goal[];
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
