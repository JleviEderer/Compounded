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
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  // Continue until we've covered the entire quarter plus any partial weeks
  while (currentDate <= endOfQuarter || weeks.length === 0) {
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
    
    // Break if we've gone too far past the quarter
    if (currentDate > new Date(endOfQuarter.getTime() + 14 * 24 * 60 * 60 * 1000)) {
      break;
    }
  }

  return weeks;
}

export function getAllTimeYears(habits: HabitPair[], logs: HabitLog[]) {
  const years = [];
  const currentYear = new Date().getFullYear();

  for (let year = currentYear - 2; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      // Get all logs for this month
      const monthLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
      });

      // Calculate average intensity for the month
      let totalIntensity = 0;
      let daysWithLogs = 0;
      
      // Get unique dates in this month that have logs
      const uniqueDates = [...new Set(monthLogs.map(log => log.date))];
      
      for (const date of uniqueDates) {
        const dayIntensity = calculateDailyRate(habits, logs, date);
        totalIntensity += dayIntensity;
        daysWithLogs++;
      }
      
      // Average intensity for the month (0 if no logs)
      const intensity = daysWithLogs > 0 ? totalIntensity / daysWithLogs : 0;

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
}

export function getIntensityColor(intensity: number) {
  if (intensity === 0) return 'bg-gray-100 dark:bg-gray-700';
  if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-800';
  if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
  if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
  return 'bg-emerald-500 dark:bg-emerald-500';
}