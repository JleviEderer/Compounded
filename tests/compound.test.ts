import { describe, it, expect } from 'vitest';
import { 
  calculateMomentumIndex, 
  calculateDailyRate, 
  generateMomentumHistory,
  generate30DayProjection,
  calculateSuccessRate,
  validateCompoundFormula
} from '../client/src/utils/compound';
import { HabitPair, HabitLog, HabitWeight } from '../client/src/types';

describe('Compound Growth Calculations', () => {
  const mockHabits: HabitPair[] = [
    {
      id: '1',
      goodHabit: 'Read',
      badHabit: 'Scroll',
      weight: HabitWeight.MEDIUM, // 0.0025
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      goodHabit: 'Exercise',
      badHabit: 'Sit',
      weight: HabitWeight.LOW, // 0.001
      createdAt: new Date('2024-01-01')
    }
  ];

  const mockLogs: HabitLog[] = [
    { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', completed: true },
    { id: '1-2024-01-02', habitId: '1', date: '2024-01-02', completed: true },
    { id: '2-2024-01-01', habitId: '2', date: '2024-01-01', completed: false },
    { id: '2-2024-01-02', habitId: '2', date: '2024-01-02', completed: true },
  ];

  it('should validate the compound formula: 1.001^365 ≈ 1.440194', () => {
    expect(validateCompoundFormula()).toBe(true);
    
    // Direct calculation check
    const result = Math.pow(1.001, 365);
    expect(result).toBeCloseTo(1.440194, 5);
  });

  it('should calculate daily rate correctly', () => {
    // Day 1: only habit 1 completed (weight 0.0025)
    const rate1 = calculateDailyRate(mockHabits, mockLogs, '2024-01-01');
    expect(rate1).toBe(0.0025);

    // Day 2: both habits completed (0.0025 + 0.001 = 0.0035)
    const rate2 = calculateDailyRate(mockHabits, mockLogs, '2024-01-02');
    expect(rate2).toBe(0.0035);

    // Day with no logs
    const rate3 = calculateDailyRate(mockHabits, mockLogs, '2024-01-03');
    expect(rate3).toBe(0);
  });

  it('should calculate momentum index with compound growth', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-02');
    
    const momentum = calculateMomentumIndex(mockHabits, mockLogs, endDate);
    
    // Expected: 1.0 * (1 + 0.0025) * (1 + 0.0035) = 1.006508
    expect(momentum).toBeCloseTo(1.006508, 6);
  });

  it('should clamp momentum index to >= 0', () => {
    // Test with empty logs (should stay at 1.0)
    const momentum = calculateMomentumIndex(mockHabits, [], new Date('2024-01-01'));
    expect(momentum).toBeGreaterThanOrEqual(0);
    expect(momentum).toBe(1.0);
  });

  it('should generate momentum history', () => {
    const history = generateMomentumHistory(mockHabits, mockLogs, 3);
    
    expect(history).toHaveLength(3);
    expect(history[0]).toHaveProperty('date');
    expect(history[0]).toHaveProperty('value');
    expect(history[0]).toHaveProperty('dailyRate');
    
    // Values should be cumulative (each day builds on previous)
    expect(history[1].value).toBeGreaterThanOrEqual(history[0].value);
  });

  it('should generate 30-day projection', () => {
    const projection = generate30DayProjection(mockHabits, mockLogs);
    
    expect(projection).toHaveLength(30);
    expect(projection[0]).toHaveProperty('date');
    expect(projection[0]).toHaveProperty('value');
    expect(projection[0]).toHaveProperty('dailyRate');
    
    // Projection should show growth based on trailing average
    expect(projection[29].value).toBeGreaterThan(projection[0].value);
  });

  it('should calculate success rate', () => {
    // 3 out of 4 total possible completions = 75%
    const successRate = calculateSuccessRate(mockHabits, mockLogs, 2);
    expect(successRate).toBe(75);
    
    // No logs should give 0%
    const zeroRate = calculateSuccessRate(mockHabits, [], 1);
    expect(zeroRate).toBe(0);
  });

  it('should handle edge cases', () => {
    // Empty habits array
    const emptyHabitsMomentum = calculateMomentumIndex([], mockLogs, new Date());
    expect(emptyHabitsMomentum).toBe(1.0);
    
    // Future date projection
    const futureDate = new Date('2025-01-01');
    const futureMomentum = calculateMomentumIndex(mockHabits, mockLogs, futureDate);
    expect(futureMomentum).toBeGreaterThanOrEqual(1.0);
  });

  it('should maintain precision in compound calculations', () => {
    // Test with many small increments
    const smallHabits: HabitPair[] = [{
      id: 'small',
      goodHabit: 'Small habit',
      badHabit: 'Small bad',
      weight: HabitWeight.SMALL, // 0.0005
      createdAt: new Date('2024-01-01')
    }];
    
    const dailyLogs: HabitLog[] = [];
    for (let i = 0; i < 100; i++) {
      const date = new Date('2024-01-01');
      date.setDate(date.getDate() + i);
      dailyLogs.push({
        id: `small-${date.toISOString().split('T')[0]}`,
        habitId: 'small',
        date: date.toISOString().split('T')[0],
        completed: true
      });
    }
    
    const endDate = new Date('2024-04-10'); // ~100 days later
    const momentum = calculateMomentumIndex(smallHabits, dailyLogs, endDate);
    
    // Should be approximately (1.0005)^100 ≈ 1.0512
    expect(momentum).toBeCloseTo(1.0512, 3);
  });
});
