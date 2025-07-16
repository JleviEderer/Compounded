export interface HabitPair {
  id: string;
  goodHabit: string;
  weight: HabitWeight;
  goalIds?: string[]; // Links to goals
  targetCount?: number; // default 7
  targetUnit?: 'week' | 'month' | 'year'; // default 'week'
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
  MICRO = 0.002,      // 0.2% - Small daily impact
  SMALL = 0.005,      // 0.5% - Moderate daily impact  
  MEDIUM = 0.008,     // 0.8% - Standard daily impact
  LARGE = 0.012,      // 1.2% - High daily impact
  KEYSTONE = 0.018    // 1.8% - Transformative daily impact
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
  completed: boolean; // True when habit is marked as completed
}

export interface MomentumData {
  date: string;
  value: number;
  dailyRate: number;
  dailyReturn?: number;
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
  [HabitWeight.MICRO]: 'Micro (+0.2%)',
  [HabitWeight.SMALL]: 'Small (+0.5%)',
  [HabitWeight.MEDIUM]: 'Medium (+0.8%)',
  [HabitWeight.LARGE]: 'Large (+1.2%)',
  [HabitWeight.KEYSTONE]: 'Keystone (+1.8%)'
};

export const WEIGHT_VALUES = [
  HabitWeight.MICRO,
  HabitWeight.SMALL,
  HabitWeight.MEDIUM,
  HabitWeight.LARGE,
  HabitWeight.KEYSTONE
];