
import { createContext, useContext } from 'react';
import { HabitPair, HabitLog, HabitLogState, HabitWeight } from '../types';

interface AppData {
  habits: HabitPair[];
  logs: HabitLog[];
  settings: {
    theme: 'light' | 'dark';
    nerdMode: boolean;
  };
}

interface HabitsContextValue {
  habits: HabitPair[];
  logs: HabitLog[];
  settings: AppData['settings'];
  isSaving: boolean;
  lastSavedHabitId: string | null;
  logsUpdatedAt: number;
  addHabit: (goodHabit: string, weight: HabitWeight) => void;
  updateHabit: (id: string, updates: Partial<HabitPair>) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (newOrder: HabitPair[]) => void;
  logHabit: (habitId: string, date: string, state: HabitLogState) => void;
  getHabitLog: (habitId: string, date: string) => HabitLog | undefined;
  updateSettings: (updates: Partial<AppData['settings']>) => void;
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
  resetData: () => void;
}

export const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export const useHabitsContext = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabitsContext must be used within a HabitsProvider');
  }
  return context;
};
