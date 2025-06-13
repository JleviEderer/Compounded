
/**
 * data-flow-integration.test.ts: Comprehensively tests the entire data pipeline from JSON → TypeScript → DataService → React Hook, ensuring data integrity at each step.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHabits } from '../client/src/hooks/useHabits';
import { dataService } from '../client/src/services/dataService';
import { mockHabits, mockLogs } from '../client/src/data/mockData';
import { HabitWeight, HabitLogState } from '../client/src/types';

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Disable debug logging during tests
    dataService.setDebugMode(false);
  });

  describe('Step 1: JSON Data Import Validation', () => {
    it('should import raw JSON data correctly', async () => {
      // Import the raw JSON to verify it loads
      const rawData = await import('../client/src/data/myMockData.json');
      
      expect(rawData.habits).toBeDefined();
      expect(rawData.logs).toBeDefined();
      expect(Array.isArray(rawData.habits)).toBe(true);
      expect(Array.isArray(rawData.logs)).toBe(true);
      expect(rawData.habits.length).toBeGreaterThan(0);
      expect(rawData.logs.length).toBeGreaterThan(0);
      
      // Verify expected structure
      const firstHabit = rawData.habits[0];
      expect(firstHabit).toHaveProperty('id');
      expect(firstHabit).toHaveProperty('goodHabit');
      expect(firstHabit).toHaveProperty('badHabit');
      expect(firstHabit).toHaveProperty('weight');
      expect(firstHabit).toHaveProperty('createdAt');
      
      const firstLog = rawData.logs[0];
      expect(firstLog).toHaveProperty('id');
      expect(firstLog).toHaveProperty('habitId');
      expect(firstLog).toHaveProperty('date');
      expect(firstLog).toHaveProperty('state');
    });
  });

  describe('Step 2: mockData.ts Type Conversion', () => {
    it('should convert JSON data to proper TypeScript types', () => {
      expect(mockHabits).toBeDefined();
      expect(mockLogs).toBeDefined();
      expect(Array.isArray(mockHabits)).toBe(true);
      expect(Array.isArray(mockLogs)).toBe(true);
      
      // Verify habits conversion
      const firstHabit = mockHabits[0];
      expect(firstHabit.createdAt).toBeInstanceOf(Date);
      expect(Object.values(HabitWeight)).toContain(firstHabit.weight);
      
      // Verify logs conversion
      const firstLog = mockLogs[0];
      expect(typeof firstLog.date).toBe('string');
      expect(['good', 'bad']).toContain(firstLog.state);
    });

    it('should maintain data integrity during conversion', () => {
      // Check that no data was lost during conversion
      expect(mockHabits.length).toBe(4); // Based on your JSON
      expect(mockLogs.length).toBeGreaterThan(1000); // Your logs span a year
      
      // Verify weight mapping worked correctly
      const weightCounts = mockHabits.reduce((acc, habit) => {
        acc[habit.weight] = (acc[habit.weight] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      expect(Object.keys(weightCounts)).toEqual(
        expect.arrayContaining([
          HabitWeight.SMALL.toString(),
          HabitWeight.LOW.toString(), 
          HabitWeight.MEDIUM.toString()
        ])
      );
    });

    it('should have logs spanning the expected date range', () => {
      const dates = mockLogs.map(log => log.date).sort();
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      
      expect(firstDate).toBe('2024-06-01');
      expect(lastDate).toBe('2025-06-11');
      
      // Verify logs exist for 2025 (from console logs we see this is important)
      const logs2025 = mockLogs.filter(log => log.date.startsWith('2025'));
      expect(logs2025.length).toBeGreaterThan(0);
    });
  });

  describe('Step 3: DataService Layer', () => {
    it('should provide access to converted data', () => {
      const habits = dataService.getHabits();
      const logs = dataService.getLogs();
      
      expect(habits).toEqual(mockHabits);
      expect(logs).toEqual(mockLogs);
    });

    it('should filter logs by date correctly', () => {
      // Test with a known date from your data
      const testDate = '2025-06-05';
      const logsForDate = dataService.getLogsForDate(testDate);
      
      expect(Array.isArray(logsForDate)).toBe(true);
      logsForDate.forEach(log => {
        expect(log.date).toBe(testDate);
      });
    });

    it('should filter logs by habit correctly', () => {
      const habitId = '1';
      const logsForHabit = dataService.getLogsForHabit(habitId);
      
      expect(Array.isArray(logsForHabit)).toBe(true);
      logsForHabit.forEach(log => {
        expect(log.habitId).toBe(habitId);
      });
    });

    it('should handle debug mode toggling', () => {
      // This should not throw
      dataService.setDebugMode(true);
      dataService.setDebugMode(false);
    });
  });

  describe('Step 4: useHabits Hook State Management', () => {
    it('should initialize with data from dataService', () => {
      const { result } = renderHook(() => useHabits());
      
      expect(result.current.habits).toEqual(mockHabits);
      expect(result.current.logs).toEqual(mockLogs);
      expect(result.current.settings).toBeDefined();
    });

    it('should maintain data consistency when adding habits', () => {
      const { result } = renderHook(() => useHabits());
      
      const initialCount = result.current.habits.length;
      
      act(() => {
        result.current.addHabit('Test Good', 'Test Bad', HabitWeight.LOW);
      });
      
      expect(result.current.habits.length).toBe(initialCount + 1);
      const newHabit = result.current.habits[result.current.habits.length - 1];
      expect(newHabit.goodHabit).toBe('Test Good');
      expect(newHabit.badHabit).toBe('Test Bad');
      expect(newHabit.weight).toBe(HabitWeight.LOW);
    });

    it('should handle habit logging correctly', () => {
      const { result } = renderHook(() => useHabits());
      
      const habitId = result.current.habits[0].id;
      const testDate = '2025-12-25';
      const initialLogCount = result.current.logs.length;
      
      act(() => {
        result.current.logHabit(habitId, testDate, HabitLogState.GOOD);
      });
      
      expect(result.current.logs.length).toBe(initialLogCount + 1);
      const newLog = result.current.logs.find(log => 
        log.habitId === habitId && log.date === testDate
      );
      expect(newLog).toBeDefined();
      expect(newLog?.state).toBe(HabitLogState.GOOD);
    });
  });

  describe('Step 5: End-to-End Data Flow', () => {
    it('should maintain data integrity through the entire flow', async () => {
      // 1. Verify JSON loads
      const rawData = await import('../client/src/data/myMockData.json');
      
      // 2. Verify conversion preserves count
      expect(mockHabits.length).toBe(rawData.habits.length);
      expect(mockLogs.length).toBe(rawData.logs.length);
      
      // 3. Verify dataService provides same data
      expect(dataService.getHabits().length).toBe(mockHabits.length);
      expect(dataService.getLogs().length).toBe(mockLogs.length);
      
      // 4. Verify hook initializes with same data
      const { result } = renderHook(() => useHabits());
      expect(result.current.habits.length).toBe(mockHabits.length);
      expect(result.current.logs.length).toBe(mockLogs.length);
    });

    it('should support the compound calculations pipeline', () => {
      const { result } = renderHook(() => useHabits());
      
      // Test that we have the data structure needed for compound calculations
      const habits = result.current.habits;
      const logs = result.current.logs;
      
      // Verify we have the expected habit structure
      habits.forEach(habit => {
        expect(habit).toHaveProperty('id');
        expect(habit).toHaveProperty('weight');
        expect(typeof habit.weight).toBe('number');
        expect(habit.weight).toBeGreaterThan(0);
      });
      
      // Verify we have logs with proper states
      logs.forEach(log => {
        expect(log).toHaveProperty('habitId');
        expect(log).toHaveProperty('date');
        expect(log).toHaveProperty('state');
        expect(['good', 'bad']).toContain(log.state);
      });
      
      // Test specific dates that we know exist (from console logs)
      const logsFor2025 = logs.filter(log => log.date.startsWith('2025-06'));
      expect(logsFor2025.length).toBeGreaterThan(0);
    });

    it('should handle date filtering across the flow', () => {
      const testDate = '2025-06-05';
      
      // Test dataService filtering
      const serviceResult = dataService.getLogsForDate(testDate);
      
      // Test hook data contains same logs
      const { result } = renderHook(() => useHabits());
      const hookResult = result.current.logs.filter(log => log.date === testDate);
      
      expect(serviceResult).toEqual(hookResult);
      expect(serviceResult.length).toBeGreaterThan(0); // We know this date has logs
    });
  });

  describe('Step 6: Error Handling and Edge Cases', () => {
    it('should handle missing dates gracefully', () => {
      const futureDate = '2030-01-01';
      const logsForFutureDate = dataService.getLogsForDate(futureDate);
      
      expect(Array.isArray(logsForFutureDate)).toBe(true);
      expect(logsForFutureDate.length).toBe(0);
    });

    it('should handle invalid habit IDs gracefully', () => {
      const invalidHabitId = 'nonexistent';
      const logsForInvalidHabit = dataService.getLogsForHabit(invalidHabitId);
      
      expect(Array.isArray(logsForInvalidHabit)).toBe(true);
      expect(logsForInvalidHabit.length).toBe(0);
    });

    it('should maintain referential integrity', () => {
      const { result } = renderHook(() => useHabits());
      
      // Every log should reference an existing habit
      const habitIds = new Set(result.current.habits.map(h => h.id));
      const logHabitIds = new Set(result.current.logs.map(l => l.habitId));
      
      logHabitIds.forEach(logHabitId => {
        expect(habitIds.has(logHabitId)).toBe(true);
      });
    });
  });
});
