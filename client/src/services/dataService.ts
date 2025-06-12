
import { HabitPair, HabitLog } from '../types';
import { mockHabits, mockLogs } from '../data/mockData';

class DataService {
  // Debug flag for data flow tracking
  private debug = true;

  getHabits(): HabitPair[] {
    if (this.debug) {
      console.log('🔍 DataService.getHabits() called, returning:', mockHabits.length, 'habits');
    }
    return mockHabits;
  }

  getLogs(): HabitLog[] {
    if (this.debug) {
      console.log('🔍 DataService.getLogs() called, returning:', mockLogs.length, 'logs');
      console.log('🔍 Log date range:', mockLogs.length > 0 ? `${mockLogs[0].date} to ${mockLogs[mockLogs.length-1].date}` : 'No logs');
    }
    return mockLogs;
  }

  getLogsForDate(date: string): HabitLog[] {
    const logs = mockLogs.filter(log => log.date === date);
    if (this.debug) {
      console.log(`🔍 DataService.getLogsForDate(${date}):`, logs.length, 'logs found');
    }
    return logs;
  }

  getLogsForHabit(habitId: string): HabitLog[] {
    const logs = mockLogs.filter(log => log.habitId === habitId);
    if (this.debug) {
      console.log(`🔍 DataService.getLogsForHabit(${habitId}):`, logs.length, 'logs found');
    }
    return logs;
  }
}

export const dataService = new DataService();
