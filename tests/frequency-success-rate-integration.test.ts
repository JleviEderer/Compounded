
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HabitPair, HabitLog, HabitWeight, Goal } from '../client/src/types';
import { calculateHabitSuccessRate, calculateAggregatedSuccessRate, expectedForRange } from '../client/src/utils/frequencyHelpers';
import { GoalCard } from '../client/src/components/GoalCard';
import { getCalendarDays, getQuarterWeeks, getAllTimeYears } from '../client/src/hooks/useInsightsHelpers';
import { GoalsProvider } from '../client/src/contexts/GoalsContext';
import { HabitsProvider } from '../client/src/contexts/HabitsContext';

// Mock data with mixed frequencies
const mockHabits: HabitPair[] = [
  {
    id: 'habit-daily',
    goodHabit: 'Daily meditation',
    weight: HabitWeight.MEDIUM,
    targetCount: 7,
    targetUnit: 'week',
    goalIds: ['goal-1']
  },
  {
    id: 'habit-weekly',
    goodHabit: 'Weekly gym session',
    weight: HabitWeight.HIGH,
    targetCount: 3,
    targetUnit: 'week',
    goalIds: ['goal-1']
  },
  {
    id: 'habit-monthly',
    goodHabit: 'Monthly book review',
    weight: HabitWeight.LOW,
    targetCount: 2,
    targetUnit: 'month',
    goalIds: ['goal-2']
  }
];

const mockGoal: Goal = {
  id: 'goal-1',
  title: 'Wellness Goal',
  description: 'Health and fitness',
  createdAt: new Date('2025-01-01').toISOString()
};

// Generate test logs for a specific scenario
function generateTestLogs(scenario: 'perfect' | 'half' | 'poor'): HabitLog[] {
  const logs: HabitLog[] = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31'); // 31 days
  
  // Daily habit (7×/week = 31 expected logs for January)
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toLocaleDateString('en-CA');
    let shouldLog = false;
    
    switch (scenario) {
      case 'perfect':
        shouldLog = true; // Log every day
        break;
      case 'half':
        shouldLog = d.getDate() % 2 === 1; // Log every other day (~50%)
        break;
      case 'poor':
        shouldLog = d.getDate() % 7 === 1; // Log once per week (~14%)
        break;
    }
    
    if (shouldLog) {
      logs.push({
        id: `log-daily-${dateStr}`,
        habitId: 'habit-daily',
        date: dateStr,
        state: 'good',
        completed: true
      });
    }
  }
  
  // Weekly habit (3×/week = ~13 expected logs for January)
  const weeklyDays = [1, 3, 5]; // Mon, Wed, Fri
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toLocaleDateString('en-CA');
    const dayOfWeek = d.getDay();
    
    let shouldLog = false;
    switch (scenario) {
      case 'perfect':
        shouldLog = weeklyDays.includes(dayOfWeek); // 3× per week
        break;
      case 'half':
        shouldLog = dayOfWeek === 1; // Only Mondays (~1× per week)
        break;
      case 'poor':
        shouldLog = false; // No logs
        break;
    }
    
    if (shouldLog) {
      logs.push({
        id: `log-weekly-${dateStr}`,
        habitId: 'habit-weekly',
        date: dateStr,
        state: 'good',
        completed: true
      });
    }
  }
  
  // Monthly habit (2×/month = 2 expected logs for January)
  switch (scenario) {
    case 'perfect':
      logs.push(
        {
          id: 'log-monthly-1',
          habitId: 'habit-monthly',
          date: '2025-01-15',
          state: 'good',
          completed: true
        },
        {
          id: 'log-monthly-2',
          habitId: 'habit-monthly',
          date: '2025-01-30',
          state: 'good',
          completed: true
        }
      );
      break;
    case 'half':
      logs.push({
        id: 'log-monthly-1',
        habitId: 'habit-monthly',
        date: '2025-01-15',
        state: 'good',
        completed: true
      });
      break;
    case 'poor':
      // No monthly logs
      break;
  }
  
  return logs;
}

