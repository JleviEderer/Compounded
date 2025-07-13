import { ReactNode, useState, useEffect, useCallback } from 'react';
import { HabitsContext } from './HabitsContext';
import { HabitPair, HabitLog, HabitLogState, HabitWeight } from '../types';
import { dataService } from '../services/dataService';
import { generateId } from '../utils/date';
import { OfflineFirstDebouncer } from '../utils/debouncer';
import { GoalsProvider } from './GoalsContext';
import { useHabits } from '../hooks/useHabits';

interface HabitsProviderProps {
  children: ReactNode;
}

export const HabitsProvider = ({ children }: HabitsProviderProps) => {
  return (
    <GoalsProvider>
      <HabitsContext.Provider value={useHabits()}>
        {children}
      </HabitsContext.Provider>
    </GoalsProvider>
  );
};