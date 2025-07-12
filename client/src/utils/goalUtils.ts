
import { Goal } from '@/types';
import { differenceInDays } from 'date-fns';

export function getGoalHorizon(targetDate?: Date): 'short' | 'mid' | 'long' | 'none' {
  if (!targetDate) return 'none';
  
  const today = new Date();
  const durationDays = differenceInDays(targetDate, today);
  
  if (durationDays <= 90) return 'short';
  if (durationDays <= 365) return 'mid';
  return 'long';
}

export function sortGoalsByHorizon(goals: Goal[]): Goal[] {
  const horizonOrder = { short: 0, mid: 1, long: 2, none: 3 };
  
  return [...goals].sort((a, b) => {
    const horizonA = getGoalHorizon(a.targetDate);
    const horizonB = getGoalHorizon(b.targetDate);
    
    return horizonOrder[horizonA] - horizonOrder[horizonB];
  });
}
