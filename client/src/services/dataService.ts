import { HabitPair, HabitLog, Goal, AppData } from '@/types';
import { mockHabits, mockLogs, mockGoals } from '@/data/mockData';
import { dataSourceConfig } from './dataSourceConfig';

class DataService {
  // Debug flag for data flow tracking - can be controlled globally
  private debug = true;

  private getUserDataFromStorage(): { habits: HabitPair[], logs: HabitLog[] } {
    const stored = localStorage.getItem('compounded-data');
    if (!stored) {
      console.log('📱 No user data found in localStorage, starting fresh');
      return { habits: [], logs: [] };
    }

    try {
      const parsed = JSON.parse(stored);
      console.log('📱 Loaded user data from localStorage:', parsed.habits?.length || 0, 'habits,', parsed.logs?.length || 0, 'logs');
      return {
        habits: parsed.habits || [],
        logs: parsed.logs || []
      };
    } catch (error) {
      console.error('❌ Failed to parse user data from localStorage:', error);
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
    const allLogs = this.getLogs(); // Use the same source logic
    const logs = allLogs.filter(log => log.date === date);
    if (this.debug) {
      console.log(`🔍 DataService.getLogsForDate(${date}):`, logs.length, 'logs found');
      if (logs.length === 0) {
        // Help debug date mismatches
        const availableDates = [...new Set(allLogs.map(log => log.date))].sort();
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
    const allLogs = this.getLogs(); // Use the same source logic
    const logs = allLogs.filter(log => log.habitId === habitId);
    if (this.debug) {
      console.log(`🔍 DataService.getLogsForHabit(${habitId}):`, logs.length, 'logs found');
    }
    return logs;
  }

  async getGoals(): Promise<Goal[]> {
    if (dataSourceConfig.source === 'mock') {
      console.log('🔍 DataService.getGoals() called (MOCK DATA), returning:', mockGoals.length, 'goals');
      return mockGoals;
    }

    // TODO: Real API implementation
    return [];
  }
}

export const dataService = new DataService();