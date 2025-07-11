
import { useState, useEffect } from 'react';
import { Goal } from '@/types';
import { dataService } from '@/services/dataService';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  // Load goals from dataService
  useEffect(() => {
    const loadedGoals = dataService.getGoals();
    setGoals(loadedGoals.map((g: any) => ({
      ...g,
      createdAt: new Date(g.createdAt),
      targetDate: g.targetDate ? new Date(g.targetDate) : undefined
    })));
  }, []);

  // Save goals through dataService
  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    dataService.saveGoals(newGoals);
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
