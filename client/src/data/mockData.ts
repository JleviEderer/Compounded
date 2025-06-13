import { HabitPair, HabitLog, HabitWeight } from '../types';

// Import JSON data with error handling
let rawData: any;
try {
  rawData = require('./myMockData.json');
  console.log('✅ SUCCESS: JSON import loaded', rawData?.logs?.length || 0, 'logs');
} catch (error) {
  console.error('❌ FAILED: JSON import error:', error);
  // Fallback empty data
  rawData = { habits: [], logs: [] };
}

// Convert the JSON data to proper types
export const mockHabits: HabitPair[] = rawData.habits.map((habit: any) => ({
  ...habit,
  weight: habit.weight as HabitWeight,
  createdAt: new Date(habit.createdAt)
}));

export const mockLogs: HabitLog[] = rawData.logs.map((log: any) => ({
  ...log,
  state: log.state as string
}));

console.log('📊 Final mockData output:', mockHabits.length, 'habits,', mockLogs.length, 'logs');
if (mockLogs.length > 0) {
  const sortedDates = mockLogs.map(l => l.date).sort();
  console.log('📊 Date range:', `${sortedDates[0]} to ${sortedDates[sortedDates.length-1]}`);
  console.log('📊 Recent logs sample:', mockLogs.filter(l => l.date.startsWith('2025-06')).slice(0, 5));
}

// Verify we have 2025 data
const june2025Logs = mockLogs.filter(log => log.date.startsWith('2025-06'));
console.log('🎯 CRITICAL: June 2025 logs found:', june2025Logs.length);
if (june2025Logs.length === 0) {
  console.error('❌ NO 2025 DATA - Import failed!');
} else {
  console.log('✅ 2025 data confirmed:', june2025Logs.map(l => l.date).sort());
}