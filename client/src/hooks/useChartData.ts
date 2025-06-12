
import { useMemo } from 'react';
import { HabitPair, HabitLog } from '../types';
import { generateMomentumHistory, generate30DayProjection } from '../utils/compound';
import { dataService } from '../services/dataService';

export function useChartData(habits: HabitPair[], logs: HabitLog[]) {
  const momentumData = useMemo(() => {
    console.log('📊 useChartData: Generating momentum history with', habits.length, 'habits and', logs.length, 'logs');
    return generateMomentumHistory(habits, logs, 30);
  }, [habits, logs]);

  const projectionData = useMemo(() => {
    console.log('📊 useChartData: Generating projection with', habits.length, 'habits and', logs.length, 'logs');
    return generate30DayProjection(habits, logs);
  }, [habits, logs]);

  return {
    momentumData,
    projectionData
  };
}
