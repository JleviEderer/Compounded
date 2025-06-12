import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../types';

export const mockHabits: HabitPair[] = [
  {
    id: '1',
    goodHabit: 'Read articles',
    badHabit: 'Endless scrolling',
    weight: HabitWeight.MEDIUM,
    createdAt: new Date('2024-06-01')
  },
  {
    id: '2', 
    goodHabit: '10-minute walk',
    badHabit: 'Staying seated all day',
    weight: HabitWeight.LOW,
    createdAt: new Date('2024-06-01')
  },
  {
    id: '3',
    goodHabit: 'Drink water',
    badHabit: 'Sugary drinks', 
    weight: HabitWeight.SMALL,
    createdAt: new Date('2024-06-01')
  },
  {
    id: '4',
    goodHabit: 'Meditate 5 minutes',
    badHabit: 'Rushing into the day',
    weight: HabitWeight.HIGH,
    createdAt: new Date('2024-06-01')
  }
];

// Generate dynamic mock data from 6/1/2024 to yesterday (Today - 1)
export const mockLogs: HabitLog[] = (() => {
  const logs: HabitLog[] = [];
  const startDate = new Date('2024-06-01');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Success rates for each habit (realistic patterns)
  const habitPatterns = {
    '1': { good: 0.60, bad: 0.15, unlogged: 0.25 }, // Reading
    '2': { good: 0.50, bad: 0.20, unlogged: 0.30 }, // Walking  
    '3': { good: 0.70, bad: 0.10, unlogged: 0.20 }, // Water
    '4': { good: 0.55, bad: 0.15, unlogged: 0.30 }  // Meditation
  };

  const currentDate = new Date(startDate);
  while (currentDate <= yesterday) {
    const dateStr = currentDate.toISOString().split('T')[0];

    mockHabits.forEach(habit => {
      const pattern = habitPatterns[habit.id as keyof typeof habitPatterns];
      const rand = Math.random();

      let state: HabitLogState;
      if (rand < pattern.good) {
        state = HabitLogState.GOOD;
      } else if (rand < pattern.good + pattern.bad) {
        state = HabitLogState.BAD;
      } else {
        state = HabitLogState.UNLOGGED;
      }

      // Only create log entries for good and bad states
      if (state !== HabitLogState.UNLOGGED) {
        logs.push({
          id: `${habit.id}-${dateStr}`,
          habitId: habit.id,
          date: dateStr,
          state: state
        });
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log('Generated mock logs:', logs.length, 'entries');
  console.log('Date range:', logs.length > 0 ? `${logs[0].date} to ${logs[logs.length-1].date}` : 'No logs');
  return logs;
})();