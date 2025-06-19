import { useMemo } from 'react';
import { HabitPair, HabitLog, MomentumData } from '../types';
import { 
  generateMomentumHistory, 
  calculateMomentumIndex, 
  calculateDailyRate, 
  calculateSuccessRate,
  generateTimeFilterProjection
} from '../utils/compound';

interface TimeFilter {
  label: string;
  days: number | null;
}

export function useMomentum(habits: HabitPair[], logs: HabitLog[], timeFilter?: TimeFilter) {
  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!timeFilter || timeFilter.days === null) {
      console.log('Time Filter: All Time selected, using all data');
      console.log(`Total logs available: ${logs.length}`);
      return { habits, logs };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeFilter.days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    // Filter logs to only include data within the time range
    const filteredLogs = logs.filter(log => log.date >= cutoffString);

    console.log(`Time filtering: ${timeFilter.label} → ${filteredLogs.length}/${logs.length} logs`);

    return { habits, logs: filteredLogs };
  }, [habits, logs, timeFilter]);

// Generate momentum history
  const momentumData = useMemo(() => {
    if (filteredData.logs.length === 0) return [];

    // Calculate how many days we actually have data for
    const logDates = Array.from(new Set(filteredData.logs.map(l => l.date))).sort();
    const actualDays = logDates.length;

    console.log(`Generating momentum history for ${timeFilter?.label}: ${actualDays} days`);

    return generateMomentumHistory(filteredData.habits, filteredData.logs, actualDays);
  }, [filteredData.habits, filteredData.logs, timeFilter?.label]);

  // Calculate recent average rate using dynamic window
  const recentAvgRate = useMemo(() => {
    if (momentumData.length === 0) return 0;
    const windowSize = Math.min(avgWindowDays, momentumData.length);
    const recentData = momentumData.slice(-windowSize);
    return recentData.reduce((sum, d) => sum + d.dailyRate, 0) / recentData.length;
  }, [momentumData, avgWindowDays]);

  // Generate forecast data based on time filter
  const forecastData = useMemo(() => {
    if (!timeFilter) return [];
    return generateTimeFilterProjection(filteredData.habits, filteredData.logs, timeFilter, recentAvgRate);
  }, [filteredData.habits, filteredData.logs, timeFilter, recentAvgRate]);

  // Combine historical and forecast data for chart
  const combinedChartData = useMemo(() => {
    // For proper 3/4 historical, 1/4 forecast layout, we need to pad historical data
    const historical = momentumData;
    const forecast = forecastData;

    if (forecast.length === 0) {
      return historical; // No forecast for All Time
    }

    // Calculate the ratio to make historical data take up 3/4 of the chart
    // We want: historical_length : forecast_length = 3 : 1
    const targetHistoricalLength = forecast.length * 3;

    let paddedHistorical = [...historical];

    // If we need more historical points for the 3:1 ratio, pad with empty dates
    if (historical.length < targetHistoricalLength) {
      const firstDate = historical.length > 0 ? new Date(historical[0].date) : new Date();
      const daysToAdd = targetHistoricalLength - historical.length;

      for (let i = daysToAdd; i > 0; i--) {
        const date = new Date(firstDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        paddedHistorical.unshift({
          date: dateStr,
          value: momentumData[0]?.value || 1.0,
          dailyRate: 0,
          isProjection: false
        });
      }
    }

    return [...paddedHistorical, ...forecast];
  }, [momentumData, forecastData]);

  // Calculate current momentum from the filtered data
  const currentMomentum = useMemo(() => {
    if (momentumData.length === 0) return 1.0;
    return momentumData[momentumData.length - 1]?.value || 1.0;
  }, [momentumData]);

  // Calculate total growth from filtered data
  const totalGrowth = useMemo(() => {
    if (momentumData.length === 0) return 0;
    const startValue = momentumData[0]?.value || 1.0;
    const endValue = currentMomentum;
    return ((endValue - startValue) / startValue) * 100;
  }, [momentumData, currentMomentum]);

  // Calculate today's rate from filtered data
  const todayRate = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return calculateDailyRate(filteredData.habits, filteredData.logs, today);
  }, [filteredData.habits, filteredData.logs]);

  // Calculate success rate
  const successRate = useMemo(() => {
    return calculateSuccessRate(filteredData.habits, filteredData.logs, timeFilter?.days || 30);
  }, [filteredData.habits, filteredData.logs, timeFilter?.days]);

  // Calculate dynamic window sizes based on time filter
  const { avgWindowDays, projWindowDays } = useMemo(() => {
    if (!timeFilter || timeFilter.days === null) {
      // All-Time uses same windows as 1Y
      return { avgWindowDays: 120, projWindowDays: 120 };
    }
    
    switch (timeFilter.label) {
      case '30 D':
        return { avgWindowDays: 7, projWindowDays: 7 };
      case '4 M':
        return { avgWindowDays: 30, projWindowDays: 30 };
      case '1 Y':
        return { avgWindowDays: 120, projWindowDays: 120 };
      default:
        return { avgWindowDays: 120, projWindowDays: 120 };
    }
  }, [timeFilter]);

  // Calculate projected target using dynamic projection window
  const projectedTarget = useMemo(() => {
    if (momentumData.length === 0) return currentMomentum;
    
    // Use the recent average rate to project forward by projWindowDays
    const startValue = currentMomentum;
    const projectedValue = startValue * Math.pow(1 + recentAvgRate, projWindowDays);
    
    return projectedValue;
  }, [momentumData, currentMomentum, recentAvgRate, projWindowDays]);

  return {
    momentumData: combinedChartData, // Now includes both historical + forecast
    currentMomentum,
    totalGrowth,
    todayRate,
    successRate,
    projectedTarget,
    recentAvgRate,
    avgWindowDays,
    projWindowDays
  };
}