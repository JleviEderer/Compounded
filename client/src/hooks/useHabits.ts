import { useState, useEffect, useCallback, useRef } from 'react';
import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../types';
import { dataService } from '../services/dataService';
import { dataSourceConfig } from '../services/dataSourceConfig';
import { toast } from './use-toast';

function clone<T>(arr: T[]): T[] {
  return [...arr];
}

function cloneLogs(logs: HabitLog[]): HabitLog[] {
  return logs.map(l => ({ ...l }));
}

// Use different storage buckets for mock vs user mode
const STORAGE_KEY = dataSourceConfig.source === 'mock' 
  ? 'compounded-data-mock' 
  : 'compounded-data';

interface AppData {
  habits: HabitPair[];
  logs: HabitLog[];
  settings: {
    theme: 'light' | 'dark';
    nerdMode: boolean;
  };
}

export function useHabits() {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoadRef = useRef(true);
  const hasShownFirstEditToastRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedHabitId, setLastSavedHabitId] = useState<string | null>(null);
  const [logsUpdatedAt, setLogsUpdatedAt] = useState(0);

  // Initialize data state
  const [data, setData] = useState<AppData>(() => {
    if (dataSourceConfig.enableLocalStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('🏠 useHabits: Loaded from localStorage:', parsed.habits?.length || 0, 'habits,', parsed.logs?.length || 0, 'logs');
          return {
            habits: parsed.habits || [],
            logs: parsed.logs || [],
            settings: {
              theme: 'light',
              nerdMode: false,
              ...parsed.settings
            }
          };
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    }

    // Fallback to dataService
    return {
      habits: dataService.getHabits(),
      logs: dataService.getLogs(),
      settings: { theme: 'light', nerdMode: false }
    };
  });

  const debouncedSave = useCallback((dataToSave: AppData, habitId?: string) => {
    // Always allow saves for testing, even in mock mode
    // if (!dataSourceConfig.enableLocalStorage) return;

    // Skip on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for 500ms
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log('💾 Auto-saved:', dataToSave.habits.length, 'habits,', dataToSave.logs.length, 'logs');

        // Show one-time micro-toast on first edit
        if (!hasShownFirstEditToastRef.current) {
          hasShownFirstEditToastRef.current = true;
          toast({
            title: "✓ Autosave on — changes are saved automatically.",
            duration: 2000,
          });
        }

        // Show inline flash for specific habit
        if (habitId) {
          setLastSavedHabitId(habitId);
          setTimeout(() => setLastSavedHabitId(null), 800);
        }
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
        toast({
          title: "⚠︎ Offline, will retry",
          description: "Failed to save changes",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const addHabit = (goodHabit: string, badHabit: string, weight: HabitWeight) => {
    const newHabit: HabitPair = {
      id: Date.now().toString(),
      goodHabit,
      badHabit,
      weight,
      createdAt: new Date()
    };

    setData(prev => {
      const newData = {
        ...prev,
        habits: [...prev.habits, newHabit]
      };

      // Trigger flash feedback for new habit
      setTimeout(() => debouncedSave(newData, newHabit.id), 0);

      return newData;
    });
  };

  const updateHabit = (id: string, updates: Partial<HabitPair>) => {
    setData(prev => {
      const newData = {
        ...prev,
        habits: prev.habits.map(habit => 
          habit.id === id ? { ...habit, ...updates } : habit
        )
      };

      // Trigger flash feedback for updated habit
      setTimeout(() => debouncedSave(newData, id), 0);

      return newData;
    });
  };

  const deleteHabit = (id: string) => {
    setData(prev => {
      const newLogs = prev.logs.filter(log => log.habitId !== id);
      const newData = {
        ...prev,
        habits: prev.habits.filter(habit => habit.id !== id),
        logs: clone(newLogs)
      };
      setLogsUpdatedAt(Date.now());
      return newData;
    });
  };

  const logHabit = (habitId: string, date: string, state: HabitLogState) => {
    setData(prev => {
      const newLogs = prev.logs.filter(log => !(log.habitId === habitId && log.date === date));

      if (state !== HabitLogState.UNLOGGED) {
        const newLog = {
          id: `${habitId}-${date}`,
          habitId,
          date,
          state,
          completed: state === HabitLogState.GOOD || state === 'good'
        };
        if (import.meta.env.DEV) console.log('[PUSH]', newLog);
        newLogs.push(newLog);
      }

      console.log('🔄 Habit logged:', { habitId, date, state, totalLogs: newLogs.length });

      // Trigger save with habit ID for targeted feedback
      const newData = {
        habits: prev.habits,       // keep same habits ref (fine)
        logs: [...newLogs],        // ← force fresh array every time
        settings: { ...prev.settings }
      };
      setTimeout(() => debouncedSave(newData, habitId), 0);

      setLogsUpdatedAt(Date.now());
      return newData;
    });

    // ─── DEBUG: confirm save & clone ───
    if (import.meta.env.DEV) {
      console.log('[SAVE]', date, state, 'len', data.logs.length, 'isArray', Array.isArray(data.logs));
    }
    // ────────────────────────────────────
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
        logs: clone(importedData.logs || []),
        settings: {
          theme: 'light',
          nerdMode: false,
          ...importedData.settings
        }
      });

      setLogsUpdatedAt(Date.now());
      return true;
    } catch {
      return false;
    }
  };

  const resetData = () => {
    // Clear localStorage completely for a fresh start
    if (dataSourceConfig.enableLocalStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }

    setData({
      habits: [],
      logs: clone([]),
      settings: { theme: 'light', nerdMode: false }
    });

    setLogsUpdatedAt(Date.now());
  };

  return {
    habits: data.habits,
    logs: data.logs,
    settings: data.settings,
    isSaving,
    lastSavedHabitId,
    logsUpdatedAt,
    addHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    getHabitLog,
    updateSettings,
    exportData,
    importData,
    resetData
  };
}