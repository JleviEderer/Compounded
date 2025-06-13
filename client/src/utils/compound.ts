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
  console.log(`Calculating daily rate for ${date}`);
  console.log('Available habits:', habits.map(h => ({ id: h.id, weight: h.weight })));
  console.log(`Total logs passed to calculateDailyRate: ${logs.length}`);

  // Debug: Show sample of logs being passed in
  const logsForDate = logs.filter(l => l.date === date);
  console.log(`Logs found for ${date}:`, logsForDate);

  // Debug: Show sample of all log dates
  const allLogDates = Array.from(new Set(logs.map(l => l.date))).sort();
  console.log(`All log dates available:`, allLogDates.slice(0, 10)); // Show first 10 dates

  let totalWeight = 0;

  for (const habit of habits) {
    const log = logs.find(l => l.habitId === habit.id && l.date === date);
    const weight = habit.weight; //getHabitWeight(habit.weight);

    if (log) {
      if (log.state === 'good') { //HabitLogState.GOOD
        console.log(`Habit ${habit.id} on ${date}: good (weight: ${weight})`);
        totalWeight += weight;
      } else if (log.state === 'bad') { //HabitLogState.BAD
        console.log(`Habit ${habit.id} on ${date}: bad (weight: ${weight})`);
        totalWeight -= weight;
      }
    } else {
      console.log(`Habit ${habit.id} on ${date}: no log found`);
    }
  }

  console.log(`Total weight for ${date}: ${totalWeight}`);
  return totalWeight;
}

export function generateMomentumHistory(
  habits: HabitPair[],
  logs: HabitLog[],
  days: number = 30
): MomentumData[] {
  const data: MomentumData[] = [];
  let momentum = 1.0;

  // Center today's date: show half the days before today, half after
  const daysBack = Math.floor(days / 2);
  const daysForward = days - daysBack - 1; // -1 for today

  // Generate historical data (before today)
  for (let i = daysBack; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    momentum *= (1 + dailyRate);
    momentum = Math.max(0, momentum);

    data.push({
      date: dateStr,
      value: momentum,
      dailyRate
    });
  }

  // Add today
  const today = new Date().toISOString().split('T')[0];
  const todayRate = calculateDailyRate(habits, logs, today);
  momentum *= (1 + todayRate);
  momentum = Math.max(0, momentum);

  data.push({
    date: today,
    value: momentum,
    dailyRate: todayRate
  });

  // Generate future projection based on 7-day average
  const last7Days = data.slice(-7);
  const avgRate = last7Days.length > 0 
    ? last7Days.reduce((sum, d) => sum + d.dailyRate, 0) / last7Days.length
    : 0.001;

  for (let i = 1; i <= daysForward; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    momentum *= (1 + avgRate);
    momentum = Math.max(0, momentum);

    data.push({
      date: dateStr,
      value: momentum,
      dailyRate: avgRate,
      isProjection: true
    });
  }

  return data;
}

export function generate30DayProjection(
  habits: HabitPair[],
  logs: HabitLog[]
): MomentumData[] {
  // Calculate trailing 7-day average rate from available log data
  const logDates = Array.from(new Set(logs.map(l => l.date))).sort();
  const last7Dates = logDates.slice(-7);

  let avgRate = 0;
  if (last7Dates.length > 0) {
    const totalRate = last7Dates.reduce((sum, date) => {
      return sum + calculateDailyRate(habits, logs, date);
    }, 0);
    avgRate = totalRate / last7Dates.length;
  }

  // If no historical data, use a small positive rate for testing
  if (avgRate === 0 && logs.length > 0) {
    avgRate = 0.001; // Small positive rate for projection
  }

  const projectionData: MomentumData[] = [];
  const startDate = new Date();
  const currentMomentum = calculateMomentumIndex(habits, logs, startDate);

  for (let i = 1; i <= 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const projectedMomentum = currentMomentum * Math.pow(1 + avgRate, i);

    projectionData.push({
      date: date.toISOString().split('T')[0],
      value: projectedMomentum,
      dailyRate: avgRate
    });
  }

  return projectionData;
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