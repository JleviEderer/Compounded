
import { HabitPair } from '../types';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, startOfDay, endOfDay } from 'date-fns';

/**
 * Calculate expected log count for a habit within a date range based on its frequency settings
 */
export function expectedForRange(habit: HabitPair, startDate: Date, endDate: Date): number {
  // Default to 7 × per week if frequency not set
  const targetCount = habit.targetCount ?? 7;
  const targetUnit = habit.targetUnit ?? 'week';
  
  // Normalize dates to start/end of day to avoid timezone issues
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  // Calculate based on target unit
  switch (targetUnit) {
    case 'week': {
      const totalDays = differenceInDays(end, start) + 1; // +1 to include both start and end dates
      const expectedPerDay = targetCount / 7;
      return Math.max(1, Math.round(expectedPerDay * totalDays));
    }
    
    case 'month': {
      const totalDays = differenceInDays(end, start) + 1;
      const expectedPerDay = targetCount / 30; // Approximate month as 30 days
      return Math.max(1, Math.round(expectedPerDay * totalDays));
    }
    
    case 'year': {
      const totalDays = differenceInDays(end, start) + 1;
      const expectedPerDay = targetCount / 365; // Approximate year as 365 days
      return Math.max(1, Math.round(expectedPerDay * totalDays));
    }
    
    default:
      return 1; // Guard against 0 expected
  }
}

/**
 * Calculate success rate for a habit based on completed logs vs expected
 */
export function calculateHabitSuccessRate(
  habit: HabitPair, 
  completedLogs: number, 
  startDate: Date, 
  endDate: Date
): number {
  const expected = expectedForRange(habit, startDate, endDate);
  if (expected === 0) return 0;
  
  const rate = (completedLogs / expected) * 100;
  return Math.min(100, Math.max(0, rate)); // Clamp between 0-100%
}

/**
 * Calculate aggregated success rate for multiple habits (used for goal-level success)
 * Weighted by each habit's expected count, so daily habits count more than infrequent ones
 */
export function calculateAggregatedSuccessRate(
  habits: HabitPair[],
  habitLogs: { [habitId: string]: number }, // Map of habitId to completed log count
  startDate: Date,
  endDate: Date
): number {
  if (habits.length === 0) return 0;
  
  const { completedSum, expectedSum } = habits.reduce(
    (acc, habit) => {
      const expected = expectedForRange(habit, startDate, endDate);
      const completed = habitLogs[habit.id] || 0;
      return {
        completedSum: acc.completedSum + completed,
        expectedSum: acc.expectedSum + expected
      };
    },
    { completedSum: 0, expectedSum: 0 }
  );
  
  if (expectedSum === 0) return 0;
  
  const rate = (completedSum / expectedSum) * 100;
  return Math.min(100, Math.max(0, Math.round(rate))); // Cap at 100% and round to nearest integer
}

/**
 * Get frequency display string for UI
 */
export function getFrequencyDisplayString(habit: HabitPair): string {
  const count = habit.targetCount ?? 7;
  const unit = habit.targetUnit ?? 'week';
  
  const unitShort = unit === 'week' ? 'wk' : unit === 'month' ? 'mo' : 'yr';
  return `${count} × / ${unitShort}`;
}
