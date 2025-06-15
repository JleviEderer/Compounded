
import { describe, it, expect, vi } from 'vitest';
import { useMomentum } from '../client/src/hooks/useMomentum';
import { mockHabits, mockLogs } from '../client/src/data/mockData';
import { renderHook } from '@testing-library/react';

describe('Time Filter Integration', () => {
  const timeFilters = [
    { label: 'All Time', days: null },
    { label: '30 D', days: 30 },
    { label: '4 M', days: 120 },
    { label: '1 Y', days: 365 }
  ];

  it.each(timeFilters)('should filter data correctly for $label', ({ label, days }) => {
    const { result } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, { label, days })
    );

    const { momentumData, currentMomentum, successRate } = result.current;

    // All filters should return valid data
    expect(momentumData).toBeDefined();
    expect(momentumData.length).toBeGreaterThan(0);
    expect(currentMomentum).toBeGreaterThan(0);
    expect(successRate).toBeGreaterThanOrEqual(0);
    expect(successRate).toBeLessThanOrEqual(100);
  });

  it('should filter logs based on time range', () => {
    const thirtyDayFilter = { label: '30 D', days: 30 };
    const allTimeFilter = { label: 'All Time', days: null };

    const { result: thirtyDayResult } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, thirtyDayFilter)
    );

    const { result: allTimeResult } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, allTimeFilter)
    );

    // All time should have more or equal data points
    expect(allTimeResult.current.momentumData.length)
      .toBeGreaterThanOrEqual(thirtyDayResult.current.momentumData.length);

    // Different filters should potentially give different results
    // (unless all data is within 30 days)
    const uniqueLogDates = [...new Set(mockLogs.map(log => log.date))];
    if (uniqueLogDates.length > 30) {
      expect(allTimeResult.current.currentMomentum)
        .not.toBe(thirtyDayResult.current.currentMomentum);
    }
  });

  it('should handle date filtering correctly in useMomentum hook', () => {
    const thirtyDayFilter = { label: '30 D', days: 30 };
    
    // Create test data with known dates
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    const { result } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, thirtyDayFilter)
    );

    // All momentum data should be within the time range
    result.current.momentumData.forEach(dataPoint => {
      expect(new Date(dataPoint.date).getTime()).toBeGreaterThanOrEqual(new Date(cutoffString).getTime());
    });
  });

  it('should recalculate when time filter changes', () => {
    let timeFilter = { label: '30 D', days: 30 };
    
    const { result, rerender } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, timeFilter)
    );

    const initialMomentum = result.current.currentMomentum;

    // Change filter
    timeFilter = { label: '4 M', days: 120 };
    rerender();

    const newMomentum = result.current.currentMomentum;

    // Should recalculate (may or may not be different depending on data)
    expect(typeof newMomentum).toBe('number');
    expect(newMomentum).toBeGreaterThan(0);
  });

  it('should handle edge case of no logs in time range', () => {
    // Create filter for future dates (should have no logs)
    const futureFilter = { label: 'Future 7 Days', days: -7 }; // Negative days = future

    const { result } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, futureFilter)
    );

    // Should handle gracefully
    expect(result.current.momentumData).toBeDefined();
    expect(result.current.currentMomentum).toBeGreaterThanOrEqual(0);
    expect(result.current.successRate).toBe(0); // No logs = 0% success
  });

  it('should debug log filtering logic', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const thirtyDayFilter = { label: '30 D', days: 30 };
    
    renderHook(() => useMomentum(mockHabits, mockLogs, thirtyDayFilter));

    // Check that filtering debug logs are present
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
