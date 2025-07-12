import { HabitPair, HabitLog, HabitWeight, Goal } from '../types';

// Production-optimized loading: conditionally load mock data
let rawJsonData: any;

if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK_DATA === 'true') {
  // Development OR explicitly enabled: Load full mock data
  rawJsonData = (await import('../fixtures/myMockData.json')).default;
  console.log('🚀 MOCK DATA: Loaded full dataset for development/demo');
} else {
  // Production default: Minimal empty structure (no 7MB bundle)
  rawJsonData = { 
    habits: [], 
    logs: [],
    _note: 'Production build - mock data excluded for bundle optimization'
  };
  console.log('🚀 PRODUCTION: Using minimal mock data structure (optimized bundle)');
}

console.log('🚀 STARTING mockData.ts with dynamic import...');
console.log('📋 Raw JSON data loaded:', {
  habitsCount: rawJsonData?.habits?.length || 0,
  logsCount: rawJsonData?.logs?.length || 0
});

// DEBUG: Check the actual raw data
if (rawJsonData?.logs) {
  const allRawDates = rawJsonData.logs.map((log: any) => log.date).sort();
  const uniqueRawDates = [...new Set(allRawDates)];
  console.log('🔍 RAW JSON - Total logs:', rawJsonData.logs.length);
  console.log('🔍 RAW JSON - Date range:', `${allRawDates[0]} → ${allRawDates[allRawDates.length-1]}`);
  console.log('🔍 RAW JSON - Unique dates:', uniqueRawDates.length);
  console.log('🔍 RAW JSON - First 5 dates:', uniqueRawDates.slice(0, 5));
  console.log('🔍 RAW JSON - Last 5 dates:', uniqueRawDates.slice(-5));

  // Check for 2025 data specifically
  const raw2025Logs = rawJsonData.logs.filter((log: any) => log.date.startsWith('2025'));
  console.log('🔍 RAW JSON - 2025 logs found:', raw2025Logs.length);
  if (raw2025Logs.length > 0) {
    console.log('🔍 RAW JSON - Sample 2025 logs:', raw2025Logs.slice(0, 3));
  }
} else {
  console.error('❌ RAW JSON - No logs property found!');
}

// Convert the JSON data to proper types with weight mapping
const parsedHabits: HabitPair[] = rawJsonData.habits?.map((habit: any) => {
  // Map JSON weight values to proper HabitWeight enum values
  let mappedWeight: HabitWeight;
  switch (habit.weight) {
    case 0.00025:
      mappedWeight = HabitWeight.SMALL; // 0.0005
      break;
    case 0.0005:
      mappedWeight = HabitWeight.SMALL; // 0.0005
      break;
    case 0.001:
      mappedWeight = HabitWeight.LOW; // 0.001
      break;
    case 0.0025:
      mappedWeight = HabitWeight.MEDIUM; // 0.0025
      break;
    case 0.004:
      mappedWeight = HabitWeight.HIGH; // 0.004
      break;
    default:
      console.warn(`Unknown weight value ${habit.weight}, defaulting to MEDIUM`);
      mappedWeight = HabitWeight.MEDIUM;
  }

  return {
    ...habit,
    weight: mappedWeight,
    createdAt: new Date(habit.createdAt)
  };
}) || [];

const parsedLogs: HabitLog[] = rawJsonData.logs?.map((log: any) => ({
  ...log,
  state: log.state as string
})) || [];



// Apply GOALS_V1 feature flag filtering
import { FEATURE_FLAGS } from '@/utils/featureFlags';

// Filter out bad logs when GOALS_V1 is enabled (Phase 0 migration)
const filteredLogs = FEATURE_FLAGS.GOALS_V1
  ? parsedLogs.filter(log => log.state !== 'bad') // Remove all bad state logs  
  : parsedLogs;

// Export the final filtered data  
export const mockHabits = parsedHabits;
export const mockLogs = filteredLogs;

console.log(`🚀 GOALS_V1 flag is ${FEATURE_FLAGS.GOALS_V1 ? 'ON' : 'OFF'}`);
if (FEATURE_FLAGS.GOALS_V1) {
  console.log(`🔄 Phase 0 Migration: Filtered out bad state logs`);
  console.log(`📊 Logs: ${parsedLogs.length} → ${filteredLogs.length} (removed ${parsedLogs.length - filteredLogs.length} bad logs)`);
}

// Export verification logs (after variables are declared)
console.log('📊 EXPORT VERIFICATION:');
console.log('📊 Habits exported:', mockHabits.length);
console.log('📊 Logs exported:', mockLogs.length);

if (mockLogs.length > 0) {
  const sortedDates = mockLogs.map(l => l.date).sort();
  console.log('📊 Full date range:', `${sortedDates[0]} → ${sortedDates[sortedDates.length-1]}`);

  // Verify 2025 data specifically
  const logs2025 = mockLogs.filter(log => log.date.startsWith('2025'));
  console.log('📊 2025 logs found:', logs2025.length);

  if (logs2025.length > 0) {
    const dates2025 = [...new Set(logs2025.map(l => l.date))].sort();
    console.log('📊 2025 date range:', `${dates2025[0]} → ${dates2025[dates2025.length-1]}`);
    console.log('✅ SUCCESS: 2025 data loaded successfully!');

    // Show sample of recent data
    const recent2025 = logs2025.filter(l => l.date.includes('2025-06')).slice(0, 5);
    console.log('📊 Sample June 2025 logs:', recent2025.map(l => `${l.date}: habit ${l.habitId} = ${l.state}`));
  } else {
    console.error('❌ CRITICAL: NO 2025 DATA FOUND!');
  }

  // Show all unique dates for debugging
  const allUniqueDates = [...new Set(mockLogs.map(l => l.date))].sort();
  console.log('📊 All unique dates count:', allUniqueDates.length);
  console.log('📊 First 10 dates:', allUniqueDates.slice(0, 10));
  console.log('📊 Last 10 dates:', allUniqueDates.slice(-10));
} else {
  console.error('❌ CRITICAL: NO LOGS EXPORTED AT ALL!');
}

import { ensureDefaultGoalExists } from '@/utils/migration';

const rawGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Build Better Learning Habits',
    description: 'Develop consistent reading and mindfulness practices',
    targetDate: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'goal-2', 
    title: 'Improve Physical Health',
    description: 'Stay hydrated and maintain energy levels',
    targetDate: new Date('2025-06-30'),
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'goal-3',
    title: 'Get Fit for Summer',
    description: 'Build a consistent exercise routine',
    targetDate: new Date('2025-08-01'),
    createdAt: new Date('2024-01-01')
  }
];

// Apply migration to ensure default goal exists
export const mockGoals = ensureDefaultGoalExists(rawGoals);

// Trigger Phase 0.5 migration on load
import { runPhase05Migration } from '@/utils/migration';
runPhase05Migration();

console.log(`🔄 Migration: Ensured default goal exists. Total goals: ${mockGoals.length}`);