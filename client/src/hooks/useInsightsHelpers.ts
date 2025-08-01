import { useMemo } from 'react';
import { HabitPair, HabitLog } from '../types';
import { calculateDailyRate, calculateDynamicSuccessRate } from '../utils/compound';
import { differenceInDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, addDays } from 'date-fns';

interface InsightsHelpersReturn {
  calculateDailySuccessRate: (date: string) => number;
  calculateWeeklySuccessRate: (date: string) => number;
  calculateMonthlySuccessRate: (date: string) => number;
  calculateQuarterlySuccessRate: (date: string) => number;
  calculateYearlySuccessRate: (date: string) => number;
  getSuccessRateForPeriod: (startDate: Date, endDate: Date) => number;
}

// TODO: Performance optimization - consider memoizing habitLogs map per date range
// Micro-benchmark: If heat-map rendering becomes sluggish with >100 habits or >1000 logs,
// pre-compute a `habitId → completedLogs[]` map once per requested time range
// and reuse it across all grid cells to avoid repeated filtering operations.
import { HabitPair, HabitLog } from '../types';
import { calculateDailyRate } from '../utils/compound';
import { calculateAggregatedSuccessRate, expectedForRange } from '../utils/frequencyHelpers';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  getYear, 
  getMonth,
  startOfQuarter,
  endOfQuarter,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachMonthOfInterval,
  startOfYear,
  endOfYear
} from 'date-fns';

export function getCurrentStreak(habits: HabitPair[], logs: HabitLog[]) {
  if (habits.length === 0) return 0;

  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toLocaleDateString('en-CA');

    const dayLogs = logs.filter(log => log.date === dateString);
    const hasGoodHabits = dayLogs.some(log => log.state === 'good');

    if (hasGoodHabits) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getCalendarDays(habits: HabitPair[], logs: HabitLog[], anchor: Date) {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);

  // Get all days in the month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create calendar grid with leading/trailing days for complete weeks
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  // Get start of week for first day (Monday = 1, Sunday = 0)
  const gridStart = startOfWeek(firstDay, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(lastDay, { weekStartsOn: 1 });

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return allDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isCurrentMonth = getMonth(day) === getMonth(anchor);
    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    // Calculate frequency-aware success rate for the day
    let successRate: number | undefined;
    if (isCurrentMonth) {
      const habitLogs: { [habitId: string]: number } = {};
      habits.forEach(habit => {
        const dayLog = logs.find(l => l.habitId === habit.id && l.date === dateStr);
        habitLogs[habit.id] = dayLog?.state === 'good' ? 1 : 0;
      });
      successRate = calculateAggregatedSuccessRate(habits, habitLogs, day, day);
    }

    return {
      date: format(day, 'MMM d'),
      dateISO: dateStr,
      intensity: isCurrentMonth ? calculateDailyRate(habits, logs, dateStr) : null,
      day: isCurrentMonth ? day.getDate() : null,
      isToday,
      successRate
    };
  });
}

export function getQuarterWeeks(habits: HabitPair[], logs: HabitLog[], quarterAnchor: Date) {
  const quarterStart = startOfQuarter(quarterAnchor);
  const quarterEnd = endOfQuarter(quarterAnchor);

  // Get all weeks in the quarter
  const weeks = eachWeekOfInterval(
    { start: quarterStart, end: quarterEnd },
    { weekStartsOn: 1 } // Monday
  );

  const result = [];

  for (const weekStart of weeks) {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Create a cell for each day of the week
    for (const day of weekDays) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
      
      // Calculate daily rate and success rate
      const dailyRate = calculateDailyRate(habits, logs, dateStr);
      
      // Calculate frequency-aware success rate for this day
      const habitLogs: { [habitId: string]: number } = {};
      habits.forEach(habit => {
        const dayLog = logs.find(l => l.habitId === habit.id && l.date === dateStr);
        habitLogs[habit.id] = dayLog?.state === 'good' ? 1 : 0;
      });
      const successRate = calculateAggregatedSuccessRate(habits, habitLogs, day, day);

      result.push({
        date: format(day, 'MMM d'),
        dateISO: dateStr,
        intensity: dailyRate,
        isToday,
        successRate
      });
    }
  }

  return result;
}

export function getAllTimeYears(habits: HabitPair[], logs: HabitLog[]) {
  if (logs.length === 0) return [];

  // Get date range from logs
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const firstLogDate = new Date(sortedLogs[0].date);
  const lastLogDate = new Date(sortedLogs[sortedLogs.length - 1].date);

  // Get all years from first log to current year
  const currentYear = new Date().getFullYear();
  const startYear = firstLogDate.getFullYear();
  const endYear = Math.max(lastLogDate.getFullYear(), currentYear);

  const result = [];

  for (let year = startYear; year <= endYear; year++) {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));

    // Get all months in the year
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    months.forEach(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Get logs for this month
      const monthLogs = logs.filter(log => 
        log.date >= format(monthStart, 'yyyy-MM-dd') && 
        log.date <= format(monthEnd, 'yyyy-MM-dd')
      );

      // Calculate average daily rate for the month
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const monthRates = monthDays.map(day => 
        calculateDailyRate(habits, logs, format(day, 'yyyy-MM-dd'))
      );
      const avgRate = monthRates.reduce((sum, rate) => sum + rate, 0) / monthRates.length;

      // Calculate frequency-aware success rate for the month
      const habitLogs: { [habitId: string]: number } = {};
      habits.forEach(habit => {
        const completedCount = monthLogs.filter(l => 
          l.habitId === habit.id && l.state === 'good'
        ).length;
        habitLogs[habit.id] = completedCount;
      });
      const successRate = calculateAggregatedSuccessRate(habits, habitLogs, monthStart, monthEnd);

      result.push({
        date: format(month, 'yyyy-MM'),
        dateISO: format(monthStart, 'yyyy-MM-dd'),
        intensity: avgRate,
        month: format(month, 'MMM'),
        year: year,
        successRate
      });
    });
  }

  return result;
}

export function getIntensityColor(intensity: number) {
  if (intensity === 0) return 'bg-gray-100 dark:bg-gray-700';
  if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-800';
  if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
  if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
  return 'bg-emerald-500 dark:bg-emerald-500';
}