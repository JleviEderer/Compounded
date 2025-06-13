
/**
 * momentum-calculation-flow.test.ts: Specifically validates the momentum calculations using your real data, testing the exact scenarios we see in your console logs.
 */

import { describe, it, expect } from 'vitest';
import { calculateDailyRate, calculateMomentumIndex } from '../client/src/utils/compound';
import { mockHabits, mockLogs } from '../client/src/data/mockData';

describe('Momentum Calculation Data Flow', () => {
  it('should calculate daily rates for specific dates from console logs', () => {
    // Test the exact dates and scenarios we see in the console
    
    // 2025-06-05: All 4 habits good = +0.0045 daily rate
    const rate20250605 = calculateDailyRate(mockHabits, mockLogs, '2025-06-05');
    expect(rate20250605).toBeCloseTo(0.0045, 4);
    
    // 2025-06-06: Mixed results = -0.001 daily rate
    const rate20250606 = calculateDailyRate(mockHabits, mockLogs, '2025-06-06');
    expect(rate20250606).toBeCloseTo(-0.001, 4);
    
    // 2025-06-07: More bad than good = -0.0025 daily rate
    const rate20250607 = calculateDailyRate(mockHabits, mockLogs, '2025-06-07');
    expect(rate20250607).toBeCloseTo(-0.0025, 4);
  });

  it('should have the expected habit weights matching console logs', () => {
    // From console: Available habits with weights
    const expectedWeights = {
      '1': 0.001,
      '2': 0.0005, 
      '3': 0.0005,
      '4': 0.0025
    };

    mockHabits.forEach(habit => {
      expect(habit.weight).toBe(expectedWeights[habit.id]);
    });
  });

  it('should find logs for specific dates as shown in console', () => {
    // Test 2025-06-05: Should have all 4 habits logged as good
    const logs20250605 = mockLogs.filter(log => log.date === '2025-06-05');
    expect(logs20250605).toHaveLength(4);
    logs20250605.forEach(log => {
      expect(log.state).toBe('good');
    });

    // Test 2025-06-06: Should have 3 logs (1 bad, 2 bad, 3 good)
    const logs20250606 = mockLogs.filter(log => log.date === '2025-06-06');
    expect(logs20250606).toHaveLength(3);
    
    // Test 2025-06-11: Should have 3 logs, all good
    const logs20250611 = mockLogs.filter(log => log.date === '2025-06-11');
    expect(logs20250611).toHaveLength(3);
    logs20250611.forEach(log => {
      expect(log.state).toBe('good');
    });
  });

  it('should handle dates with no logs correctly', () => {
    // Test dates that should have 0 logs (like 2025-06-12, 2025-06-13)
    const logs20250612 = mockLogs.filter(log => log.date === '2025-06-12');
    expect(logs20250612).toHaveLength(0);
    
    const rate20250612 = calculateDailyRate(mockHabits, mockLogs, '2025-06-12');
    expect(rate20250612).toBe(0);
  });

  it('should calculate momentum index correctly with real data', () => {
    // Test momentum calculation up to a known date
    const momentum = calculateMomentumIndex(
      mockHabits, 
      mockLogs, 
      new Date('2025-06-07')
    );
    
    // Should be greater than 1.0 since we have positive momentum overall
    expect(momentum).toBeGreaterThan(1.0);
    expect(typeof momentum).toBe('number');
    expect(isFinite(momentum)).toBe(true);
  });

  it('should verify data flow produces expected console log patterns', () => {
    // This test verifies that our data produces the same patterns we see in console
    
    // Check that we have logs spanning from 2024 to 2025
    const allDates = [...new Set(mockLogs.map(log => log.date))].sort();
    expect(allDates[0]).toBe('2024-06-01');
    expect(allDates[allDates.length - 1]).toBe('2025-06-11');
    
    // Check that we have 1113 total logs (as shown in console)
    expect(mockLogs.length).toBe(1113);
    
    // Check that habit IDs are 1, 2, 3, 4
    const habitIds = mockHabits.map(h => h.id).sort();
    expect(habitIds).toEqual(['1', '2', '3', '4']);
  });
});
