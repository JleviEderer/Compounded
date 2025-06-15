import { useMemo } from 'react';
import { HabitPair, HabitLog } from '../types';
import { 
  calculateMomentumIndex,
  generateMomentumHistory,
  generate30DayProjection,
  calculateSuccessRate,
  calculateDailyRate
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
    
    console.log(`Time Filter: ${timeFilter.label} (${timeFilter.days} days)`);
    console.log(`Cutoff date: ${cutoffString}`);
    console.log(`Original logs: ${logs.length}, Filtered logs: ${filteredLogs.length}`);
    console.log(`Filtered date range: ${filteredLogs.length > 0 ? 
      `${Math.min(...filteredLogs.map(l => l.date))} to ${Math.max(...filteredLogs.map(l => l.date))}` : 
      'No logs in range'}`);
    
    return { habits, logs: filteredLogs };
  }, [habits, logs, timeFilter]);
  const momentumData = useMemo(() => 
    generateMomentumHistory(filteredData.habits, filteredData.logs, 30), 
    [filteredData.habits, filteredData.logs]
  );

  // Projection data is now included in momentumData
  const projectionData: MomentumData[] = [];

  const currentMomentum = useMemo(() => {
    if (momentumData.length === 0) return 1.0;
    return momentumData[momentumData.length - 1].value;
  }, [momentumData]);

  const successRate = useMemo(() => 
    calculateSuccessRate(filteredData.habits, filteredData.logs, 30),
    [filteredData.habits, filteredData.logs]
  );

  const todayRate = useMemo(() => {
    if (filteredData.logs.length === 0) return 0;
    const latestDate = Math.max(...filteredData.logs.map(log => new Date(log.date).getTime()));
    const latestDateString = new Date(latestDate).toISOString().split('T')[0];
    return calculateDailyRate(filteredData.habits, filteredData.logs, latestDateString);
  }, [filteredData.habits, filteredData.logs]);

  const totalGrowth = useMemo(() => {
    if (momentumData.length < 2) return 0;
    const initialValue = momentumData[0].value;
    const finalValue = momentumData[momentumData.length - 1].value;
    return ((finalValue - initialValue) / initialValue) * 100;
  }, [momentumData]);

  const averageDailyRate = useMemo(() => {
    if (momentumData.length === 0) return 0;
    return momentumData.reduce((sum, day) => sum + day.dailyRate, 0) / momentumData.length;
  }, [momentumData]);

  const projectedTarget = useMemo(() => {
    if (projectionData.length === 0) return currentMomentum;
    return projectionData[projectionData.length - 1].value;
  }, [projectionData, currentMomentum]);

  return {
    momentumData,
    projectionData,
    currentMomentum,
    successRate,
    todayRate,
    totalGrowth,
    averageDailyRate,
    projectedTarget
  };
}