import { HabitPair, HabitLog, HabitWeight } from '../types';

// Import JSON data with error handling
let rawData: any;
try {
  rawData = require('./myMockData.json');
  console.log('✅ Successfully imported JSON data:', rawData.logs.length, 'logs');
} catch (error) {
  console.error('❌ Failed to import JSON data:', error);
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
  // Ensure proper typing
  state: log.state as string
}));

console.log('📊 Imported custom mock data:', mockHabits.length, 'habits,', mockLogs.length, 'logs');
console.log('📊 Date range:', mockLogs.length > 0 ? `${mockLogs[0].date} to ${mockLogs[mockLogs.length-1].date}` : 'No logs');

// Debug: Show June 2025 data specifically
const june2025Logs = mockLogs.filter(log => log.date.startsWith('2025-06'));
console.log('📊 June 2025 logs found:', june2025Logs.length);
if (june2025Logs.length > 0) {
  console.log('📊 June 2025 dates:', june2025Logs.map(l => l.date).sort());
}