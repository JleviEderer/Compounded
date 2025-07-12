
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

// Main migration function that persists changes
export function runPhase05Migration() {
  if (!FEATURE_FLAGS.GOALS_V1) {
    console.log('🔄 Migration: GOALS_V1 flag is OFF, skipping migration');
    return;
  }

  // Import dataService dynamically to avoid circular dependency
  import('@/services/dataService').then(({ dataService }) => {
    const currentGoals = dataService.getGoals();
    const currentHabits = dataService.getHabits();
    
    // Ensure default goal exists and save
    const migratedGoals = ensureDefaultGoalExists(currentGoals);
    if (migratedGoals.length !== currentGoals.length) {
      dataService.saveGoals(migratedGoals);
      console.log('🔄 Migration: Created default goal and saved to storage');
    }
    
    // Migrate habits to have goalIds and save
    const migratedHabits = migrateHabitsToDefaultGoal(currentHabits);
    const needsHabitUpdate = migratedHabits.some((habit, index) => 
      JSON.stringify(habit.goalIds) !== JSON.stringify(currentHabits[index]?.goalIds)
    );
    
    if (needsHabitUpdate) {
      dataService.saveHabits(migratedHabits);
      console.log('🔄 Migration: Updated habits with default goal assignments');
    }
    
    console.log('✅ Migration: Phase 0.5 migration completed');
  });
}
