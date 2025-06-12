import { HabitPair, HabitLog, MomentumData } from '../types';

export function calculateMomentumIndex(
  habits: HabitPair[],
  logs: HabitLog[],
  targetDate: Date
): number {
  if (habits.length === 0) return 1.0;
  
  // Start from the earliest habit creation date
  const earliestHabit = habits.reduce((earliest, habit) => 
    habit.createdAt < earliest.createdAt ? habit : earliest
  );
  const startDate = new Date(earliestHabit.createdAt);
  
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
  let totalWeight = 0;
  
  habits.forEach(habit => {
    const log = logs.find(l => l.habitId === habit.id && l.date === date);
    if (log) {
      if (log.state === 'good') {
        totalWeight += habit.weight; // Positive weight for good habit
      } else if (log.state === 'bad') {
        totalWeight -= habit.weight; // Negative weight for bad habit
      }
      // No change for 'unlogged' state - neutral
    }
  });
  
  return totalWeight;
}

export function generateMomentumHistory(
  habits: HabitPair[],
  logs: HabitLog[],
  days: number = 30
): MomentumData[] {
  const data: MomentumData[] = [];
  const today = new Date();
  
  // Ensure we include "today" in the chart
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const momentum = calculateMomentumIndex(habits, logs, date);
    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    
    data.push({
      date: dateStr,
      value: momentum,
      dailyRate
    });
  }
  
  return data;
}

export function generate30DayProjection(
  habits: HabitPair[],
  logs: HabitLog[]
): MomentumData[] {
  // Calculate trailing 7-day average rate
  const last7Days = generateMomentumHistory(habits, logs, 7);
  const avgRate = last7Days.reduce((sum, day) => sum + day.dailyRate, 0) / 7;
  
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
  const endDate = new Date();
  let totalLogged = 0;
  let totalGood = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    habits.forEach(habit => {
      const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
      if (log && log.state !== 'unlogged') {
        totalLogged++;
        if (log.state === 'good') {
          totalGood++;
        }
      }
    });
  }
  
  return totalLogged > 0 ? (totalGood / totalLogged) * 100 : 0;
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
  const tolerance = 0.000001;
  
  return Math.abs(result - expected) < tolerance;
}
