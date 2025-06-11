import { HabitPair, HabitLog, HabitWeight } from '../types';

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
  const successRates = {
    '1': 0.75, // Reading - moderately consistent
    '2': 0.65, // Walking - lower consistency 
    '3': 0.90, // Water - easy habit, high success
    '4': 0.70  // Meditation - good but not perfect
  };

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    if (date <= today) {
      mockHabits.forEach(habit => {
        // Add some streaks and realistic patterns
        const baseRate = successRates[habit.id as keyof typeof successRates];
        let adjustedRate = baseRate;
        
        // Weekend effect (slightly lower success)
        if (date.getDay() === 0 || date.getDay() === 6) {
          adjustedRate *= 0.85;
        }
        
        // Weekly rhythm (Monday motivation, Friday fatigue)
        if (date.getDay() === 1) adjustedRate *= 1.1; // Monday boost
        if (date.getDay() === 5) adjustedRate *= 0.9;  // Friday drop
        
        // Recent trend (slightly improving over time)
        const daysFromStart = i;
        const trendBoost = Math.min(0.15, daysFromStart * 0.002);
        adjustedRate += trendBoost;
        
        logs.push({
          id: `${habit.id}-${date.toISOString().split('T')[0]}`,
          habitId: habit.id,
          date: date.toISOString().split('T')[0],
          completed: Math.random() < adjustedRate
        });
      });
    }
  }
  
  return logs;
})();
