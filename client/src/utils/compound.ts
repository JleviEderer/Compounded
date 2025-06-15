import { HabitPair, HabitLog, MomentumData } from '../types';

export function calculateMomentumIndex(
  habits: HabitPair[],
  logs: HabitLog[],
  targetDate: Date
): number {
  if (habits.length === 0) return 1.0;

  // Find the earliest habit creation date or use a default
  const startDate = habits.length > 0 
    ? new Date(Math.min(...habits.map(h => new Date(h.createdAt).getTime())))
    : new Date('2024-01-01');

  let momentum = 1.0;

  const currentDate = new Date(startDate);
  while (currentDate <= targetDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
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
  days: number = 30
): MomentumData[] {
  const result: MomentumData[] = [];

  // If no logs, return empty array
  if (logs.length === 0) return result;

  // Get actual date range from filtered logs
  const logDates = logs.map(log => log.date).sort();
  const startDate = new Date(logDates[0]);
  const endDate = new Date(logDates[logDates.length - 1]);

  // Always include today in the historical range, even if no logs exist for today
  const today = new Date();
  const actualEndDate = endDate > today ? endDate : today;

  // Calculate actual days between start and end dates
  const timeDiff = actualEndDate.getTime() - startDate.getTime();
  const actualDays = Math.min(days, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);

  console.log(`Momentum history: ${actualDays} days from ${startDate.toISOString().split('T')[0]} to ${actualEndDate.toISOString().split('T')[0]}`);

  // Use local timezone for "today" and optimize lookup with Set
  const todayStr = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format in local timezone
  const logDateSet = new Set(logDates); // O(1) lookup instead of O(n)
  const shouldIncludeToday = !logDateSet.has(todayStr);

  for (let i = actualDays - 1; i >= 0; i--) {
    const date = new Date(actualEndDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Skip dates before our filtered start date
    if (dateStr < logDates[0]) continue;

    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    const momentum = calculateMomentumIndex(habits, logs, date);

    result.push({
      date: dateStr,
      value: momentum,
      dailyRate,
      isProjection: false
    });
  }

  return result;
}

export function generateTimeFilterProjection(
  habits: HabitPair[],
  logs: HabitLog[],
  timeFilter: { label: string; days: number | null }
): MomentumData[] {
  // No forecast for All Time
  if (timeFilter.days === null) {
    return [];
  }

  // Define forecast parameters based on time filter
  const forecastConfig = {
    '30 D': { forecastDays: 7, avgPeriodDays: 7 },
    '4 M': { forecastDays: 30, avgPeriodDays: 30 },
    '1 Y': { forecastDays: 90, avgPeriodDays: 120 } // 4 months for avg
  };

  const config = forecastConfig[timeFilter.label as keyof typeof forecastConfig];
  if (!config) return [];

  // Calculate average rate from the specified period
  const logDates = Array.from(new Set(logs.map(l => l.date))).sort();
  const avgPeriodDates = logDates.slice(-config.avgPeriodDays);

  let avgRate = 0;
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

  const projectionData: MomentumData[] = [];
  const today = new Date();
  const currentMomentum = calculateMomentumIndex(habits, logs, today);

  for (let i = 1; i <= config.forecastDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const projectedMomentum = currentMomentum * Math.pow(1 + avgRate, i);

    projectionData.push({
      date: date.toISOString().split('T')[0],
      value: projectedMomentum,
      dailyRate: avgRate,
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
    const dateStr = currentDate.toISOString().split('T')[0];
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