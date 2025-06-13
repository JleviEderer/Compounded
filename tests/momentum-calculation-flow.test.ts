
/**
 * momentum-calculation-flow.test.ts: Specifically validates the momentum calculations using your real data, testing the exact scenarios we see in your console logs.
 */

import { describe, it, expect } from 'vitest';
import { calculateDailyRate, calculateMomentumIndex } from '../client/src/utils/compound';
import { mockHabits, mockLogs } from '../client/src/data/mockData';

describe('Momentum Calculation Data Flow', () => {
  it('should calculate daily rates for available dates', () => {
    // Test with whatever data is available (mock or user data)
    const availableDates = [...new Set(mockLogs.map(log => log.date))].sort();
    
    if (availableDates.length > 0) {
      // Test first available date
      const firstDate = availableDates[0];
      const rate = calculateDailyRate(mockHabits, mockLogs, firstDate);
      expect(typeof rate).toBe('number');
      expect(isFinite(rate)).toBe(true);
      
      // Test last available date  
      const lastDate = availableDates[availableDates.length - 1];
      const lastRate = calculateDailyRate(mockHabits, mockLogs, lastDate);
      expect(typeof lastRate).toBe('number');
      expect(isFinite(lastRate)).toBe(true);
    }
  });

  it('should have valid habit weights', () => {
    // Test that all habits have valid weights from HabitWeight enum
    const validWeights = [0.0005, 0.001, 0.0025, 0.004]; // HabitWeight enum values
    
    mockHabits.forEach(habit => {
      expect(validWeights).toContain(habit.weight);
      expect(habit.weight).toBeGreaterThan(0);
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

  it('should verify data flow produces valid data patterns', () => {
    // Test that data structure is valid regardless of source
    
    // Check that we have some data
    expect(mockHabits.length).toBeGreaterThan(0);
    expect(mockLogs.length).toBeGreaterThan(0);
    
    // Check date format consistency
    const allDates = [...new Set(mockLogs.map(log => log.date))].sort();
    allDates.forEach(date => {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });
    
    // Check that all habit IDs in logs exist in habits
    const habitIds = new Set(mockHabits.map(h => h.id));
    mockLogs.forEach(log => {
      expect(habitIds.has(log.habitId)).toBe(true);
    });
  });
});
