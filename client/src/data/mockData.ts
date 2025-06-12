import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../types';

export const mockHabits: HabitPair[] = [
  {
    id: '1',
    goodHabit: 'Read articles',
    badHabit: 'Endless scrolling',
    weight: HabitWeight.MEDIUM,
    createdAt: new Date('2024-08-15')
  },
  {
    id: '2', 
    goodHabit: '10-minute walk',
    badHabit: 'Staying seated all day',
    weight: HabitWeight.LOW,
    createdAt: new Date('2024-08-16')
  },
  {
    id: '3',
    goodHabit: 'Drink water',
    badHabit: 'Sugary drinks', 
    weight: HabitWeight.SMALL,
    createdAt: new Date('2024-08-17')
  },
  {
    id: '4',
    goodHabit: 'Meditate 5 minutes',
    badHabit: 'Rushing into the day',
    weight: HabitWeight.HIGH,
    createdAt: new Date('2024-08-18')
  }
];

// Generate 90 days of realistic habit logs
export const mockLogs: HabitLog[] = (() => {
  const logs: HabitLog[] = [];
  const startDate = new Date('2024-08-15');
  const today = new Date();

  // Success rates for each habit (realistic patterns)
  const habitPatterns = {
    '1': { good: 0.60, bad: 0.15, unlogged: 0.25 }, // Reading
    '2': { good: 0.50, bad: 0.20, unlogged: 0.30 }, // Walking  
    '3': { good: 0.70, bad: 0.10, unlogged: 0.20 }, // Water
    '4': { good: 0.55, bad: 0.15, unlogged: 0.30 }  // Meditation
  };

  const currentDate = new Date(startDate);
  while (currentDate <= today) {
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

  return logs;
})();