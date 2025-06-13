import { HabitPair, HabitLog, HabitWeight } from '../types';

console.log('🚀 STARTING mockData.ts import process...');

// Import JSON data with comprehensive error handling
let rawData: any;
let importMethod = '';

// Try multiple import methods
try {
  // Method 1: ES6 import (most likely to work in Vite)
  console.log('🔍 Attempting ES6 import...');
  const jsonModule = await import('./myMockData.json');
  rawData = jsonModule.default || jsonModule;
  importMethod = 'ES6 import';
  console.log('✅ SUCCESS: ES6 import worked!', rawData?.logs?.length || 0, 'logs');
} catch (error1) {
  console.log('❌ ES6 import failed:', error1);
  
  try {
    // Method 2: require() fallback
    console.log('🔍 Attempting require() fallback...');
    rawData = require('./myMockData.json');
    importMethod = 'require()';
    console.log('✅ SUCCESS: require() worked!', rawData?.logs?.length || 0, 'logs');
  } catch (error2) {
    console.error('❌ BOTH IMPORTS FAILED!');
    console.error('ES6 error:', error1);
    console.error('require() error:', error2);
    
    // Last resort: empty fallback
    rawData = { habits: [], logs: [] };
    importMethod = 'fallback (empty)';
  }
}

console.log(`📋 Import method used: ${importMethod}`);
console.log('📋 Raw data structure check:', {
  hasHabits: !!rawData?.habits,
  habitsLength: rawData?.habits?.length || 0,
  hasLogs: !!rawData?.logs,
  logsLength: rawData?.logs?.length || 0
});

// Convert the JSON data to proper types
export const mockHabits: HabitPair[] = rawData.habits?.map((habit: any) => ({
  ...habit,
  weight: habit.weight as HabitWeight,
  createdAt: new Date(habit.createdAt)
})) || [];

export const mockLogs: HabitLog[] = rawData.logs?.map((log: any) => ({
  ...log,
  state: log.state as string
})) || [];

console.log('📊 FINAL OUTPUT CHECK:');
console.log('📊 Habits exported:', mockHabits.length);
console.log('📊 Logs exported:', mockLogs.length);

if (mockLogs.length > 0) {
  const sortedDates = mockLogs.map(l => l.date).sort();
  console.log('📊 Date range:', `${sortedDates[0]} → ${sortedDates[sortedDates.length-1]}`);
  
  // Check for 2025 data specifically
  const logs2025 = mockLogs.filter(log => log.date.startsWith('2025'));
  console.log('📊 2025 logs count:', logs2025.length);
  
  if (logs2025.length > 0) {
    const dates2025 = [...new Set(logs2025.map(l => l.date))].sort();
    console.log('📊 2025 date range:', `${dates2025[0]} → ${dates2025[dates2025.length-1]}`);
    console.log('✅ SUCCESS: 2025 data is available!');
  } else {
    console.error('❌ CRITICAL: NO 2025 DATA FOUND!');
  }
} else {
  console.error('❌ CRITICAL: NO LOGS EXPORTED AT ALL!');
}