
import { useState, useEffect } from 'react';
import { Goal } from '@/types';

const GOALS_STORAGE_KEY = 'compounded-goals';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  // Load goals from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGoals(parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          targetDate: g.targetDate ? new Date(g.targetDate) : undefined
        })));
      } catch (error) {
        console.warn('Failed to parse stored goals:', error);
      }
    }
  }, []);

  // Save goals to localStorage
  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
  };

  const addGoal = (title: string, description?: string, targetDate?: Date) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      description,
      targetDate,
      createdAt: new Date()
    };
    saveGoals([...goals, newGoal]);
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    const updated = goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    );
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const filtered = goals.filter(goal => goal.id !== id);
    saveGoals(filtered);
  };

  const getGoalById = (id: string) => {
    return goals.find(goal => goal.id === id);
  };

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoalById
  };
}