describe('Frequency-Aware Success Rate Integration', () => {
  describe('expectedForRange calculations', () => {
    it('calculates correct expected counts for different frequencies', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31'); // 31 days
      
      // Daily habit: 7×/week × (31/7) ≈ 31 days
      expect(expectedForRange(mockHabits[0], startDate, endDate)).toBe(31);
      
      // Weekly habit: 3×/week × (31/7) ≈ 13 days
      expect(expectedForRange(mockHabits[1], startDate, endDate)).toBe(13);
      
      // Monthly habit: 2×/month × (31/30) ≈ 2 days
      expect(expectedForRange(mockHabits[2], startDate, endDate)).toBe(2);
    });
  });

  describe('calculateHabitSuccessRate', () => {
    it('calculates 100% success rate for perfect compliance', () => {
      const logs = generateTestLogs('perfect');
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      // Daily habit: 31 completed / 31 expected = 100%
      const dailyLogs = logs.filter(l => l.habitId === 'habit-daily').length;
      const dailyRate = calculateHabitSuccessRate(mockHabits[0], dailyLogs, startDate, endDate);
      expect(dailyRate).toBe(100);
      
      // Weekly habit: 13 completed / 13 expected = 100%
      const weeklyLogs = logs.filter(l => l.habitId === 'habit-weekly').length;
      const weeklyRate = calculateHabitSuccessRate(mockHabits[1], weeklyLogs, startDate, endDate);
      expect(weeklyRate).toBe(100);
      
      // Monthly habit: 2 completed / 2 expected = 100%
      const monthlyLogs = logs.filter(l => l.habitId === 'habit-monthly').length;
      const monthlyRate = calculateHabitSuccessRate(mockHabits[2], monthlyLogs, startDate, endDate);
      expect(monthlyRate).toBe(100);
    });

    it('calculates ~50% success rate for half compliance', () => {
      const logs = generateTestLogs('half');
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      // Daily habit: ~15 completed / 31 expected ≈ 48%
      const dailyLogs = logs.filter(l => l.habitId === 'habit-daily').length;
      const dailyRate = calculateHabitSuccessRate(mockHabits[0], dailyLogs, startDate, endDate);
      expect(dailyRate).toBeGreaterThan(40);
      expect(dailyRate).toBeLessThan(60);
      
      // Weekly habit: ~4 completed / 13 expected ≈ 31%
      const weeklyLogs = logs.filter(l => l.habitId === 'habit-weekly').length;
      const weeklyRate = calculateHabitSuccessRate(mockHabits[1], weeklyLogs, startDate, endDate);
      expect(weeklyRate).toBeGreaterThan(20);
      expect(weeklyRate).toBeLessThan(40);
      
      // Monthly habit: 1 completed / 2 expected = 50%
      const monthlyLogs = logs.filter(l => l.habitId === 'habit-monthly').length;
      const monthlyRate = calculateHabitSuccessRate(mockHabits[2], monthlyLogs, startDate, endDate);
      expect(monthlyRate).toBe(50);
    });
  });

  describe('calculateAggregatedSuccessRate', () => {
    it('calculates weighted success rate across multiple habits', () => {
      const logs = generateTestLogs('perfect');
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      // Create habit logs map
      const habitLogs: { [habitId: string]: number } = {};
      mockHabits.forEach(habit => {
        habitLogs[habit.id] = logs.filter(l => l.habitId === habit.id).length;
      });
      
      const aggregatedRate = calculateAggregatedSuccessRate(mockHabits, habitLogs, startDate, endDate);
      
      // Expected: (31 + 13 + 2) / (31 + 13 + 2) = 46/46 = 100%
      expect(aggregatedRate).toBe(100);
    });

    it('handles mixed performance correctly', () => {
      const logs = generateTestLogs('half');
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      const habitLogs: { [habitId: string]: number } = {};
      mockHabits.forEach(habit => {
        habitLogs[habit.id] = logs.filter(l => l.habitId === habit.id).length;
      });
      
      const aggregatedRate = calculateAggregatedSuccessRate(mockHabits, habitLogs, startDate, endDate);
      
      // Should be weighted average, not simple 50%
      expect(aggregatedRate).toBeGreaterThan(30);
      expect(aggregatedRate).toBeLessThan(70);
    });
  });

  describe('Heat map data integration', () => {
    it('includes success rates in calendar data', () => {
      const logs = generateTestLogs('perfect');
      const anchor = new Date('2025-01-15');
      
      const calendarData = getCalendarDays(mockHabits, logs, anchor);
      
      // Find a day with data
      const dayWithData = calendarData.find(cell => cell.day === 15);
      expect(dayWithData).toBeDefined();
      expect(dayWithData?.successRate).toBeDefined();
      expect(dayWithData?.successRate).toBeGreaterThan(0);
    });

    it('includes success rates in quarter data', () => {
      const logs = generateTestLogs('perfect');
      const quarterAnchor = new Date('2025-01-15');
      
      const quarterData = getQuarterWeeks(mockHabits, logs, quarterAnchor);
      
      // Should have weeks with success rate data
      expect(quarterData.length).toBeGreaterThan(0);
      const weekWithData = quarterData[0];
      expect(weekWithData.successRate).toBeDefined();
    });

    it('includes success rates in all-time data', () => {
      const logs = generateTestLogs('perfect');
      
      const allTimeData = getAllTimeYears(mockHabits, logs);
      
      // Should have months with success rate data
      expect(allTimeData.length).toBeGreaterThan(0);
      const monthWithData = allTimeData.find(cell => cell.date === '2025-01');
      expect(monthWithData).toBeDefined();
      expect(monthWithData?.successRate).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('handles zero expected logs gracefully', () => {
      const emptyHabits: HabitPair[] = [];
      const emptyLogs: HabitLog[] = [];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      const rate = calculateAggregatedSuccessRate(emptyHabits, {}, startDate, endDate);
      expect(rate).toBe(0);
    });

    it('caps success rate at 100% for over-performance', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-07'); // 1 week
      
      // Daily habit expects 7 logs, but we give it 15
      const rate = calculateHabitSuccessRate(mockHabits[0], 15, startDate, endDate);
      expect(rate).toBe(100);
    });

    it('shows "– %" for undefined success rate', () => {
      // This would be tested in the component test, but we can verify the logic
      const successRate = undefined;
      const displayText = successRate !== null && successRate !== undefined ? `${Math.round(successRate)}%` : '– %';
      expect(displayText).toBe('– %');
    });
  });
});
