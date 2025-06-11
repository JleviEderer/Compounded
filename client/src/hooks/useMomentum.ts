import { useMemo } from 'react';
import { HabitPair, HabitLog } from '../types';
import { 
  calculateMomentumIndex,
  generateMomentumHistory,
  generate30DayProjection,
  calculateSuccessRate,
  calculateDailyRate
} from '../utils/compound';

export function useMomentum(habits: HabitPair[], logs: HabitLog[]) {
  const momentumData = useMemo(() => 
    generateMomentumHistory(habits, logs, 30), 
    [habits, logs]
  );

  const projectionData = useMemo(() => 
    generate30DayProjection(habits, logs),
    [habits, logs]
  );

  const currentMomentum = useMemo(() => 
    calculateMomentumIndex(habits, logs, new Date()),
    [habits, logs]
  );

  const successRate = useMemo(() => 
    calculateSuccessRate(habits, logs, 30),
    [habits, logs]
  );

  const todayRate = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return calculateDailyRate(habits, logs, today);
  }, [habits, logs]);

  const totalGrowth = useMemo(() => {
    if (momentumData.length === 0) return 0;
    const initial = momentumData[0].value;
    return ((currentMomentum - initial) / initial) * 100;
  }, [momentumData, currentMomentum]);

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
