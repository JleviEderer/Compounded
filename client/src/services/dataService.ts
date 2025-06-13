
import { HabitPair, HabitLog } from '../types';
import { mockHabits, mockLogs } from '../data/mockData';
import { dataSourceConfig } from './dataSourceConfig';

class DataService {
  // Debug flag for data flow tracking - can be controlled globally
  private debug = true;
  
  private getUserDataFromStorage(): { habits: HabitPair[], logs: HabitLog[] } {
    const stored = localStorage.getItem('compounded-data');
    if (!stored) {
      return { habits: [], logs: [] };
    }
    
    try {
      const parsed = JSON.parse(stored);
      return {
        habits: parsed.habits || [],
        logs: parsed.logs || []
      };
    } catch {
      console.error('Failed to parse user data from localStorage');
      return { habits: [], logs: [] };
    }
  }
  
  setDebugMode(enabled: boolean) {
    this.debug = enabled;
    console.log(`🔧 DataService: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  getHabits(): HabitPair[] {
    const source = dataSourceConfig.source;
    
    if (source === 'user') {
      const userData = this.getUserDataFromStorage();
      if (this.debug) {
        console.log('🔍 DataService.getHabits() called (USER DATA), returning:', userData.habits.length, 'habits');
      }
      return userData.habits;
    }
    
    // Default to mock data
    if (this.debug) {
      console.log('🔍 DataService.getHabits() called (MOCK DATA), returning:', mockHabits.length, 'habits');
    }
    return mockHabits;
  }

  getLogs(): HabitLog[] {
    const source = dataSourceConfig.source;
    
    if (source === 'user') {
      const userData = this.getUserDataFromStorage();
      if (this.debug) {
        console.log('🔍 DataService.getLogs() called (USER DATA), returning:', userData.logs.length, 'logs');
        console.log('🔍 Log date range:', userData.logs.length > 0 ? `${userData.logs[0].date} to ${userData.logs[userData.logs.length-1].date}` : 'No logs');
      }
      return userData.logs;
    }
    
    // Default to mock data
    if (this.debug) {
      console.log('🔍 DataService.getLogs() called (MOCK DATA), returning:', mockLogs.length, 'logs');
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
