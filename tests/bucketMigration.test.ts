
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dataService } from '../client/src/services/dataService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Bucket Migration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Enable debug mode for tests
    dataService.setDebugMode(true);
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should handle case with only mock bucket present', () => {
    const mockData = {
      habits: [{ id: 'habit1', goodHabit: 'Read', weight: 0.0002 }],
      logs: [{ id: 'log1', habitId: 'habit1', date: '2024-01-01', state: 'good' }],
      goals: [{ id: 'goal1', title: 'Learn', createdAt: new Date() }]
    };

    localStorageMock.setItem('compounded-data-mock', JSON.stringify(mockData));

    dataService.migrateSplitBuckets();

    const result = localStorageMock.getItem('compounded-data');
    const parsed = JSON.parse(result!);

    expect(parsed.habits).toHaveLength(1);
    expect(parsed.logs).toHaveLength(1);
    expect(parsed.goals).toHaveLength(1);
    expect(localStorageMock.getItem('compounded-data-mock')).toBeNull();
  });

  it('should handle case with only user bucket present', () => {
    const userData = {
      habits: [{ id: 'habit2', goodHabit: 'Exercise', weight: 0.0003 }],
      logs: [{ id: 'log2', habitId: 'habit2', date: '2024-01-01', state: 'good' }],
      goals: [{ id: 'goal2', title: 'Fitness', createdAt: new Date() }]
    };

    localStorageMock.setItem('compounded-data', JSON.stringify(userData));

    dataService.migrateSplitBuckets();

    const result = localStorageMock.getItem('compounded-data');
    const parsed = JSON.parse(result!);

    expect(parsed.habits).toHaveLength(1);
    expect(parsed.habits[0].id).toBe('habit2');
    expect(parsed.logs).toHaveLength(1);
    expect(parsed.goals).toHaveLength(1);
  });

  it('should merge both buckets when present, deduping by id', () => {
    const userData = {
      habits: [
        { id: 'habit1', goodHabit: 'Read', weight: 0.0002 },
        { id: 'habit2', goodHabit: 'Exercise', weight: 0.0003 }
      ],
      logs: [
        { id: 'log1', habitId: 'habit1', date: '2024-01-01', state: 'good' },
        { id: 'log2', habitId: 'habit2', date: '2024-01-01', state: 'good' }
      ],
      goals: [{ id: 'goal1', title: 'Learn', createdAt: new Date() }]
    };

    const mockData = {
      habits: [
        { id: 'habit1', goodHabit: 'Read Books', weight: 0.0005 }, // Same id, should overwrite
        { id: 'habit3', goodHabit: 'Meditate', weight: 0.0001 }    // New habit
      ],
      logs: [
        { id: 'log1', habitId: 'habit1', date: '2024-01-02', state: 'good' }, // Same id, should overwrite
        { id: 'log3', habitId: 'habit3', date: '2024-01-01', state: 'good' }  // New log
      ],
      goals: [
        { id: 'goal1', title: 'Learning', createdAt: new Date() }, // Same id, should overwrite
        { id: 'goal2', title: 'Wellness', createdAt: new Date() }  // New goal
      ]
    };

    localStorageMock.setItem('compounded-data', JSON.stringify(userData));
    localStorageMock.setItem('compounded-data-mock', JSON.stringify(mockData));

    dataService.migrateSplitBuckets();

    const result = localStorageMock.getItem('compounded-data');
    const parsed = JSON.parse(result!);

    // Should have 3 habits total (2 original + 1 new)
    expect(parsed.habits).toHaveLength(3);
    expect(parsed.habits.find((h: any) => h.id === 'habit1').goodHabit).toBe('Read Books'); // Overwritten
    expect(parsed.habits.find((h: any) => h.id === 'habit3')).toBeDefined(); // New

    // Should have 3 logs total
    expect(parsed.logs).toHaveLength(3);
    expect(parsed.logs.find((l: any) => l.id === 'log1').date).toBe('2024-01-02'); // Overwritten

    // Should have 2 goals total
    expect(parsed.goals).toHaveLength(2);
    expect(parsed.goals.find((g: any) => g.id === 'goal1').title).toBe('Learning'); // Overwritten

    // Mock bucket should be removed
    expect(localStorageMock.getItem('compounded-data-mock')).toBeNull();
  });

  it('should handle case with no existing data', () => {
    dataService.migrateSplitBuckets();

    // Should not create any data
    expect(localStorageMock.getItem('compounded-data')).toBeNull();
    expect(localStorageMock.getItem('compounded-data-mock')).toBeNull();
  });
});
