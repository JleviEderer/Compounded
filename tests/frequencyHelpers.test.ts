
import { describe, it, expect } from 'vitest';
import { expectedForRange, calculateHabitSuccessRate, calculateAggregatedSuccessRate } from '../client/src/utils/frequencyHelpers';
import { HabitPair, HabitWeight } from '../client/src/types';

const mockHabit = (targetCount: number, targetUnit: 'week' | 'month' | 'year'): HabitPair => ({
  id: 'test-habit',
  goodHabit: 'Test Habit',
  weight: HabitWeight.MEDIUM,
  targetCount,
  targetUnit,
  createdAt: new Date()
});

describe('expectedForRange', () => {
  it('calculates expected logs for weekly frequency', () => {
    const habit = mockHabit(3, 'week'); // 3 times per week
    const start = new Date('2025-01-01'); // Wednesday
    const end = new Date('2025-01-07');   // Tuesday (7 days total)
    
    // 3 times per week over 7 days = 3 logs expected
    expect(expectedForRange(habit, start, end)).toBe(3);
  });

  it('calculates expected logs for daily frequency (7 times per week)', () => {
    const habit = mockHabit(7, 'week');
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');   // 7 days
    
    // 7 times per week over 7 days = 7 logs expected
    expect(expectedForRange(habit, start, end)).toBe(7);
  });

  it('calculates expected logs for partial week', () => {
    const habit = mockHabit(7, 'week');
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-03');   // 3 days
    
    // 7 times per week over 3 days = 3 logs expected
    expect(expectedForRange(habit, start, end)).toBe(3);
  });

  it('calculates expected logs for monthly frequency', () => {
    const habit = mockHabit(6, 'month'); // 6 times per month
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-15');   // 15 days (half month)
    
    // 6 times per month over 15 days = 3 logs expected (6/30 * 15)
    expect(expectedForRange(habit, start, end)).toBe(3);
  });

  it('calculates expected logs for yearly frequency', () => {
    const habit = mockHabit(12, 'year'); // 12 times per year
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-31');   // 31 days
    
    // 12 times per year over 31 days = 1 log expected (12/365 * 31 ≈ 1.02, Math.max ensures >= 1)
    expect(expectedForRange(habit, start, end)).toBe(1);
  });

  it('handles single day range', () => {
    const habit = mockHabit(7, 'week');
    const date = new Date('2025-01-01');
    
    // 7 times per week over 1 day = 1 log expected
    expect(expectedForRange(habit, date, date)).toBe(1);
  });

  it('uses defaults for habits without frequency', () => {
    const habit: HabitPair = {
      id: 'test',
      goodHabit: 'Test',
      weight: HabitWeight.MEDIUM,
      createdAt: new Date()
    };
    
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');
    
    // Should default to 7 times per week = 7 logs for 7 days
    expect(expectedForRange(habit, start, end)).toBe(7);
  });

  it('handles leap year correctly', () => {
    const habit = mockHabit(1, 'year');
    const start = new Date('2024-01-01'); // 2024 is a leap year
    const end = new Date('2024-12-31');   // 366 days
    
    // 1 time per year over 366 days = 1 log expected (1/365 * 366 ≈ 1.00)
    expect(expectedForRange(habit, start, end)).toBe(1);
  });

  it('guards against very low frequency returning 0', () => {
    const habit = mockHabit(1, 'year'); // Very infrequent
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-01');   // Single day
    
    // Even for single day with very low frequency, should return at least 1
    expect(expectedForRange(habit, start, end)).toBe(1);
  });
});

describe('calculateHabitSuccessRate', () => {
  it('calculates 100% success rate when completed equals expected', () => {
    const habit = mockHabit(7, 'week');
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');
    
    const rate = calculateHabitSuccessRate(habit, 7, start, end);
    expect(rate).toBe(100);
  });

  it('calculates 50% success rate when completed is half of expected', () => {
    const habit = mockHabit(4, 'week');
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');
    
    const rate = calculateHabitSuccessRate(habit, 2, start, end);
    expect(rate).toBe(50);
  });

  it('caps success rate at 100% even when over-performing', () => {
    const habit = mockHabit(3, 'week');
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');
    
    const rate = calculateHabitSuccessRate(habit, 10, start, end);
    expect(rate).toBe(100);
  });

  it('returns 0% for no completed logs', () => {
    const habit = mockHabit(7, 'week');
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');
    
    const rate = calculateHabitSuccessRate(habit, 0, start, end);
    expect(rate).toBe(0);
  });
});

describe('calculateAggregatedSuccessRate', () => {
  it('calculates weighted success rate across multiple habits', () => {
    const habits = [
      mockHabit(7, 'week'),  // 7 expected for 7 days
      mockHabit(3, 'week')   // 3 expected for 7 days
    ];
    
    const habitLogs = {
      [habits[0].id]: 7, // 7/7 completed = 100%
      [habits[1].id]: 1  // 1/3 completed = 33%
    };
    
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');
    
    const rate = calculateAggregatedSuccessRate(habits, habitLogs, start, end);
    // Weighted: (7 + 1) / (7 + 3) = 8/10 = 80%
    expect(rate).toBe(80);
  });

  it('returns 0 for empty habits array', () => {
    const rate = calculateAggregatedSuccessRate([], {}, new Date(), new Date());
    expect(rate).toBe(0);
  });

  it('handles habits with no logs', () => {
    const habits = [mockHabit(7, 'week')];
    const habitLogs = {}; // No logs
    
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-07');
    
    const rate = calculateAggregatedSuccessRate(habits, habitLogs, start, end);
    expect(rate).toBe(0);
  });
});
