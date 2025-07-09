import { calculateDailyRate } from '../utils/compound';
import { useCallback } from 'react';

export const useInsightsHelpers = (habits: any[], logs: any[], filteredLogs: any[]) => {
  const getCurrentStreak = useCallback(() => {
    if (habits.length === 0) return 0;

    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dayLogs = logs.filter(log => log.date === dateString);
      const hasGoodHabits = dayLogs.some(log => log.completed);

      if (hasGoodHabits) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [habits, logs]);

  const getCalendarDays = useCallback((anchor: Date) => {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOfCalendar = new Date(firstDay);
    startOfCalendar.setDate(startOfCalendar.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startOfCalendar);
      date.setDate(startOfCalendar.getDate() + i);
      const dateString = date.toLocaleDateString('en-CA');

      const dayLogs = logs.filter(log => log.date === dateString);
      const intensity = calculateDailyRate(habits, logs, dateString);

      days.push({
        date: dateString,
        dateISO: dateString,
        intensity,
        isToday: dateString === new Date().toISOString().split('T')[0],
        day: date.getMonth() === month ? date.getDate() : null,
        month: date.toLocaleDateString('en', { month: 'short' }),
        year: date.getFullYear()
      });
    }

    return days;
  }, [habits, logs]);

  const getQuarterWeeks = useCallback((quarterAnchor: Date) => {
    const startOfQuarter = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3, 1);
    const endOfQuarter = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3 + 3, 0);

    const weeks = [];
    const currentDate = new Date(startOfQuarter);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    while (currentDate <= endOfQuarter) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        const dateString = date.toLocaleDateString('en-CA');
        const dailyRate = calculateDailyRate(habits, logs, dateString);

        week.push({
          date: dateString,
          dateISO: dateString,
          intensity: dailyRate,
          isToday: dateString === new Date().toLocaleDateString('en-CA'),
          day: date.getDate(),
          month: date.toLocaleDateString('en', { month: 'short' }),
          year: date.getFullYear()
        });
      }
      weeks.push(...week);
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  }, [habits, logs]);

  const getAllTimeYears = useCallback(() => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        const monthLogs = logs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= monthStart && logDate <= monthEnd;
        });

        const monthStartString = monthStart.toLocaleDateString('en-CA');
        const intensity = calculateDailyRate(habits, logs, monthStartString);

        years.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}`,
          dateISO: `${year}-${String(month + 1).padStart(2, '0')}`,
          intensity,
          year,
          month: month + 1
        });
      }
    }

    return years;
  }, [habits, logs]);

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-800';
    if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
    if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  return {
    getCurrentStreak,
    getCalendarDays,
    getQuarterWeeks,
    getAllTimeYears,
    getIntensityColor
  };
};