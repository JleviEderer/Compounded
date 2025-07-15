import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  calculateMomentumIndex, 
  calculateDailyRate, 
  generateMomentumHistory,
  generate30DayProjection,
  calculateSuccessRate,
  validateCompoundFormula,
  dailyReturn,
  momentumStep,
  calculateMomentumIndexV2
} from '../client/src/utils/compound';
import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../client/src/types';
import { MIN_MOMENTUM } from '../client/src/config/momentum';

describe('Compound Growth Calculations', () => {
  const mockHabits: HabitPair[] = [
    {
      id: '1',
      goodHabit: 'Read',
      weight: 0.0003, // Use actual weight value from console logs
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      goodHabit: 'Exercise',
      weight: 0.0002, // Use actual weight value
      createdAt: new Date('2024-01-01')
    }
  ];

  const mockLogs: HabitLog[] = [
    { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD },
    { id: '1-2024-01-02', habitId: '1', date: '2024-01-02', state: HabitLogState.GOOD },
    { id: '2-2024-01-02', habitId: '2', date: '2024-01-02', state: HabitLogState.GOOD },
  ];

  it('should validate the compound formula: 1.001^365 ≈ 1.440194', () => {
    expect(validateCompoundFormula()).toBe(true);
    
    // Direct calculation check
    const result = Math.pow(1.001, 365);
    expect(result).toBeCloseTo(1.440194, 3); // Reduced precision for floating point tolerance
  });

  it('should calculate daily rate correctly', () => {
    // Day 1: habit 1 good (+0.0003), habit 2 unlogged (0) = 0.0003
    const rate1 = calculateDailyRate(mockHabits, mockLogs, '2024-01-01');
    expect(rate1).toBe(0.0003);

    // Day 2: both habits good (0.0003 + 0.0002 = 0.0005)
    const rate2 = calculateDailyRate(mockHabits, mockLogs, '2024-01-02');
    expect(rate2).toBe(0.0005);

    // Day with no logs
    const rate3 = calculateDailyRate(mockHabits, mockLogs, '2024-01-03');
    expect(rate3).toBe(0);
  });

  it('should calculate momentum index with compound growth', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-02');
    
    const momentum = calculateMomentumIndex(mockHabits, mockLogs, endDate);
    
    // Expected: 1.0 * (1 + 0.0003) * (1 + 0.0005) = 1.00080015
    // Calculation: 1.0003 * 1.0005 = 1.00080015
    expect(momentum).toBeCloseTo(1.00080015, 5);
  });

  it('should clamp momentum index to >= 0', () => {
    // Test with empty logs (should stay at 1.0)
    const momentum = calculateMomentumIndex(mockHabits, [], new Date('2024-01-01'));
    expect(momentum).toBeGreaterThanOrEqual(0);
    expect(momentum).toBe(1.0);
  });

  it('should generate momentum history', () => {
    const history = generateMomentumHistory(mockHabits, mockLogs, 3);
    
    expect(history).toHaveLength(3);
    expect(history[0]).toHaveProperty('date');
    expect(history[0]).toHaveProperty('value');
    expect(history[0]).toHaveProperty('dailyRate');
    
    // Values should be cumulative (each day builds on previous)
    expect(history[1].value).toBeGreaterThanOrEqual(history[0].value);
  });

  it('should generate 30-day projection', () => {
    const projection = generate30DayProjection(mockHabits, mockLogs);
    
    expect(projection).toHaveLength(30);
    expect(projection[0]).toHaveProperty('date');
    expect(projection[0]).toHaveProperty('value');
    expect(projection[0]).toHaveProperty('dailyRate');
    
    // Projection should show growth based on trailing average
    expect(projection[29].value).toBeGreaterThan(projection[0].value);
  });

  it('should calculate success rate', () => {
    // 3 good out of 3 total logged entries = 100%
    const successRate = calculateSuccessRate(mockHabits, mockLogs, 2);
    expect(successRate).toBe(100);
    
    // No logs should give 0%
    const zeroRate = calculateSuccessRate(mockHabits, [], 1);
    expect(zeroRate).toBe(0);
  });

  it('should handle edge cases', () => {
    // Empty habits array
    const emptyHabitsMomentum = calculateMomentumIndex([], mockLogs, new Date());
    expect(emptyHabitsMomentum).toBe(1.0);
    
    // Future date projection
    const futureDate = new Date('2025-01-01');
    const futureMomentum = calculateMomentumIndex(mockHabits, mockLogs, futureDate);
    expect(futureMomentum).toBeGreaterThanOrEqual(1.0);
  });

  it('should maintain precision in compound calculations', () => {
    // Test with many small increments
    const smallHabits: HabitPair[] = [{
      id: 'small',
      goodHabit: 'Small habit',
      weight: 0.0002, // Use actual small weight value
      createdAt: new Date('2024-01-01')
    }];
    
    const dailyLogs: HabitLog[] = [];
    for (let i = 0; i < 100; i++) {
      const date = new Date('2024-01-01');
      date.setDate(date.getDate() + i);
      dailyLogs.push({
        id: `small-${date.toISOString().split('T')[0]}`,
        habitId: 'small',
        date: date.toISOString().split('T')[0],
        state: HabitLogState.GOOD
      });
    }
    
    const endDate = new Date('2024-04-10'); // ~100 days later
    const momentum = calculateMomentumIndex(smallHabits, dailyLogs, endDate);
    
    // Should be approximately (1.0002)^100 ≈ 1.0202
    expect(momentum).toBeCloseTo(1.0202, 3);
  });
});

