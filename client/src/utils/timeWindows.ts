
import { differenceInDays, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import { HabitLog } from '../types';

export const TIME_WINDOWS = {
  '30d': 30,          // default
  'quarter': 90,      // or true quarter logic
  'year': 365,
  'all': -1           // sentinel = since first log
} as const;

export type TimeWindowKey = keyof typeof TIME_WINDOWS;

/**
 * Get human-readable label for time window
 */
export function humanLabel(timeWindow: TimeWindowKey): string {
  switch (timeWindow) {
    case '30d':
      return '30 days';
    case 'quarter':
      return 'quarter';
    case 'year':
      return 'year';
    case 'all':
      return 'all time';
    default:
      return '30 days';
  }
}

/**
 * Get date range for a given time window
 * TODO: Consider switching 'quarter' from 90 days to true calendar quarters
 */
export function getWindowRange(key: TimeWindowKey, logs: HabitLog[]): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  
  if (key === 'all') {
    // Find the earliest log date
    if (logs.length === 0) {
      return { start: end, end };
    }
    
    const earliestDate = logs.reduce((earliest, log) => {
      const logDate = new Date(log.date);
      return logDate < earliest ? logDate : earliest;
    }, new Date(logs[0].date));
    
    return { start: startOfDay(earliestDate), end };
  }
  
  const days = TIME_WINDOWS[key];
  const start = startOfDay(subDays(end, days - 1)); // -1 to include today
  
  return { start, end };
}
