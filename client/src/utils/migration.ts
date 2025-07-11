
import { Goal, HabitPair } from '@/types';
import { FEATURE_FLAGS } from './featureFlags';

const DEFAULT_GOAL_ID = 'general-goal';

export function createDefaultGoal(): Goal {
  return {
    id: DEFAULT_GOAL_ID,
    title: 'General Health',
    description: 'Default goal for existing habits',
    createdAt: new Date()
  };
}

export function migrateHabitsToDefaultGoal(habits: HabitPair[]): HabitPair[] {
  if (!FEATURE_FLAGS.GOALS_V1) {
    return habits;
  }

  return habits.map(habit => ({
    ...habit,
    goalIds: habit.goalIds?.length ? habit.goalIds : [DEFAULT_GOAL_ID]
  }));
}

export function ensureDefaultGoalExists(goals: Goal[]): Goal[] {
  if (!FEATURE_FLAGS.GOALS_V1) {
    return goals;
  }

  const hasDefaultGoal = goals.some(goal => goal.id === DEFAULT_GOAL_ID);
  if (!hasDefaultGoal) {
    return [createDefaultGoal(), ...goals];
  }

  return goals;
}
