import { HabitPair, HabitLog, HabitWeight } from '../types';
// Direct import - this is the most reliable method in Vite
import rawJsonData from './myMockData.json';

console.log('🚀 STARTING mockData.ts with direct import...');
console.log('📋 Raw JSON data loaded:', {
  habitsCount: rawJsonData?.habits?.length || 0,
  logsCount: rawJsonData?.logs?.length || 0