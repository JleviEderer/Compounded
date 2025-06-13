import { HabitPair, HabitLog, HabitWeight } from '../types';
import rawData from './myMockData.json';

// Convert the JSON data to proper types
export const mockHabits: HabitPair[] = rawData.habits.map(habit => ({
  ...habit,
  weight: habit.weight as HabitWeight,
  createdAt: new Date(habit.createdAt)
}));

export const mockLogs: HabitLog[] = rawData.logs;

console.log('📊 Imported custom mock data:', mockHabits.length, 'habits,', mockLogs.length, 'logs');
console.log('📊 Date range:', mockLogs.length > 0 ? `${mockLogs[0].date} to ${mockLogs[mockLogs.length-1].date}` : 'No logs');