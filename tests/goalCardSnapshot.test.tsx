
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GoalCard } from '../client/src/components/GoalCard';
import { Goal, HabitPair, HabitWeight } from '../client/src/types';
import { createTestWrapper } from './setup';

// Mock the contexts
vi.mock('../client/src/contexts/GoalsContext', () => ({
  useGoalsContext: () => ({
    deleteGoal: vi.fn()
  })
}));

vi.mock('../client/src/hooks/useHabits', () => ({
  useHabits: () => ({
    habits: mockHabitsSnapshot
  })
}));

vi.mock('../client/src/contexts/HabitsContext', () => ({
  useHabitsContext: () => ({
    logs: mockLogsSnapshot
  })
}));

const mockGoalSnapshot: Goal = {
  id: 'goal-snapshot',
  title: 'Health & Wellness',
  description: 'Comprehensive health improvement goal',
  targetDate: '2025-12-31',
  createdAt: '2025-01-01'
};

const mockHabitsSnapshot: HabitPair[] = [
  {
    id: 'habit-1',
    goodHabit: 'Morning Exercise',
    weight: HabitWeight.LARGE,
    goalIds: ['goal-snapshot'],
    targetCount: 5,
    targetUnit: 'week'
  },
  {
    id: 'habit-2',
    goodHabit: 'Meditation Practice',
    weight: HabitWeight.MEDIUM,
    goalIds: ['goal-snapshot'],
    targetCount: 7,
    targetUnit: 'week'
  },
  {
    id: 'habit-3',
    goodHabit: 'Healthy Cooking',
    weight: HabitWeight.MEDIUM,
    goalIds: ['goal-snapshot'],
    targetCount: 4,
    targetUnit: 'week'
  }
];

const mockLogsSnapshot = [
  { id: '1', habitId: 'habit-1', date: '2025-07-01', state: 'good' as const, completed: true },
  { id: '2', habitId: 'habit-1', date: '2025-07-02', state: 'good' as const, completed: true },
  { id: '3', habitId: 'habit-2', date: '2025-07-01', state: 'good' as const, completed: true },
  { id: '4', habitId: 'habit-2', date: '2025-07-02', state: 'good' as const, completed: true },
  { id: '5', habitId: 'habit-3', date: '2025-07-01', state: 'good' as const, completed: true },
];

describe('GoalCard Snapshot Tests', () => {
  it('should match snapshot for expanded GoalCard with three habits and timeline picker', () => {
    const { container } = render(
      <GoalCard goal={mockGoalSnapshot} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Take snapshot of the entire GoalCard component
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot for collapsed GoalCard', () => {
    const { container } = render(
      <GoalCard goal={mockGoalSnapshot} isExpanded={false} />,
      { wrapper: createTestWrapper() }
    );

    // Should return null when collapsed
    expect(container.firstChild).toBeNull();
  });
});
