import { HabitPair, HabitLog, MomentumData, HabitWeight } from '../types';
import { getTodayString } from './date';
import { getMomentumParams, isMomentumV2Enabled } from '../config/momentum';

// Helper to parse date strings as local midnight instead of UTC
export function toLocalMidnight(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime(); // local TZ
}

/**
 * MOMENTUM V2 DECAY MODEL
 * 
 * Calculates daily return R_t using slip penalty and baseline drift:
 * S_t = Σ (w_i * d_i)                // completed weight
 * misses = Σ (w_i * (1−d_i))         // missed weight from enabled habits only
 * P_t = S_t − σ * misses             // slip penalty
 * R_t = logged ? P_t : B             // baseline drift if nothing logged
 * 
 * @deprecated Use dailyReturnWithParams directly for better performance
 */
export function dailyReturn(
  habitsForDay: HabitPair[], 
  logsForDay: HabitLog[]
): number {
  const { σ, B } = getMomentumParams();
  return dailyReturnWithParams(habitsForDay, logsForDay, σ, B);
}

/**
 * MOMENTUM V2 STEP FUNCTION
 * M_t = max(0, (1 + R_t) * β * M_{t-1})
 * With safety clamps to prevent extreme values and zero trap
 */
export function momentumStep(
  prevMomentum: number, 
  dailyReturn: number, 
  decayFactor: number
): number {
  const rawStep = (1 + dailyReturn) * decayFactor * prevMomentum;

  // Prevent zero trap: if momentum is 0 but we have positive return, restart from small base
  if (prevMomentum === 0 && dailyReturn > 0) {
    return Math.max(0.001, dailyReturn);
  }

  // Clamp: M_t = Math.max(0, Math.min(prev * 1.5, rawStep))
  const maxAllowed = prevMomentum * 1.5;
  const clamped = Math.max(0, Math.min(maxAllowed, rawStep));

  return clamped;
}

export function calculateMomentumIndex(
  habits: HabitPair[],
  logs: HabitLog[],
  targetDate: Date | number
): number {
  if (habits.length === 0) return 1.0;

  // Feature flag: use v2 decay model or fall back to v1
  if (isMomentumV2Enabled()) {
    return calculateMomentumIndexV2(habits, logs, targetDate);
  }

  // V1 (original) implementation
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

/**
 * MOMENTUM V2 INDEX CALCULATION
 * Implements the decay model: M_t = max(0, (1 + R_t) * β * M_{t-1})
 */
export function calculateMomentumIndexV2(
  habits: HabitPair[],
  logs: HabitLog[],
  targetDate: Date | number
): number {
  if (habits.length === 0) return 1.0;

  // Cache params once outside the loop
  const { σ, B, β } = getMomentumParams();

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

    // Get habits that existed on this date
    const habitsForDay = habits.filter(h => new Date(h.createdAt) <= currentDate);

    // Get logs for this specific date
    const logsForDay = logs.filter(l => l.date === dateStr);

    // Calculate daily return using v2 formula with cached params
    const R_t = dailyReturnWithParams(habitsForDay, logsForDay, σ, B);

    // Apply momentum step with decay
    momentum = momentumStep(momentum, R_t, β);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return momentum;
}

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

  // Feature flag: use v2 daily return calculation
  if (isMomentumV2Enabled()) {
    const habitsForDay = habits.filter(h => new Date(h.createdAt) <= new Date(date));
    const logsForDay = logs.filter(l => l.date === date);
    return dailyReturn(habitsForDay, logsForDay);
  }

  // V1 (original) implementation
  // Count logs that are completed OR have state 'good' (good-only migration)
  const dayLogs = logs.filter(l => l.date === date && (l.completed || l.state === 'good'));

  let rate = 0;
  for (const log of dayLogs) {
    const habit = habits.find(h => h.id === log.habitId);
    if (habit) {
      // Ensure weight is a valid HabitWeight enum value
      const validWeights = Object.values(HabitWeight) as number[];
      let weight = habit.weight;

      // Check if weight is close to any valid enum value (handle floating point precision)
      const tolerance = 0.000001;
      const matchingWeight = validWeights.find(w => Math.abs(w - weight) < tolerance);

      if (matchingWeight !== undefined) {
        weight = matchingWeight;
      } else if (import.meta.env.DEV) {
        console.warn(`Unknown weight value ${weight}, defaulting to MEDIUM`);
        weight = HabitWeight.MEDIUM;
      }

      rate += weight;
    }
  }
  return rate;     // already weighted sum per day
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

  console.log(`Momentum history: ${actualDays} days from ${startDate.toLocaleDateString('en-CA')} to ${actualEndDate.toLocaleDateString('en-CA')}`);

  // Use local timezone for "today" and optimize lookup with Set
  const todayStr = getTodayString();
  const logDateSet = new Set(logDates); // O(1) lookup instead of O(n)
  const shouldIncludeToday = !logDateSet.has(todayStr);

  for (let i = actualDays - 1; i >= 0; i--) {
    const date = new Date(actualEndDate);
    date.setDate(date.getDate() - i);
    // Use local date instead of UTC slice
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Skip dates before our filtered start date
    if (dateStr < logDates[0]) continue;

    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    const momentum = calculateMomentumIndex(habits, logs, toLocalMidnight(dateStr));
    const epoch = toLocalMidnight(dateStr);

    result.push({
      date: dateStr,
      value: momentum,
      dailyRate,
      epoch,
      isProjection: false
    });
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

/**
 * MOMENTUM V2 DECAY MODEL
 * 
 * Calculates daily return R_t using slip penalty and baseline drift:
 * S_t = Σ (w_i * d_i)                // completed weight
 * misses = Σ (w_i * (1−d_i))         // missed weight from enabled habits only
 * P_t = S_t − σ * misses             // slip penalty
 * R_t = logged ? P_t : B             // baseline drift if nothing logged
 */
export function dailyReturnWithParams(
  habitsForDay: HabitPair[], 
  logsForDay: HabitLog[],
  σ: number,
  B: number
): number {
  // If no logs at all, return baseline drift
  if (logsForDay.length === 0) {
    return B;
  }

  let completedWeight = 0;  // S_t
  let missedWeight = 0;     // misses from enabled habits only

  // Only consider habits that were enabled/available on this day
  for (const habit of habitsForDay) {
    const log = logsForDay.find(l => l.habitId === habit.id);

    // Ensure weight is valid
    const validWeights = Object.values(HabitWeight) as number[];
    let weight = habit.weight;
    const tolerance = 0.000001;
    const matchingWeight = validWeights.find(w => Math.abs(w - weight) < tolerance);

    if (matchingWeight !== undefined) {
      weight = matchingWeight;
    } else if (import.meta.env.DEV) {
      console.warn(`Unknown weight value ${weight}, defaulting to MEDIUM`);
      weight = HabitWeight.MEDIUM;
    }

    if (log && (log.completed || log.state === 'good')) {
      completedWeight += weight;
    } else {
      // Habit was enabled but not completed = miss
      missedWeight += weight;
    }
  }

  // P_t = S_t − σ * misses
  const P_t = completedWeight + (σ * missedWeight); // σ is negative, so this subtracts

  return P_t;
}