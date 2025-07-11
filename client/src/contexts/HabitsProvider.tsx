import { ReactNode, useState, useEffect, useCallback } from 'react';
import { HabitsContext } from './HabitsContext';
import { HabitPair, HabitLog, HabitLogState, HabitWeight } from '../types';
import { dataService } from '../services/dataService';
import { generateId } from '../utils/date';
import { OfflineFirstDebouncer } from '../utils/debouncer';
import { GoalsProvider } from './GoalsContext';
import { FEATURE_FLAGS } from '../utils/featureFlags';

interface HabitsProviderProps {
  children: ReactNode;
}

export const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const contextValue = useHabits();

  const content = (
    <HabitsContext.Provider value={contextValue}>
      {children}
    </HabitsContext.Provider>
  );

  // Wrap with GoalsProvider when GOALS_V1 flag is enabled
  if (FEATURE_FLAGS.GOALS_V1) {
    return (
      <GoalsProvider>
        {content}
      </GoalsProvider>
    );
  }

  return content;
};