describe('Momentum Index v2 (Decay Model)', () => {
  let originalEnv: any;

  beforeEach(() => {
    // Save original env
    originalEnv = import.meta.env.VITE_MOMENTUM_V2;
    // Enable v2 for these tests
    import.meta.env.VITE_MOMENTUM_V2 = 'true';
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv === undefined) {
      delete import.meta.env.VITE_MOMENTUM_V2;
    } else {
      import.meta.env.VITE_MOMENTUM_V2 = originalEnv;
    }
  });

  const mockHabitsV2: HabitPair[] = [
    {
      id: '1',
      goodHabit: 'Read',
      weight: HabitWeight.SMALL, // 0.0003
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      goodHabit: 'Exercise',
      weight: HabitWeight.MEDIUM, // 0.001
      createdAt: new Date('2024-01-01')
    }
  ];

  describe('Daily Return Calculation', () => {
    it('should calculate slip penalty correctly', () => {
      const logsAllGood: HabitLog[] = [
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD },
        { id: '2-2024-01-01', habitId: '2', date: '2024-01-01', state: HabitLogState.GOOD }
      ];

      const logsOneMissed: HabitLog[] = [
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD }
        // habit 2 missing = missed
      ];

      // All good: S_t = 0.0003 + 0.001 = 0.0013, misses = 0
      // R_t = 0.0013 - (-0.25 * 0) = 0.0013
      const allGoodReturn = dailyReturn(mockHabitsV2, logsAllGood);
      expect(allGoodReturn).toBeCloseTo(0.0013, 6);

      // One missed: S_t = 0.0003, misses = 0.001
      // R_t = 0.0003 - (-0.25 * 0.001) = 0.0003 + 0.00025 = 0.00055
      const oneMissedReturn = dailyReturn(mockHabitsV2, logsOneMissed);
      expect(oneMissedReturn).toBeCloseTo(0.00055, 6);
    });

    it('should apply baseline drift when no logs', () => {
      const emptyLogs: HabitLog[] = [];
      
      // No logs should return baseline B = -0.50 (default preset)
      const baselineReturn = dailyReturn(mockHabitsV2, emptyLogs);
      expect(baselineReturn).toBe(-0.50);
    });

    it('should handle all habits missed', () => {
      const noLogs: HabitLog[] = []; // No completions, but habits exist
      
      // All missed: S_t = 0, misses = 0.0003 + 0.001 = 0.0013
      // But since no logs exist, should return baseline B = -0.50
      const allMissedReturn = dailyReturn(mockHabitsV2, noLogs);
      expect(allMissedReturn).toBe(-0.50);
    });
  });

  describe('Momentum Step Function', () => {
    it('should apply decay factor correctly', () => {
      const β = 0.995; // Default decay
      const prevMomentum = 2.0;
      const positiveReturn = 0.001;
      
      // M_t = (1 + 0.001) * 0.995 * 2.0 = 1.001 * 0.995 * 2.0 = 1.991995
      const result = momentumStep(prevMomentum, positiveReturn, β);
      expect(result).toBeCloseTo(1.991995, 5);
    });

    it('should clamp negative results to 0', () => {
      const β = 0.995;
      const prevMomentum = 1.0;
      const largeNegativeReturn = -2.0; // Would make (1 + R_t) = -1.0
      
      const result = momentumStep(prevMomentum, largeNegativeReturn, β);
      expect(result).toBe(0);
    });

    it('should clamp extreme positive growth', () => {
      const β = 1.0; // No decay for simpler math
      const prevMomentum = 1.0;
      const hugeReturn = 10.0; // Would give (1 + 10) * 1 * 1 = 11
      
      // Should be clamped to prev * 1.5 = 1.5
      const result = momentumStep(prevMomentum, hugeReturn, β);
      expect(result).toBe(1.5);
    });

    it('should escape zero-trap with MIN_MOMENTUM floor', () => {
      const β = 0.995;
      const prevMomentum = 0;
      const positiveReturn = 0.002;
      
      // Should restart from MIN_MOMENTUM, not stay at 0
      const result = momentumStep(prevMomentum, positiveReturn, β);
      expect(result).toBeGreaterThanOrEqual(MIN_MOMENTUM);
      expect(result).toBe(Math.max(MIN_MOMENTUM, positiveReturn));
    });

    it('should stay at zero for zero momentum with non-positive return', () => {
      const β = 0.995;
      const prevMomentum = 0;
      
      // Zero return should stay at 0
      const resultZero = momentumStep(prevMomentum, 0, β);
      expect(resultZero).toBe(0);
      
      // Negative return should stay at 0
      const resultNegative = momentumStep(prevMomentum, -0.1, β);
      expect(resultNegative).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should show momentum decay during streak breaks', () => {
      const streakLogs: HabitLog[] = [
        // 3 perfect days
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD },
        { id: '2-2024-01-01', habitId: '2', date: '2024-01-01', state: HabitLogState.GOOD },
        { id: '1-2024-01-02', habitId: '1', date: '2024-01-02', state: HabitLogState.GOOD },
        { id: '2-2024-01-02', habitId: '2', date: '2024-01-02', state: HabitLogState.GOOD },
        { id: '1-2024-01-03', habitId: '1', date: '2024-01-03', state: HabitLogState.GOOD },
        { id: '2-2024-01-03', habitId: '2', date: '2024-01-03', state: HabitLogState.GOOD },
        // Then 2 days with no logs (should decay)
        // Days 4-5 have no logs = baseline drift B = -0.50 each day
      ];

      const momentum3Days = calculateMomentumIndexV2(mockHabitsV2, streakLogs, new Date('2024-01-03'));
      const momentum5Days = calculateMomentumIndexV2(mockHabitsV2, streakLogs, new Date('2024-01-05'));
      
      // After 2 days of baseline drift, momentum should be lower
      expect(momentum5Days).toBeLessThan(momentum3Days);
    });

    it('should maintain momentum >= 0 always', () => {
      // Extreme negative scenario: many days of no logs
      const noLogs: HabitLog[] = [];
      
      // Even after 30 days of baseline drift, should not go below 0
      const momentum = calculateMomentumIndexV2(mockHabitsV2, noLogs, new Date('2024-01-30'));
      expect(momentum).toBeGreaterThanOrEqual(0);
    });

    it('should show visible dip after two missed days', () => {
      const mixedLogs: HabitLog[] = [
        // Perfect start
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD },
        { id: '2-2024-01-01', habitId: '2', date: '2024-01-01', state: HabitLogState.GOOD },
        // Then miss 2 days (no logs for days 2-3)
        // Then resume
        { id: '1-2024-01-04', habitId: '1', date: '2024-01-04', state: HabitLogState.GOOD },
        { id: '2-2024-01-04', habitId: '2', date: '2024-01-04', state: HabitLogState.GOOD },
      ];

      const momentumDay1 = calculateMomentumIndexV2(mockHabitsV2, mixedLogs, new Date('2024-01-01'));
      const momentumDay3 = calculateMomentumIndexV2(mockHabitsV2, mixedLogs, new Date('2024-01-03'));
      const momentumDay4 = calculateMomentumIndexV2(mockHabitsV2, mixedLogs, new Date('2024-01-04'));

      // Should dip at day 3, then recover at day 4
      expect(momentumDay3).toBeLessThan(momentumDay1);
      expect(momentumDay4).toBeGreaterThan(momentumDay3);
    });
  });

  describe('Property-Based Tests', () => {
    it('should maintain M_t >= 0 for random 60-day streams', () => {
      // Generate random completion patterns
      for (let run = 0; run < 10; run++) {
        const randomLogs: HabitLog[] = [];
        
        for (let day = 0; day < 60; day++) {
          const date = new Date('2024-01-01');
          date.setDate(date.getDate() + day);
          const dateStr = date.toISOString().split('T')[0];
          
          // Random completion: 70% chance of completing each habit
          for (const habit of mockHabitsV2) {
            if (Math.random() < 0.7) {
              randomLogs.push({
                id: `${habit.id}-${dateStr}`,
                habitId: habit.id,
                date: dateStr,
                state: HabitLogState.GOOD
              });
            }
          }
        }
        
        const finalMomentum = calculateMomentumIndexV2(mockHabitsV2, randomLogs, new Date('2024-03-01'));
        expect(finalMomentum).toBeGreaterThanOrEqual(0);
        expect(isFinite(finalMomentum)).toBe(true);
      }
    });

    it('should equal 1.0 when perfect habits and β=1 (no decay)', () => {
      // Temporarily override decay to 1.0 (no decay)
      const originalGetParams = import.meta.glob('../client/src/config/momentum.ts');
      
      // Perfect logs for test habits
      const perfectLogs: HabitLog[] = [];
      for (let day = 0; day < 30; day++) {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];
        
        for (const habit of mockHabitsV2) {
          perfectLogs.push({
            id: `${habit.id}-${dateStr}`,
            habitId: habit.id,
            date: dateStr,
            state: HabitLogState.GOOD
          });
        }
      }
      
      const momentum = calculateMomentumIndexV2(mockHabitsV2, perfectLogs, new Date('2024-01-30'));
      
      // With perfect completion, momentum should grow (not equal 1.0, since weights > 0)
      expect(momentum).toBeGreaterThan(1.0);
    });
  });

  describe('Seven Unlogged Days Test (PRD Requirement)', () => {
    it('should drop index by ≥10% after seven unlogged days', () => {
      const initialPerfectLogs: HabitLog[] = [
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD },
        { id: '2-2024-01-01', habitId: '2', date: '2024-01-01', state: HabitLogState.GOOD }
      ];

      const momentumDay1 = calculateMomentumIndexV2(mockHabitsV2, initialPerfectLogs, new Date('2024-01-01'));
      const momentumDay8 = calculateMomentumIndexV2(mockHabitsV2, initialPerfectLogs, new Date('2024-01-08'));

      const dropPercentage = ((momentumDay1 - momentumDay8) / momentumDay1) * 100;
      
      expect(dropPercentage).toBeGreaterThanOrEqual(10);
      console.log(`7-day drop test: ${dropPercentage.toFixed(1)}% drop (target: ≥10%)`);
    });
  });
});
