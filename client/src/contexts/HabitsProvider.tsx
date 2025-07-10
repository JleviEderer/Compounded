
import { ReactNode } from 'react';
import { HabitsContext } from './HabitsContext';
import { useHabits } from '../hooks/useHabits';

interface HabitsProviderProps {
  children: ReactNode;
}

export const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const habitsValue = useHabits();

  return (
    <HabitsContext.Provider value={habitsValue}>
      {children}
    </HabitsContext.Provider>
  );
};
