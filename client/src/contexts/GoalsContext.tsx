
import { createContext, useContext, ReactNode } from 'react';
import { Goal } from '@/types';
import { useGoals } from '@/hooks/useGoals';

interface GoalsContextValue {
  goals: Goal[];
  addGoal: (title: string, description?: string, targetDate?: Date) => Goal;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  getGoalById: (id: string) => Goal | undefined;
  refreshGoals: () => void;
}

const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

export const useGoalsContext = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoalsContext must be used within a GoalsProvider');
  }
  return context;
};

interface GoalsProviderProps {
  children: ReactNode;
}

export const GoalsProvider = ({ children }: GoalsProviderProps) => {
  const goalsHook = useGoals();

  return (
    <GoalsContext.Provider value={goalsHook}>
      {children}
    </GoalsContext.Provider>
  );
};
