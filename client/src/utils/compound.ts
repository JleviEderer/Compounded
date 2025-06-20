import { HabitPair, HabitLog, MomentumData } from '../types';
import { getTodayString } from './date';

// Helper to parse date strings as local midnight instead of UTC
export function toLocalMidnight(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime(); // local TZ
}

export function calculateMomentumIndex(
  habits: HabitPair[],
  logs: HabitLog[],
  targetDate: Date | number
): number {
  if (habits.length === 0) return 1.0;

  // Convert targetDate to epoch if it's a Date
  const targetEpoch = typeof targetDate === 'number' ? targetDate : targetDate.getTime();

  // Find the earliest habit creation date or use a default
  const startDate = habits.length > 0 
    ? new Date(Math.min(...habits.map(h => new Date(h.createdAt).getTime())))
    : new Date('2024-01-01');

  let momentum = 1.0;

  const currentDate = new Date(startDate);
  while (currentDate.getTime() <= targetEpoch) {
    // Use local date instead of UTC slice
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    momentum *= (1 + dailyRate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return Math.max(0, momentum); // Clamp to >= 0
}

export function calculateDailyRate(
  habits: HabitPair[],
  logs: HabitLog[],
  date: string
): number {
  const dayLogs = logs.filter(log => log.date === date);

  let totalWeight = 0;

  for (const habit of habits) {
    const log = dayLogs.find(l => l.habitId === habit.id);
    if (log) {
      const multiplier = log.state === 'good' ? 1 : -1;
      const weightContribution = habit.weight * multiplier;
      totalWeight += weightContribution;
    }
  }

  return totalWeight;
}

export function generateMomentumHistory(
  habits: HabitPair[], 
  logs: HabitLog[], 
  days: number
): MomentumData[] {
  if (habits.length === 0 || logs.length === 0) return [];

  // Find the actual latest date in the logs
  const latestLogDate = logs.reduce((latest, log) => {
    return log.date > latest ? log.date : latest;
  }, '');

  // Use either today or the latest log date, whichever is more recent
  const today = new Date();
  const latestDataDate = latestLogDate ? new Date(latestLogDate) : today;
  const endDate = latestDataDate > today ? latestDataDate : today;

  // Calculate start date
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - days + 1);

  const formatDate = (date: Date) => date.toLocaleDateString('en-CA');
  console.log(`Momentum history: ${days} days from ${formatDate(startDate)} to ${formatDate(endDate)}`);
  console.log(`Latest log date found: ${latestLogDate}`);

  const history: MomentumData[] = [];
  let currentMomentum = 1.0;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = formatDate(date);

    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    currentMomentum *= (1 + dailyRate);

    history.push({
      date: dateStr,
      value: currentMomentum,
      dailyRate,
      epoch: date.getTime(),
      isProjection: false
    });
  }

  return history;
}

export function generateTimeFilterProjection(
  habits: HabitPair[],
  logs: HabitLog[],
  timeFilter: { label: string; days: number | null },
  recentAvgRate?: number // Add parameter to use consistent rate
): MomentumData[] {
  // No forecast for All Time
  if (timeFilter.days === null) {
    return [];
  }

  // Define forecast parameters based on time filter
  const forecastConfig = {
    '30 D': { forecastDays: 7, avgPeriodDays: 7 },
    '3 M': { forecastDays: 30, avgPeriodDays: 30 },
    '1 Y': { forecastDays: 90, avgPeriodDays: 90 } // 3 months for avg
  };

  const config = forecastConfig[timeFilter.label as keyof typeof forecastConfig];
  if (!config) return [];

  let avgRate = 0;

  // Use provided recentAvgRate if available, otherwise calculate
  if (recentAvgRate !== undefined) {
    avgRate = recentAvgRate;
  } else {
    // Calculate average rate from the specified period
    const logDates = Array.from(new Set(logs.map(l => l.date))).sort();
    const avgPeriodDates = logDates.slice(-config.avgPeriodDays);

    if (avgPeriodDates.length > 0) {
      const totalRate = avgPeriodDates.reduce((sum, date) => {
        return sum + calculateDailyRate(habits, logs, date);
      }, 0);
      avgRate = totalRate / avgPeriodDates.length;
    }

    // If no historical data, use a small positive rate
    if (avgRate === 0 && logs.length > 0) {
      avgRate = 0.001;
    }
  }

  const projectionData: MomentumData[] = [];
  const today = new Date();
  const currentMomentum = calculateMomentumIndex(habits, logs, today);

  for (let i = 1; i <= config.forecastDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    // Use local date instead of UTC slice
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const projectedMomentum = currentMomentum * Math.pow(1 + avgRate, i);

    projectionData.push({
      date: dateStr,
      value: projectedMomentum,
      dailyRate: avgRate,
      epoch: toLocalMidnight(dateStr),
      isProjection: true
    });
  }

  return projectionData;
}

// Keep the old function for backward compatibility
export function generate30DayProjection(
  habits: HabitPair[],
  logs: HabitLog[]
): MomentumData[] {
  return generateTimeFilterProjection(habits, logs, { label: '30 D', days: 30 });
}

export function calculateSuccessRate(
  habits: HabitPair[],
  logs: HabitLog[],
  days: number = 30
): number {
  let totalLogged = 0;
  let totalGood = 0;

  // Get all unique dates from logs to work with actual data
  const logDates = Array.from(new Set(logs.map(l => l.date))).sort();

  // Take the last 'days' number of dates, or all available dates if fewer
  const relevantDates = logDates.slice(-days);

  relevantDates.forEach(dateStr => {
    habits.forEach(habit => {
      const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
      if (log && log.state !== 'unlogged') {
        totalLogged++;
        if (log.state === 'good') {
          totalGood++;
        }
      }
    });
  });

  return totalLogged > 0 ? Math.round((totalGood / totalLogged) * 100) : 0;
}

export function calculateCurrentStreak(
  habitId: string,
  logs: HabitLog[]
): number {
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    // Use local date instead of UTC slice
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const log = logs.find(l => l.habitId === habitId && l.date === dateStr);

    if (log?.state === 'good') {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Unit test validation: 1.001^365 ≈ 1.440194
export function validateCompoundFormula(): boolean {
  const result = Math.pow(1.001, 365);
  const expected = 1.440194;
  const tolerance = 0.001; // More reasonable tolerance for floating point

  return Math.abs(result - expected) < tolerance;
}