
import { calculateDailyRate } from '../utils/compound';

export const useInsightsHelpers = (habits: any[], logs: any[], filteredLogs: any[]) => {
  const getCurrentStreak = () => {
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

    return streak;
  };

  const getCalendarDays = (anchor?: Date) => {
    const calendarAnchor = anchor || new Date();
    const today = new Date();
    const firstDay = new Date(calendarAnchor.getFullYear(), calendarAnchor.getMonth(), 1);
    const lastDay = new Date(calendarAnchor.getFullYear(), calendarAnchor.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: '',
        dateISO: '',
        intensity: 0,
        day: undefined,
        isToday: false,
        isCurrentMonth: false
      });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date in local timezone to avoid UTC conversion issues
      const date = new Date(calendarAnchor.getFullYear(), calendarAnchor.getMonth(), day);
      
      // Format as YYYY-MM-DD in local timezone (this matches our log storage format)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
      
      const dailyRate = calculateDailyRate(habits, logs, dateStr);
      const todayStr = today.toLocaleDateString('en-CA');
      
      days.push({
        date: day.toString(),
        dateISO: dateStr, // This ensures the ISO date matches exactly what we use for storage
        intensity: dailyRate,
        day: day,
        isToday: dateStr === todayStr,
        isCurrentMonth: true
      });
    }

    return days;
  };

  const getQuarterWeeks = (quarterAnchor: Date) => {
    const today = new Date();
    const quarterStart = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3, 1);
    const cells = [];

    for (let week = 0; week < 13; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(quarterStart);
        date.setDate(quarterStart.getDate() + (week * 7) + day);
        const dateStr = date.toLocaleDateString('en-CA');
        const dailyRate = calculateDailyRate(habits, filteredLogs, dateStr);

        cells.push({
          date: dateStr,
          dateISO: dateStr,
          intensity: dailyRate,
          isToday: date.toDateString() === today.toDateString()
        });
      }
    }

    return cells;
  };

  const getAllTimeYears = () => {
    const currentYear = new Date().getFullYear();
    const cells = [];

    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const daysInMonth = monthEnd.getDate();

        let totalDailyRate = 0;
        let daysWithData = 0;

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = date.toLocaleDateString('en-CA');
          const dailyRate = calculateDailyRate(habits, filteredLogs, dateStr);

          const dayLogs = filteredLogs.filter(log => log.date === dateStr);
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
  };

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
