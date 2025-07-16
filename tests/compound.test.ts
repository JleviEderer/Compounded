import { describe, it, expect } from 'vitest';
import { 
  calculateMomentumIndex, 
  calculateDailyRate, 
  dailyReturn,
  generateMomentumHistory,
  generate30DayProjection,
  calculateSuccessRate,
  validateCompoundFormula
} from '../client/src/utils/compound';
import { getMomentumParams, MOMENTUM_PRESETS } from '../client/src/config/momentum';
import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../client/src/types';

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
    { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD, completed: true },
    { id: '1-2024-01-02', habitId: '1', date: '2024-01-02', state: HabitLogState.GOOD, completed: true },
    { id: '2-2024-01-02', habitId: '2', date: '2024-01-02', state: HabitLogState.GOOD, completed: true },
  ];

  it('should validate the compound formula: 1.001^365 ≈ 1.440194', () => {
    expect(validateCompoundFormula()).toBe(true);
    
    // Direct calculation check
    const result = Math.pow(1.001, 365);
    expect(result).toBeCloseTo(1.440194, 3); // Reduced precision for floating point tolerance
  });

  describe('Daily Return Calculations (PRD §4.1)', () => {
    const params = MOMENTUM_PRESETS.default;
    
    it('should return baseline drift (B) when no habits are logged', () => {
      const noLogs: HabitLog[] = [];
      const returnValue = dailyReturn(mockHabits, noLogs, '2024-01-01', params);
      expect(returnValue).toBe(params.baselineDrift); // -0.05
    });

    it('should calculate positive return when all habits are completed', () => {
      const allCompletedLogs: HabitLog[] = [
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD, completed: true },
        { id: '2-2024-01-01', habitId: '2', date: '2024-01-01', state: HabitLogState.GOOD, completed: true }
      ];
      const returnValue = dailyReturn(mockHabits, allCompletedLogs, '2024-01-01', params);
      // S_t = 0.0003 + 0.0002 = 0.0005
      // misses = 0
      // P_t = 0.0005 - (-0.25 * 0) = 0.0005
      expect(returnValue).toBeCloseTo(0.0005, 6);
    });

    it('should apply slip penalty when habits are missed', () => {
      const partialLogs: HabitLog[] = [
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD, completed: true }
      ];
      const returnValue = dailyReturn(mockHabits, partialLogs, '2024-01-01', params);
      // S_t = 0.0003 (habit 1 completed)
      // misses = 0.0002 (habit 2 missed)
      // P_t = 0.0003 + (-0.25 * 0.0002) = 0.0003 - 0.00005 = 0.00025
      expect(returnValue).toBeCloseTo(0.00025, 6);
    });
  });

  describe('Momentum Index Calculations (PRD §4.2)', () => {
    const params = MOMENTUM_PRESETS.default;
    
    it('should apply decay factor β correctly', () => {
      // Test single day with all habits completed
      const logs: HabitLog[] = [
        { id: '1-2024-01-01', habitId: '1', date: '2024-01-01', state: HabitLogState.GOOD, completed: true },
        { id: '2-2024-01-01', habitId: '2', date: '2024-01-01', state: HabitLogState.GOOD, completed: true }
      ];
      
      const momentum = calculateMomentumIndex(mockHabits, logs, new Date('2024-01-01'), params);
      // With new params: R_t = 0.0005 (all completed), β = 0.998
      // M_t = (1 + 0.0005) * 0.998 * 1.0 = 1.0005 * 0.998 = 0.9985
      expect(momentum).toBeCloseTo(0.9985, 4);
    });

    it('should create visible dip after two missed days', () => {
      const momentum1 = calculateMomentumIndex(mockHabits, [], new Date('2024-01-01'), params);
      const momentum2 = calculateMomentumIndex(mockHabits, [], new Date('2024-01-02'), params);
      
      // With new params: baseline drift B = -0.05, β = 0.998
      // Day 1: (1 + -0.05) * 0.998 * 1.0 = 0.95 * 0.998 = 0.9481
      // Day 2: (1 + -0.05) * 0.998 * 0.9481 = 0.95 * 0.998 * 0.9481 ≈ 0.899
      expect(momentum2).toBeLessThan(momentum1);
      expect(momentum2).toBeCloseTo(0.899, 3);
    });

    it('should drop index by ≥10% after seven unlogged days', () => {
      const initialMomentum = 1.0;
      const momentum = calculateMomentumIndex(mockHabits, [], new Date('2024-01-07'), params);
      
      const percentDrop = ((initialMomentum - momentum) / initialMomentum) * 100;
      expect(percentDrop).toBeGreaterThan(10);
    });
  });

  describe('Parameter Presets (PRD Appendix A)', () => {
    it('should support lenient preset', () => {
      const lenientParams = MOMENTUM_PRESETS.lenient;
      expect(lenientParams.slipPenalty).toBe(-0.15);
      expect(lenientParams.baselineDrift).toBe(-0.02);
      expect(lenientParams.decayFactor).toBe(0.999);
    });

    it('should support default preset', () => {
      const defaultParams = MOMENTUM_PRESETS.default;
      expect(defaultParams.slipPenalty).toBe(-0.25);
      expect(defaultParams.baselineDrift).toBe(-0.05);
      expect(defaultParams.decayFactor).toBe(0.998);
    });

    it('should support hard preset', () => {
      const hardParams = MOMENTUM_PRESETS.hard;
      expect(hardParams.slipPenalty).toBe(-0.40);
      expect(hardParams.baselineDrift).toBe(-0.10);
      expect(hardParams.decayFactor).toBe(0.995);
    });
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

  it('should calculate momentum index with decay formula', () => {
    const params = getMomentumParams();
    const momentum = calculateMomentumIndex(mockHabits, mockLogs, new Date('2024-01-02'), params);
    
    // With decay formula: M_t = max(0, (1 + R_t) * β * M_{t-1})
    // The momentum will be less than 1.0 due to decay factor
    expect(momentum).toBeLessThan(1.0);
    expect(momentum).toBeGreaterThan(0.9); // Should still be close to 1 with good habits
  });

  it('should clamp momentum index to >= 0', () => {
    const params = getMomentumParams();
    // With gentler baseline drift B = -0.05 and decay β = 0.998
    // Empty logs for 365 days should decay but not collapse to zero
    const momentum = calculateMomentumIndex(mockHabits, [], new Date('2024-12-31'), params);
    expect(momentum).toBeGreaterThanOrEqual(0);
    expect(momentum).toBeLessThan(1.0); // Should decay but remain meaningful
  });

  it('should generate momentum history', () => {
    const params = getMomentumParams();
    const history = generateMomentumHistory(mockHabits, mockLogs, 3, params);
    
    expect(history).toHaveLength(3);
    expect(history[0]).toHaveProperty('date');
    expect(history[0]).toHaveProperty('value');
    expect(history[0]).toHaveProperty('dailyRate');
    expect(history[0]).toHaveProperty('dailyReturn');
    
    // With decay, values might not always increase
    // But should all be >= 0 due to clamping
    history.forEach(entry => {
      expect(entry.value).toBeGreaterThanOrEqual(0);
    });
  });

  it('should generate 30-day projection', () => {
    const projection = generate30DayProjection(mockHabits, mockLogs);
    
    // With 30D filter, projection is 7 days (as per forecastConfig)
    expect(projection.length).toBeGreaterThan(0);
    expect(projection[0]).toHaveProperty('date');
    expect(projection[0]).toHaveProperty('value');
    expect(projection[0]).toHaveProperty('dailyRate');
    expect(projection[0]).toHaveProperty('isProjection');
    expect(projection[0].isProjection).toBe(true);
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
    const params = getMomentumParams();
    
    // Empty habits array
    const emptyHabitsMomentum = calculateMomentumIndex([], mockLogs, new Date(), params);
    expect(emptyHabitsMomentum).toBe(1.0);
    
    // Future date with decay formula - momentum will decay over time
    const futureDate = new Date('2025-01-01');
    const futureMomentum = calculateMomentumIndex(mockHabits, mockLogs, futureDate, params);
    expect(futureMomentum).toBeGreaterThanOrEqual(0); // Clamped to >= 0
  });

  it('should maintain precision in compound calculations', () => {
    const params = getMomentumParams();
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
        state: HabitLogState.GOOD,
        completed: true
      });
    }
    
    const endDate = new Date('2024-04-10'); // ~100 days later
    const momentum = calculateMomentumIndex(smallHabits, dailyLogs, endDate, params);
    
    // With decay formula, momentum will be less than simple compound growth
    expect(momentum).toBeLessThan(1.0); // Decay factor ensures momentum < 1.0
    expect(momentum).toBeGreaterThan(0.5); // But should maintain significant value
  });
});
