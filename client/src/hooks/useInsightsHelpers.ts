import { calculateDailyRate } from '../utils/compound';
import { HabitPair, HabitLog } from '../types';

export function getCurrentStreak(habits: HabitPair[], logs: HabitLog[]) {
  if (habits.length === 0) return 0;

  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toLocaleDateString('en-CA');

    const dayLogs = logs.filter(log => log.date === dateString);
    const hasGoodHabits = dayLogs.some(log => log.state === 'good');

    if (hasGoodHabits) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getCalendarDays(habits: HabitPair[], logs: HabitLog[], anchor: Date) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOfCalendar = new Date(firstDay);
  const offset = (firstDay.getDay() + 6) % 7;  // Monday-index
  startOfCalendar.setDate(startOfCalendar.getDate() - offset);

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
      isToday: dateString === new Date().toLocaleDateString('en-CA'),
      day: date.getMonth() === month ? date.getDate() : null,
      month: date.toLocaleDateString('en', { month: 'short' }),
      year: date.getFullYear()
    });
  }

  return days;
}

export function getQuarterWeeks(habits: HabitPair[], logs: HabitLog[], quarterAnchor: Date) {
  const startOfQuarter = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3, 1);
  const endOfQuarter = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3 + 3, 0);

  const weeks = [];
  const currentDate = new Date(startOfQuarter);
  const offset = (currentDate.getDay() + 6) % 7;  // Monday-index
  currentDate.setDate(currentDate.getDate() - offset);

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
}

export function getAllTimeYears(habits: HabitPair[], logs: HabitLog[]) {
  const years: {
    date: string;
    dateISO: string;
    intensity: number;
    year: number;
    month: number;
  }[] = [];

  const today = new Date();
  const firstYear = 2023;                                // or compute min year from logs
  const lastYear  = today.getFullYear();

  for (let year = firstYear; year <= lastYear; year++) {
    for (let month = 0; month < 12; month++) {
      const monthEnd = new Date(year, month + 1, 0).getDate();

      let sum = 0;
      let daysWithLogs = 0;

      for (let d = 1; d <= monthEnd; d++) {
        const dateStr = new Date(year, month, d).toLocaleDateString('en-CA'); // YYYY-MM-DD
        const daily = calculateDailyRate(habits, logs, dateStr);
        if (daily !== 0) {
          sum += daily;
          daysWithLogs++;
        }
      }

      const avg = daysWithLogs ? sum / daysWithLogs : 0;

      years.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}`,
        dateISO: `${year}-${String(month + 1).padStart(2, '0')}`,
        intensity: avg,
        year,
        month: month + 1,
      });
    }
  }

  return years;
}

export function getIntensityColor(intensity: number) {
  if (intensity === 0) return 'bg-gray-100 dark:bg-gray-700';
  if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-800';
  if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
  if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
  return 'bg-emerald-500 dark:bg-emerald-500';
}