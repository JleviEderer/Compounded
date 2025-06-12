import { useState, useEffect } from 'react';
import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../types';
import { mockHabits, mockLogs } from '../data/mockData';

const STORAGE_KEY = 'compounded-data';

export function useHabits() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          habits: parsed.habits || mockHabits,
          logs: parsed.logs || mockLogs,
          settings: {
            theme: 'light',
            nerdMode: false,
            ...parsed.settings
          }
        };
      } catch {
        // If parsing fails, use mock data
        return {
          habits: mockHabits,
          logs: mockLogs,
          settings: { theme: 'light', nerdMode: false }
        };
      }
    }

    // First time - use mock data
    return {
      habits: mockHabits,
      logs: mockLogs,
      settings: { theme: 'light', nerdMode: false }
    };
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