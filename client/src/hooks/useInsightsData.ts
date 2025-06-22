
import { useMemo } from 'react';
import { useHabits } from './useHabits';
import { calculateDailyRate } from '../utils/compound';

interface HeatMapCell {
  date: string;
  dateISO: string;
  intensity: number;
  isToday?: boolean;
  day?: number;
  month?: string;
  year?: number;
}

interface QuickStats {
  successRate: number;
  avgDailyRate: number;
  currentStreak: number;
  activeHabits: number;
}

type RangeKey = 'week' | 'month' | 'quarter' | 'all-time';

export function useInsightsData(range: RangeKey, anchor: Date) {
  const { habits, logs } = useHabits();

  const gridData = useMemo(() => {
    switch (range) {
      case 'week':
        return getWeekData(anchor, habits, logs);
      case 'month':
        return getMonthData(anchor, habits, logs);
      case 'quarter':
        return getQuarterData(anchor, habits, logs);
      case 'all-time':
        return getAllTimeMonthlyData(habits, logs);
      default:
        return [];
    }
  }, [range, anchor, habits, logs]);

  const quickStats = useMemo(() => {
    return calcQuickStats(gridData, habits, logs, range);
  }, [gridData, habits, logs, range]);

  return { gridData, quickStats };
}

function getWeekData(anchor: Date, habits: any[], logs: any[]): HeatMapCell[] {
  const startOfWeek = new Date(anchor);
  startOfWeek.setDate(anchor.getDate() - anchor.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toLocaleDateString('en-CA');
    const dailyRate = calculateDailyRate(habits, logs, dateStr);
    
    days.push({
      date: dateStr,
      dateISO: dateStr,
      intensity: dailyRate,
      isToday: dateStr === new Date().toLocaleDateString('en-CA'),
      day: date.getDate()
    });
  }
  return days;
}

function getMonthData(anchor: Date, habits: any[], logs: any[]): HeatMapCell[] {
  const today = new Date();
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({
      date: '',
      dateISO: '',
      intensity: 0,
      day: undefined
    });
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(anchor.getFullYear(), anchor.getMonth(), day);
    const dateStr = date.toLocaleDateString('en-CA');
    const dailyRate = calculateDailyRate(habits, logs, dateStr);

    days.push({
      date: dateStr,
      dateISO: dateStr,
      intensity: dailyRate,
      day,
      isToday: dateStr === today.toLocaleDateString('en-CA')
    });
  }

  return days;
}

function getQuarterData(anchor: Date, habits: any[], logs: any[]): HeatMapCell[] {
  const today = new Date();
  const quarterStart = new Date(anchor.getFullYear(), Math.floor(anchor.getMonth() / 3) * 3, 1);
  const cells = [];

  for (let week = 0; week < 13; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(quarterStart);
      date.setDate(quarterStart.getDate() + (week * 7) + day);
      const dateStr = date.toLocaleDateString('en-CA');
      const dailyRate = calculateDailyRate(habits, logs, dateStr);

      cells.push({
        date: dateStr,
        dateISO: dateStr,
        intensity: dailyRate,
        isToday: date.toDateString() === today.toDateString()
      });
    }
  }

  return cells;
}

function getAllTimeMonthlyData(habits: any[], logs: any[]): HeatMapCell[] {
  const currentYear = new Date().getFullYear();
  const cells = [];

  for (let year = currentYear - 2; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const daysInMonth = monthEnd.getDate();

      // Calculate weighted average daily rate for this month
      let totalDailyRate = 0;
      let daysWithData = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toLocaleDateString('en-CA');
        const dailyRate = calculateDailyRate(habits, logs, dateStr);
        
        // Only include days that have some logged data
        const dayLogs = logs.filter(log => log.date === dateStr);
        if (dayLogs.length > 0) {
          totalDailyRate += dailyRate;
          daysWithData++;
        }
      }

      const avgDailyRate = daysWithData > 0 ? totalDailyRate / daysWithData : 0;
      const monthISO = `${year}-${String(month + 1).padStart(2, '0')}`;

      cells.push({
        date: monthStart.toLocaleDateString('en-CA'),
        dateISO: monthISO,
        intensity: avgDailyRate,
        year,
        month: String(month + 1).padStart(2, '0')
      });
    }
  }

  return cells;
}

function calcQuickStats(gridData: HeatMapCell[], habits: any[], logs: any[], range: RangeKey): QuickStats {
  // Calculate success rate from grid data
  const daysWithData = gridData.filter(cell => cell.day !== undefined && cell.intensity !== 0);
  const successfulDays = daysWithData.filter(cell => cell.intensity > 0);
  const successRate = daysWithData.length > 0 ? (successfulDays.length / daysWithData.length) * 100 : 0;

  // Calculate average daily rate
  const totalIntensity = daysWithData.reduce((sum, cell) => sum + cell.intensity, 0);
  const avgDailyRate = daysWithData.length > 0 ? totalIntensity / daysWithData.length : 0;

  // Calculate current streak (always from today backwards)
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toLocaleDateString('en-CA');
    const dayLogs = logs.filter(log => log.date === dateStr && log.state === 'good');
    if (dayLogs.length > 0) {
      streak++;
    } else {
      break;
    }
  }

  return {
    successRate,
    avgDailyRate: avgDailyRate * 100, // Convert to percentage
    currentStreak: streak,
    activeHabits: habits.length
  };
}
