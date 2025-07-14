
import { Goal, HabitPair } from '@/types';

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
  return habits.map(habit => ({
    ...habit,
    goalIds: habit.goalIds?.length ? habit.goalIds : [DEFAULT_GOAL_ID]
  }));
}

export function ensureDefaultGoalExists(goals: Goal[]): Goal[] {
  const hasDefaultGoal = goals.some(goal => goal.id === DEFAULT_GOAL_ID);
  if (!hasDefaultGoal) {
    return [createDefaultGoal(), ...goals];
  }

  return goals;
}

// Migration stamp key
const MIGRATION_STAMP_KEY = '__goodOnlyMigrated';

// Check if migration has already run
export function hasMigrationRun(): boolean {
  return localStorage.getItem(MIGRATION_STAMP_KEY) === 'true';
}

// Mark migration as completed
function setMigrationStamp(): void {
  localStorage.setItem(MIGRATION_STAMP_KEY, 'true');
}

// Main migration function that persists changes
export function runPhase05Migration() {
  // Check if already migrated (even after flag removal)
  if (hasMigrationRun()) {
    console.log('🔄 Migration: Already completed, skipping');
    return;
  }

  // Import dataService dynamically to avoid circular dependency
  import('@/services/dataService').then(({ dataService }) => {
    const currentGoals = dataService.getGoals();
    const currentHabits = dataService.getHabits();
    
    // Only run migration if there's actually old data to migrate
    // Don't overwrite existing goals unless they're empty
    if (currentGoals.length === 0) {
      const migratedGoals = ensureDefaultGoalExists(currentGoals);
      dataService.saveGoals(migratedGoals);
      console.log('🔄 Migration: Created default goal for empty goals list');
    }
    
    // Only migrate habits that don't have goalIds
    const habitsNeedingMigration = currentHabits.filter(habit => !habit.goalIds || habit.goalIds.length === 0);
    if (habitsNeedingMigration.length > 0) {
      const migratedHabits = migrateHabitsToDefaultGoal(currentHabits);
      dataService.saveHabits(migratedHabits);
      console.log('🔄 Migration: Updated habits with default goal assignments');
    }
    
    console.log('✅ Migration: Phase 0.5 migration completed');
    
    // Mark migration as completed
    setMigrationStamp();
  });
}
