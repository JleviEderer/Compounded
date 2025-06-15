import { useState, useEffect } from 'react';
import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../types';
import { dataService } from '../services/dataService';
import { dataSourceConfig } from '../services/dataSourceConfig';

const STORAGE_KEY = 'compounded-data';

export function useHabits() {
  const [data, setData] = useState<AppData>(() => {
    console.log('🏠 useHabits: Initializing data...');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🏠 useHabits: Loaded from localStorage:', parsed.habits?.length, 'habits,', parsed.logs?.length, 'logs');
        return {
          habits: parsed.habits || dataService.getHabits(),
          logs: parsed.logs || dataService.getLogs(),
          settings: {
            theme: 'light',
            nerdMode: false,
            ...parsed.settings
          }
        };
      } catch {
        // If parsing fails, use mock data
        console.log('🏠 useHabits: localStorage parse failed, using mock data');
        return {
          habits: dataService.getHabits(),
          logs: dataService.getLogs(),
          settings: { theme: 'light', nerdMode: false }
        };
      }
    }

    // First time - use mock data
    console.log('🏠 useHabits: First time load, using mock data');
    return {
      habits: dataService.getHabits(),
      logs: dataService.getLogs(),
      settings: { theme: 'light', nerdMode: false }
    };

    /* MOCK DATA OVERRIDE FOR DEBUGGING - COMMENTED OUT
    console.log('🏠 useHabits: FORCING fresh mock data (localStorage disabled)');
    const freshData = {
      habits: dataService.getHabits(),
      logs: dataService.getLogs(),
      settings: { theme: 'light', nerdMode: false }
    };
    console.log('🏠 useHabits: Fresh data loaded:', freshData.habits?.length, 'habits,', freshData.logs?.length, 'logs');
    return freshData;
    */
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addHabit = (goodHabit: string, badHabit: string, weight: HabitWeight) => {
    const newHabit: HabitPair = {
      id: Date.now().toString(),
      goodHabit,
      badHabit,
      weight,
      createdAt: new Date()
    };

    setData(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));
  };

  const updateHabit = (id: string, updates: Partial<HabitPair>) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(habit => 
        habit.id === id ? { ...habit, ...updates } : habit
      )
    }));
  };

  const deleteHabit = (id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(habit => habit.id !== id),
      logs: prev.logs.filter(log => log.habitId !== id)
    }));
  };

  const logHabit = (habitId: string, date: string, state: HabitLogState) => {
    setData(prev => ({
      ...prev,
      logs: prev.logs.filter(log => !(log.habitId === habitId && log.date === date)).concat(
        state === HabitLogState.UNLOGGED
          ? []
          : {
              id: `${habitId}-${date}`,
              habitId,
              date,
              state
            }
      )
    }));
  };

  const getHabitLog = (habitId: string, date: string): HabitLog | undefined => {
    return data.logs.find(log => log.habitId === habitId && log.date === date);
  };

  const updateSettings = (updates: Partial<AppData['settings']>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const exportData = () => {
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compounded-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Validate structure
      if (!importedData.habits || !Array.isArray(importedData.habits)) {
        throw new Error('Invalid data structure');
      }

      setData({
        habits: importedData.habits,
        logs: importedData.logs || [],
        settings: {
          theme: 'light',
          nerdMode: false,
          ...importedData.settings
        }
      });

      return true;
    } catch {
      return false;
    }
  };

  const resetData = () => {
    setData({
      habits: [],
      logs: [],
      settings: { theme: 'light', nerdMode: false }
    });
  };

  return {
    habits: data.habits,
    logs: data.logs,
    settings: data.settings,
    addHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    updateSettings,
    exportData,
    importData,
    resetData
  };
}