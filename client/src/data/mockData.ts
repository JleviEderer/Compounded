
import { HabitPair, HabitLog, HabitWeight } from '../types';
// Direct import - this is the most reliable method in Vite
import rawJsonData from './myMockData.json';

console.log('🚀 STARTING mockData.ts with direct import...');
console.log('📋 Raw JSON data loaded:', {
  habitsCount: rawJsonData?.habits?.length || 0,
  logsCount: rawJsonData?.logs?.length || 0
});

// Convert the JSON data to proper types
export const mockHabits: HabitPair[] = rawJsonData.habits?.map((habit: any) => ({
  ...habit,
  weight: habit.weight as HabitWeight,
  createdAt: new Date(habit.createdAt)
})) || [];

export const mockLogs: HabitLog[] = rawJsonData.logs?.map((log: any) => ({
  ...log,
  state: log.state as string
})) || [];

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
