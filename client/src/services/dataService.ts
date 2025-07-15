import { HabitPair, HabitLog, Goal, AppData } from '@/types';
import { mockHabits, mockLogs, mockGoals } from '@/data/mockData';
import { dataSourceConfig } from './dataSourceConfig';

class DataService {
  // Debug flag for data flow tracking - can be controlled globally
  private debug = true;

  private getUserDataFromStorage(): { habits: HabitPair[], logs: HabitLog[] } {
    // Use different storage buckets for mock vs user mode
    const key = dataSourceConfig.source === 'mock'
      ? 'compounded-data-mock'
      : 'compounded-data';

    const stored = localStorage.getItem(key);
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
    const src = dataSourceConfig.source;

    if (src === 'user') {
      return this.getUserDataFromStorage().habits;
    }

    // --- mock mode ---
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('compounded-data-mock');
      if (stored) {
        const { habits = [] } = JSON.parse(stored);
        if (this.debug) {
          console.log('🔍 DataService.getHabits() (MOCK-STORAGE) →', habits.length, 'habits');
        }
        return habits;
      }
    }

    // Fallback to pristine demo data
    if (this.debug) {
      console.log('🔍 DataService.getHabits() (MOCK-DEMO) →', mockHabits.length, 'habits');
    }
    return mockHabits;
  }

  getLogs(): HabitLog[] {
    const src = dataSourceConfig.source;

    if (src === 'user') {
      return this.getUserDataFromStorage().logs;
    }

    // --- mock mode ---
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('compounded-data-mock');
      if (stored) {
        const { logs = [] } = JSON.parse(stored);
        if (this.debug) {
          console.log('🔍 DataService.getLogs() (MOCK-STORAGE) →', logs.length, 'logs');
        }
        return logs;
      }
    }

    // Fallback to pristine demo data
    if (this.debug) {
      console.log('🔍 DataService.getLogs() (MOCK-DEMO) →', mockLogs.length, 'logs');
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

  getGoals(): Goal[] {
    const key = dataSourceConfig.source === 'mock'
      ? 'compounded-data-mock'
      : 'compounded-data';

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const goals = parsed.goals || [];
          if (this.debug) {
            console.log(`🔍 DataService.getGoals() (${dataSourceConfig.source.toUpperCase()}-STORAGE) →`, goals.length, 'goals');
          }
          return goals;
        } catch (error) {
          console.error('❌ Failed to parse goals from localStorage:', error);
        }
      }
    }

    // Fallback to pristine demo data only in mock mode
    if (dataSourceConfig.source === 'mock') {
      if (this.debug) {
        console.log('🔍 DataService.getGoals() (MOCK-DEMO) →', mockGoals.length, 'goals');
      }
      return mockGoals;
    }

    // User mode with no data - return empty array
    return [];
  }

  saveGoals(goals: Goal[]): void {
    const key = dataSourceConfig.source === 'mock'
      ? 'compounded-data-mock'
      : 'compounded-data';

    const stored = localStorage.getItem(key);
    let data = { habits: [], logs: [], goals: [] };

    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch (error) {
        if (this.debug) {
          console.error('❌ Failed to parse existing data:', error);
        }
      }
    }

    data.goals = goals;
    localStorage.setItem(key, JSON.stringify(data));

    if (this.debug) {
      console.log('🔍 DataService.saveGoals() saved', goals.length, 'goals to key:', key);
      console.log('🔍 Goals saved:', goals.map(g => ({ id: g.id, title: g.title })));
    }
  }

  saveHabits(habits: HabitPair[]): void {
    const key = dataSourceConfig.source === 'mock'
      ? 'compounded-data-mock'
      : 'compounded-data';

    const stored = localStorage.getItem(key);
    let data = { habits: [], logs: [], goals: [] };

    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch (error) {
        if (this.debug) {
          console.error('❌ Failed to parse existing data:', error);
        }
      }
    }

    data.habits = habits;
    localStorage.setItem(key, JSON.stringify(data));

    if (this.debug) {
      console.log('🔍 DataService.saveHabits() saved', habits.length, 'habits');
    }
  }
}

export const dataService = new DataService();