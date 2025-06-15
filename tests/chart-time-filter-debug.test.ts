
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMomentum } from '../client/src/hooks/useMomentum';
import { mockHabits, mockLogs } from '../client/src/data/mockData';

describe('Chart Time Filter Data Flow Debug', () => {
  it('should verify complete data flow from time filter to chart', () => {
    const allTimeFilter = { label: 'All Time', days: null };
    const thirtyDayFilter = { label: '30 D', days: 30 };

    // Test All Time filter
    const { result: allTimeResult } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, allTimeFilter)
    );

    // Test 30 Day filter
    const { result: thirtyDayResult } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, thirtyDayFilter)
    );

    console.log('=== DATA FLOW DEBUG ===');
    console.log('All Time momentum data length:', allTimeResult.current.momentumData.length);
    console.log('30 Day momentum data length:', thirtyDayResult.current.momentumData.length);
    console.log('All Time date range:', {
      start: allTimeResult.current.momentumData[0]?.date,
      end: allTimeResult.current.momentumData[allTimeResult.current.momentumData.length - 1]?.date
    });
    console.log('30 Day date range:', {
      start: thirtyDayResult.current.momentumData[0]?.date,
      end: thirtyDayResult.current.momentumData[thirtyDayResult.current.momentumData.length - 1]?.date
    });
    console.log('All Time current momentum:', allTimeResult.current.currentMomentum);
    console.log('30 Day current momentum:', thirtyDayResult.current.currentMomentum);

    // Verify different filters produce different data
    expect(allTimeResult.current.momentumData.length).not.toBe(thirtyDayResult.current.momentumData.length);
    expect(allTimeResult.current.currentMomentum).not.toBe(thirtyDayResult.current.currentMomentum);
    
    // Both should have valid data
    expect(allTimeResult.current.momentumData.length).toBeGreaterThan(0);
    expect(thirtyDayResult.current.momentumData.length).toBeGreaterThan(0);
  });

  it('should verify chart receives correct filtered data props', () => {
    // This test simulates what the chart should receive
    const timeFilter = { label: '30 D', days: 30 };
    
    const { result } = renderHook(() => 
      useMomentum(mockHabits, mockLogs, timeFilter)
    );

    const chartProps = {
      data: result.current.momentumData,
      currentMomentum: result.current.currentMomentum,
      totalGrowth: result.current.totalGrowth,
      todayRate: result.current.todayRate,
      projectedTarget: result.current.projectedTarget
    };

    console.log('=== CHART PROPS DEBUG ===');
    console.log('Chart will receive data points:', chartProps.data.length);
    console.log('Chart data date range:', {
      start: chartProps.data[0]?.date,
      end: chartProps.data[chartProps.data.length - 1]?.date
    });
    console.log('Chart current momentum:', chartProps.currentMomentum);
    console.log('Chart total growth:', chartProps.totalGrowth);

    // Chart should receive filtered data
    expect(chartProps.data.length).toBeGreaterThan(0);
    expect(chartProps.data.length).toBeLessThanOrEqual(30); // Should be limited by time filter
  });
});
