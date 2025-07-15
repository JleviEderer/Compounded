
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

// Migration stamp keys
const MIGRATION_STAMP_KEY = '__goodOnlyMigrated';
const FREQUENCY_MIGRATION_STAMP_KEY = '__frequencyMigrated';

// Check if migration has already run
export function hasMigrationRun(): boolean {
  return localStorage.getItem(MIGRATION_STAMP_KEY) === 'true';
}

// Check if frequency migration has already run
export function hasFrequencyMigrationRun(): boolean {
  return localStorage.getItem(FREQUENCY_MIGRATION_STAMP_KEY) === 'true';
}

// Mark migration as completed
function setMigrationStamp(): void {
  localStorage.setItem(MIGRATION_STAMP_KEY, 'true');
}

// Mark frequency migration as completed
function setFrequencyMigrationStamp(): void {
  localStorage.setItem(FREQUENCY_MIGRATION_STAMP_KEY, 'true');
}

// Migrate habits to have default frequency (7 × per week)
export function migrateHabitsToDefaultFrequency(habits: HabitPair[]): HabitPair[] {
  return habits.map(habit => ({
    ...habit,
    targetCount: habit.targetCount ?? 7,
    targetUnit: habit.targetUnit ?? 'week'
  }));
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
    
    console.log('🔄 Migration: Current state - Goals:', currentGoals.length, 'Habits:', currentHabits.length);
    
    // Only run migration if there's actually old data to migrate
    // Don't overwrite existing goals unless they're empty
    if (currentGoals.length === 0) {
      const migratedGoals = ensureDefaultGoalExists(currentGoals);
      dataService.saveGoals(migratedGoals);
      console.log('🔄 Migration: Created default goal for empty goals list');
    } else {
      console.log('🔄 Migration: Goals already exist, skipping goal creation');
    }
    
    // Only migrate habits that don't have goalIds
    const habitsNeedingMigration = currentHabits.filter(habit => !habit.goalIds || habit.goalIds.length === 0);
    if (habitsNeedingMigration.length > 0) {
      const migratedHabits = migrateHabitsToDefaultGoal(currentHabits);
      dataService.saveHabits(migratedHabits);
      console.log('🔄 Migration: Updated habits with default goal assignments');
    } else {
      console.log('🔄 Migration: All habits already have goal assignments');
    }
    
    console.log('✅ Migration: Phase 0.5 migration completed');
    
    // Mark migration as completed
    setMigrationStamp();
  });
}

// Run frequency migration for Phase 5
export function runFrequencyMigration() {
  // Check if already migrated
  if (hasFrequencyMigrationRun()) {
    console.log('🔄 Frequency Migration: Already completed, skipping');
    return;
  }

  // Import dataService dynamically to avoid circular dependency
  import('@/services/dataService').then(({ dataService }) => {
    const currentHabits = dataService.getHabits();
    
    // Only migrate habits that don't have frequency fields
    const habitsNeedingFrequencyMigration = currentHabits.filter(habit => 
      habit.targetCount === undefined || habit.targetUnit === undefined
    );
    
    if (habitsNeedingFrequencyMigration.length > 0) {
      const migratedHabits = migrateHabitsToDefaultFrequency(currentHabits);
      dataService.saveHabits(migratedHabits);
      console.log('🔄 Frequency Migration: Updated habits with default frequency (7 × per week)');
    }
    
    console.log('✅ Frequency Migration: Phase 5 frequency migration completed');
    
    // Mark migration as completed
    setFrequencyMigrationStamp();
  });
}
