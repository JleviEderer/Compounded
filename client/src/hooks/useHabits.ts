import { useState, useEffect, useCallback, useRef } from 'react';
import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../types';
import { dataService } from '../services/dataService';
import { dataSourceConfig } from '../services/dataSourceConfig';
import { toast } from './use-toast';

const STORAGE_KEY = 'compounded-data';

export function useHabits() {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoadRef = useRef(true);
  const hasShownFirstEditToastRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedHabitId, setLastSavedHabitId] = useState<string | null>(null);

  const debouncedSave = useCallback((dataToSave: AppData, habitId?: string) => {
    if (!dataSourceConfig.enableLocalStorage) return;

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

        // Show first-edit toast only once
        if (!hasShownFirstEditToastRef.current) {
          hasShownFirstEditToastRef.current = true;
          toast({
            title: "Autosave enabled",
            description: "Your changes are being saved automatically",
            duration: 2000,
          });
        } else if (habitId) {
          // Flash tick for specific habit
          setLastSavedHabitId(habitId);
          setTimeout(() => setLastSavedHabitId(null), 1000);
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
    setData(prev => {
      const newLogs = prev.logs.filter(log => !(log.habitId === habitId && log.date === date));

      if (state !== HabitLogState.UNLOGGED) {
        newLogs.push({
          id: `${habitId}-${date}`,
          habitId,
          date,
          state,
          completed: state === HabitLogState.GOOD
        });
      }

      const newData = {
        ...prev,
        logs: newLogs
      };

      console.log('🔄 Habit logged:', { habitId, date, state, totalLogs: newData.logs.length });

      // Trigger save with habit ID for targeted feedback
      setTimeout(() => debouncedSave(newData, habitId), 0);

      return newData;
    });
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
    // Clear localStorage completely for a fresh start
    if (dataSourceConfig.enableLocalStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }

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
    isSaving,
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