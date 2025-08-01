import { useMemo } from 'react';
import { HabitPair, HabitLog, MomentumData } from '../types';
import { 
  generateMomentumHistory, 
  calculateMomentumIndex, 
  calculateTimeframeMomentumIndex,
  calculateDailyRate, 
  calculateSuccessRate,
  calculateDynamicSuccessRate,
  generateTimeFilterProjection
} from '../utils/compound';

interface TimeFilter {
  label: string;
  days: number | null;
}

export function useMomentum(habits: HabitPair[], logs: HabitLog[], timeFilter?: TimeFilter, preFilteredLogs?: HabitLog[]) {
  // Use pre-filtered logs if provided, otherwise apply basic time filter
  const filteredData = useMemo(() => {
    // If pre-filtered logs are provided, use them (this ensures exact date range matching)
    if (preFilteredLogs) {
      console.log(`Using pre-filtered logs: ${preFilteredLogs.length}/${logs.length} logs`);
      return { habits, logs: preFilteredLogs };
    }

    // Fallback to basic time filter for backward compatibility
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
  }, [habits, logs, timeFilter, preFilteredLogs]);

// Generate momentum history
  const momentumData = useMemo(() => {
    if (filteredData.logs.length === 0) return [];

    // Calculate how many days we actually have data for
    const logDates = Array.from(new Set(filteredData.logs.map(l => l.date))).sort();
    const actualDays = logDates.length;

    console.log(`Generating momentum history for ${timeFilter?.label}: ${actualDays} days`);

    // Pass full logs for momentum calculation, filtered logs for display timeframe
    return generateMomentumHistory(filteredData.habits, filteredData.logs, actualDays, undefined, logs);
  }, [filteredData.habits, filteredData.logs, timeFilter?.label, logs]);

  // Calculate dynamic window sizes based on time filter FIRST
  const { avgWindowDays, projWindowDays } = useMemo(() => {
    if (!timeFilter || timeFilter.days === null) {
      // All-Time uses same windows as 1Y
      return { avgWindowDays: 120, projWindowDays: 120 };
    }
    
    switch (timeFilter.label) {
      case '30 D':
        return { avgWindowDays: 7, projWindowDays: 7 };
      case '3 M':
        return { avgWindowDays: 30, projWindowDays: 30 };
      case '1 Y':
        return { avgWindowDays: 90, projWindowDays: 90 };
      default:
        return { avgWindowDays: 90, projWindowDays: 90 };
    }
  }, [timeFilter]);

  // Calculate recent average rate using dynamic window - ONLY from historical data
  const recentAvgRate = useMemo(() => {
    if (momentumData.length === 0) return 0;
    
    // Only use historical data points (not forecast) for average calculation
    const historicalData = momentumData.filter(d => !d.isProjection);
    if (historicalData.length === 0) return 0;
    
    const windowSize = Math.min(avgWindowDays, historicalData.length);
    const recentData = historicalData.slice(-windowSize);
    
    console.log(`Recent Avg Rate calc for ${timeFilter?.label}: ${recentData.length} historical days from window of ${avgWindowDays}`);
    
    return recentData.reduce((sum, d) => sum + d.dailyRate, 0) / recentData.length;
  }, [momentumData, avgWindowDays, timeFilter?.label]);

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
          isProjection: false,
          epoch: new Date(dateStr).getTime()
        });
      }
    }

    return [...paddedHistorical, ...forecast];
  }, [momentumData, forecastData]);

  // Calculate timeframe-specific current momentum (starts from timeframe beginning, not habit creation)
  const currentMomentum = useMemo(() => {
    if (filteredData.logs.length === 0) return 1.0;
    
    // For All Time, use the traditional momentum calculation
    if (!timeFilter || timeFilter.days === null) {
      return momentumData.length > 0 ? momentumData[momentumData.length - 1]?.value || 1.0 : 1.0;
    }
    
    // For timeframe filters, calculate momentum from timeframe start
    const today = new Date();
    const timeframeStart = new Date();
    timeframeStart.setDate(timeframeStart.getDate() - timeFilter.days);
    
    return calculateTimeframeMomentumIndex(
      filteredData.habits, 
      logs, // Use all logs for accurate calculation
      today,
      timeframeStart
    );
  }, [filteredData.habits, filteredData.logs, logs, timeFilter, momentumData]);

  // Calculate total growth for timeframe (always relative to 1.0 baseline)
  const totalGrowth = useMemo(() => {
    // For timeframes, growth is simply (current index - 1.0) * 100
    // since timeframe momentum always starts from 1.0
    return (currentMomentum - 1.0) * 100;
  }, [currentMomentum]);

  // Calculate latest rate from most recent day with actual data
  const todayRate = useMemo(() => {
    if (filteredData.logs.length === 0) return 0;
    
    // Get the most recent date with actual log data
    const logDates = Array.from(new Set(filteredData.logs.map(l => l.date))).sort();
    const mostRecentDate = logDates[logDates.length - 1];
    
    console.log(`Latest Rate: Using most recent date with data: ${mostRecentDate}`);
    
    const rate = calculateDailyRate(filteredData.habits, filteredData.logs, mostRecentDate);
    console.log(`Latest Rate calculated: ${rate} for date ${mostRecentDate}`);
    
    return rate;
  }, [filteredData.habits, filteredData.logs]);

  // Calculate success rate using dynamic calculation with exact filtered logs
  const successRate = useMemo(() => {
    return calculateDynamicSuccessRate(filteredData.habits, filteredData.logs);
  }, [filteredData.habits, filteredData.logs]);

  // Calculate projected target using dynamic projection window
  const projectedTarget = useMemo(() => {
    if (momentumData.length === 0) return currentMomentum;
    
    // Use the recent average rate to project forward by projWindowDays
    const startValue = currentMomentum;
    const projectedValue = startValue * Math.pow(1 + recentAvgRate, projWindowDays);
    
    // Debug logging for 1Y calculations
    if (timeFilter?.label === '1 Y') {
      console.log('🔍 1Y Projection Debug:');
      console.log('  Current Momentum (exact):', startValue);
      console.log('  Recent Avg Rate (exact):', recentAvgRate);
      console.log('  Projection Days:', projWindowDays);
      console.log('  Manual Calc Check:', startValue, '* (1 +', recentAvgRate, ')^', projWindowDays);
      console.log('  Manual Result:', startValue * Math.pow(1 + recentAvgRate, projWindowDays));
      console.log('  App Result:', projectedValue);
      console.log('  Your Calc (1.988 * 1.0019^120):', 1.988 * Math.pow(1.0019, 120));
    }
    
    return projectedValue;
  }, [momentumData, currentMomentum, recentAvgRate, projWindowDays, timeFilter]);

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