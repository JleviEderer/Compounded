import { HabitPair, HabitLog, MomentumData, HabitWeight } from '../types';
import { getTodayString } from './date';
import { getMomentumParams, MomentumParams } from '../config/momentum';

// Helper to parse date strings as local midnight instead of UTC
export function toLocalMidnight(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime(); // local TZ
}

/**
 * Calculate daily return R_t according to PRD formula:
 * S_t = Σ (w_i * d_i)                // completed weight
 * misses = Σ (w_i * (1−d_i))         // missed weight
 * P_t = S_t − σ * misses             // slip penalty
 * R_t = logged ? P_t : B             // baseline drift if nothing logged
 */
export function dailyReturn(
  habits: HabitPair[],
  logs: HabitLog[],
  date: string,
  params: MomentumParams
): number {
  // Get logs for this specific date
  const dayLogs = logs.filter(l => l.date === date);

  // If no habits exist, return 0
  if (habits.length === 0) return 0;

  // If nothing logged for any habit on this day, return baseline drift
  if (dayLogs.length === 0) {
    return params.baselineDrift;
  }

  let completedWeight = 0;
  let missedWeight = 0;

  // Calculate completed and missed weights
  for (const habit of habits) {
    const log = dayLogs.find(l => l.habitId === habit.id);
    const weight = normalizeWeight(habit.weight);

    if (log && (log.completed || log.state === 'good')) {
      completedWeight += weight;
    } else {
      missedWeight += weight;
    }
  }

  // Calculate P_t = S_t - σ * misses
  const penalizedReturn = completedWeight + (params.slipPenalty * missedWeight);

  return penalizedReturn;
}

/**
 * Calculate momentum index M_t according to PRD formula:
 * M_t = max(0, (1 + R_t) * β * M_{t-1})
 */
export function calculateMomentumIndex(
  habits: HabitPair[],
  logs: HabitLog[],
  targetDate: Date | number,
  params?: MomentumParams
): number {
  if (habits.length === 0) return 1.0;

  // Get parameters once
  const momentumParams = params || getMomentumParams();

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
    const R_t = dailyReturn(habits, logs, dateStr, momentumParams);

    // Apply formula: M_t = max(0, (1 + R_t) * β * M_{t-1})
    momentum = Math.max(0, (1 + R_t) * momentumParams.decayFactor * momentum);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return momentum;
}

/**
 * Legacy function for backward compatibility
 * Calculates simple daily rate without penalties
 */
export function calculateDailyRate(
  habits: HabitPair[],
  logs: HabitLog[],
  date: string
): number {
  if (import.meta.env.DEV && date === '2025-06-11') {
    console.log('[DRATE]', date,
      logs.filter(l => l.date === date).length,
      logs.filter(l => l.date === date && (l.completed || l.state === 'good')).length
    );
  }
  // Count logs that are completed OR have state 'good' (good-only migration)
  const dayLogs = logs.filter(l => l.date === date && (l.completed || l.state === 'good'));

  let rate = 0;
  for (const log of dayLogs) {
    const habit = habits.find(h => h.id === log.habitId);
    if (habit) {
      rate += normalizeWeight(habit.weight);
    }
  }
  return rate;     // already weighted sum per day
}

/**
 * Normalize weight to handle floating point precision issues
 */
function normalizeWeight(weight: number): number {
  const validWeights = Object.values(HabitWeight) as number[];

  // Check if weight is close to any valid enum value (handle floating point precision)
  const tolerance = 0.000001;
  const matchingWeight = validWeights.find(w => Math.abs(w - weight) < tolerance);

  if (matchingWeight !== undefined) {
    return matchingWeight;
  } else if (import.meta.env.DEV) {
    console.warn(`Unknown weight value ${weight}, defaulting to MEDIUM`);
    return HabitWeight.MEDIUM;
  }

  return weight;
}

export function generateMomentumHistory(
  habits: HabitPair[], 
  logs: HabitLog[], 
  days: number = 30,
  params?: MomentumParams,
  allLogs?: HabitLog[] // Add parameter for full historical logs
): MomentumData[] {
  const result: MomentumData[] = [];

  // If no logs, return empty array
  if (logs.length === 0) return result;

  // Get parameters once
  const momentumParams = params || getMomentumParams();

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

  console.log(`Momentum history: ${actualDays} days from ${startDate.toLocaleDateString('en-CA')} to ${actualEndDate.toLocaleDateString('en-CA')}`);

  // Use local timezone for "today" and optimize lookup with Set
  const todayStr = getTodayString();
  const logDateSet = new Set(logDates); // O(1) lookup instead of O(n)
  const shouldIncludeToday = !logDateSet.has(todayStr);

  // Debug: Track momentum values to understand chart flatness
  const momentumValues: number[] = [];

  for (let i = actualDays - 1; i >= 0; i--) {
    const date = new Date(actualEndDate);
    date.setDate(date.getDate() - i);
    // Use local date instead of UTC slice
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Skip dates before our filtered start date
    if (dateStr < logDates[0]) continue;

    // Use full logs for momentum calculation, filtered logs for daily rate
    const logsForMomentum = allLogs || logs; // Use full logs if provided, otherwise use filtered logs
    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    const dailyReturn_ = dailyReturn(habits, logs, dateStr, momentumParams);
    const momentum = calculateMomentumIndex(habits, logsForMomentum, toLocalMidnight(dateStr), momentumParams);
    const epoch = toLocalMidnight(dateStr);

    momentumValues.push(momentum);

    result.push({
      date: dateStr,
      value: momentum,
      dailyRate,
      dailyReturn: dailyReturn_,
      epoch,
      isProjection: false
    });
  }

  // Debug: Log momentum range to understand flatness
  if (momentumValues.length > 0) {
    const min = Math.min(...momentumValues);
    const max = Math.max(...momentumValues);
    const range = max - min;
    const avgGrowth = actualDays > 1 ? ((max / min - 1) * 100) : 0;
    console.log(`📊 Momentum Debug for ${actualDays}d: min=${min.toFixed(6)}, max=${max.toFixed(6)}, range=${range.toFixed(6)}, growth=${avgGrowth.toFixed(2)}%`);
  }

  return result;
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

// Dynamic success rate that works with filtered logs for exact time periods
export function calculateDynamicSuccessRate(
  habits: HabitPair[],
  filteredLogs: HabitLog[]
): number {
  let totalLogged = 0;
  let totalGood = 0;

  // Get all unique dates from the filtered logs
  const relevantDates = Array.from(new Set(filteredLogs.map(l => l.date))).sort();

  for (const dateStr of relevantDates) {
    for (const habit of habits) {
      const log = filteredLogs.find(l => l.habitId === habit.id && l.date === dateStr);
      if (log && log.state !== 'unlogged') {
        totalLogged++;
        if (log.state === 'good') {
          totalGood++;
        }
      }
    }
  }

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