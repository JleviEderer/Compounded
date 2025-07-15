import { HabitPair, HabitLog, Goal, AppData } from '@/types';
import { mockHabits, mockLogs, mockGoals } from '@/data/mockData';
import { dataSourceConfig } from './dataSourceConfig';

class DataService {
  // Debug flag for data flow tracking - can be controlled globally
  private debug = true;

  private getUserDataFromStorage(): { habits: HabitPair[], logs: HabitLog[], goals: Goal[] } {
    // Single storage key for all data
    const key = 'compounded-data';

    const stored = localStorage.getItem(key);
    if (!stored) {
      console.log('📱 No user data found in localStorage, starting fresh');
      return { habits: [], logs: [], goals: [] };
    }

    try {
      const parsed = JSON.parse(stored);
      console.log('📱 Loaded user data from localStorage:', parsed.habits?.length || 0, 'habits,', parsed.logs?.length || 0, 'logs,', parsed.goals?.length || 0, 'goals');
      return {
        habits: parsed.habits || [],
        logs: parsed.logs || [],
        goals: parsed.goals || []
      };
    } catch (error) {
      console.error('❌ Failed to parse user data from localStorage:', error);
      return { habits: [], logs: [], goals: [] };
    }
  }

  setDebugMode(enabled: boolean) {
    this.debug = enabled;
    console.log(`🔧 DataService: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  getHabits(): HabitPair[] {
    const stored = this.getUserDataFromStorage();
    
    // If no habits and in mock mode, seed with mock data
    if (stored.habits.length === 0 && dataSourceConfig.source === 'mock') {
      if (this.debug) {
        console.log('🔍 DataService.getHabits() (SEEDING MOCK) →', mockHabits.length, 'habits');
      }
      return mockHabits;
    }

    if (this.debug) {
      const mode = dataSourceConfig.source === 'mock' ? 'MOCK-STORED' : 'USER';
      console.log(`🔍 DataService.getHabits() (${mode}) →`, stored.habits.length, 'habits');
    }
    return stored.habits;
  }

  getLogs(): HabitLog[] {
    const stored = this.getUserDataFromStorage();
    
    // If no logs and in mock mode, seed with mock data
    if (stored.logs.length === 0 && dataSourceConfig.source === 'mock') {
      if (this.debug) {
        console.log('🔍 DataService.getLogs() (SEEDING MOCK) →', mockLogs.length, 'logs');
        console.log('🔍 Log date range:', mockLogs.length > 0 ? `${mockLogs[0].date} to ${mockLogs[mockLogs.length-1].date}` : 'No logs');
      }
      return mockLogs;
    }

    if (this.debug) {
      const mode = dataSourceConfig.source === 'mock' ? 'MOCK-STORED' : 'USER';
      console.log(`🔍 DataService.getLogs() (${mode}) →`, stored.logs.length, 'logs');
    }
    return stored.logs;
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
    const stored = this.getUserDataFromStorage();
    
    // If no goals and in mock mode, seed with mock data
    if (stored.goals.length === 0 && dataSourceConfig.source === 'mock') {
      if (this.debug) {
        console.log('🔍 DataService.getGoals() (SEEDING MOCK) →', mockGoals.length, 'goals');
      }
      return mockGoals;
    }

    if (this.debug) {
      const mode = dataSourceConfig.source === 'mock' ? 'MOCK-STORED' : 'USER';
      console.log(`🔍 DataService.getGoals() (${mode}) →`, stored.goals.length, 'goals');
    }
    return stored.goals;
  }

  saveGoals(goals: Goal[]): void {
    const key = 'compounded-data';
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
    const key = 'compounded-data';
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
      console.log('🔍 DataService.saveHabits() saved', habits.length, 'habits to key:', key);
    }
  }

  saveLogs(logs: HabitLog[]): void {
    const key = 'compounded-data';
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

    data.logs = logs;
    localStorage.setItem(key, JSON.stringify(data));

    if (this.debug) {
      console.log('🔍 DataService.saveLogs() saved', logs.length, 'logs to key:', key);
    }
  }

  // One-time migration to merge old split buckets
  migrateSplitBuckets(): void {
    const mainKey = 'compounded-data';
    const mockKey = 'compounded-data-mock';
    
    const mainData = localStorage.getItem(mainKey);
    const mockData = localStorage.getItem(mockKey);
    
    if (!mainData && !mockData) {
      if (this.debug) {
        console.log('🔄 Bucket Migration: No existing data found, skipping');
      }
      return;
    }

    let mergedData = { habits: [], logs: [], goals: [] };

    try {
      // Parse main bucket if exists
      if (mainData) {
        const parsed = JSON.parse(mainData);
        mergedData = {
          habits: parsed.habits || [],
          logs: parsed.logs || [],
          goals: parsed.goals || []
        };
        if (this.debug) {
          console.log('🔄 Bucket Migration: Loaded main bucket -', mergedData.habits.length, 'habits,', mergedData.logs.length, 'logs,', mergedData.goals.length, 'goals');
        }
      }

      // Merge mock bucket if exists
      if (mockData) {
        const mockParsed = JSON.parse(mockData);
        const mockHabits = mockParsed.habits || [];
        const mockLogs = mockParsed.logs || [];
        const mockGoals = mockParsed.goals || [];

        // Dedupe by id, prefer newer data
        const habitMap = new Map(mergedData.habits.map(h => [h.id, h]));
        mockHabits.forEach(h => habitMap.set(h.id, h));
        
        const logMap = new Map(mergedData.logs.map(l => [l.id, l]));
        mockLogs.forEach(l => logMap.set(l.id, l));
        
        const goalMap = new Map(mergedData.goals.map(g => [g.id, g]));
        mockGoals.forEach(g => goalMap.set(g.id, g));

        mergedData = {
          habits: Array.from(habitMap.values()),
          logs: Array.from(logMap.values()),
          goals: Array.from(goalMap.values())
        };

        if (this.debug) {
          console.log('🔄 Bucket Migration: Merged mock bucket -', mockHabits.length, 'habits,', mockLogs.length, 'logs,', mockGoals.length, 'goals');
          console.log('🔄 Bucket Migration: Final merged -', mergedData.habits.length, 'habits,', mergedData.logs.length, 'logs,', mergedData.goals.length, 'goals');
        }
      }

      // Save merged result
      localStorage.setItem(mainKey, JSON.stringify(mergedData));

      // Remove old mock bucket
      if (mockData) {
        localStorage.removeItem(mockKey);
        if (this.debug) {
          console.log('🔄 Bucket Migration: Removed old mock bucket');
        }
      }

      console.log('✅ Bucket Migration: Successfully unified storage buckets');

    } catch (error) {
      console.error('❌ Bucket Migration: Failed to migrate split buckets:', error);
    }
  }
}

export const dataService = new DataService();