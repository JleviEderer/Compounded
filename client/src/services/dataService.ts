
import { HabitPair, HabitLog } from '../types';
import { mockHabits, mockLogs } from '../data/mockData';

class DataService {
  // Debug flag for data flow tracking - can be controlled globally
  private debug = true;
  
  setDebugMode(enabled: boolean) {
    this.debug = enabled;
    console.log(`🔧 DataService: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

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
      if (logs.length === 0) {
        // Help debug date mismatches
        const availableDates = [...new Set(mockLogs.map(log => log.date))].sort();
        const closestDate = this.findClosestDate(date, availableDates);
        console.log(`🔍 No logs for ${date}. Closest available date: ${closestDate}`);
        console.log(`🔍 Available date range: ${availableDates[0]} to ${availableDates[availableDates.length-1]}`);
      }
    }
    return logs;
  }

  private findClosestDate(targetDate: string, availableDates: string[]): string {
    const target = new Date(targetDate).getTime();
    let closest = availableDates[0];
    let minDiff = Math.abs(new Date(closest).getTime() - target);
    
    for (const date of availableDates) {
      const diff = Math.abs(new Date(date).getTime() - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = date;
      }
    }
    return closest;
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
