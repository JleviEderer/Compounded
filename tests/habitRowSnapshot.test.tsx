
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HabitRow from '../client/src/components/HabitRow';
import { HabitPair, HabitLog, HabitWeight, HabitLogState } from '../client/src/types';
import { createTestWrapper } from './setup';

// Mock the contexts
vi.mock('../client/src/contexts/HabitsContext', () => ({
  useHabitsContext: () => ({
    logs: mockLogsForSnapshot
  })
}));

const mockHabitForSnapshot: HabitPair = {
  id: 'habit-snapshot',
  goodHabit: 'Morning Exercise',
  weight: HabitWeight.LARGE,
  goalIds: ['goal-1'],
  targetCount: 5,
  targetUnit: 'week'
};

// Create logs for high success rate (≥ 75%)
const mockLogsForSnapshot: HabitLog[] = [
  { id: '1', habitId: 'habit-snapshot', date: '2025-07-01', state: 'good' as const, completed: true },
  { id: '2', habitId: 'habit-snapshot', date: '2025-07-02', state: 'good' as const, completed: true },
  { id: '3', habitId: 'habit-snapshot', date: '2025-07-03', state: 'good' as const, completed: true },
  { id: '4', habitId: 'habit-snapshot', date: '2025-07-04', state: 'good' as const, completed: true },
  { id: '5', habitId: 'habit-snapshot', date: '2025-07-05', state: 'good' as const, completed: true },
  { id: '6', habitId: 'habit-snapshot', date: '2025-07-06', state: 'good' as const, completed: true },
  { id: '7', habitId: 'habit-snapshot', date: '2025-07-07', state: 'good' as const, completed: true },
  { id: '8', habitId: 'habit-snapshot', date: '2025-07-08', state: 'good' as const, completed: true },
  { id: '9', habitId: 'habit-snapshot', date: '2025-07-09', state: 'good' as const, completed: true },
  { id: '10', habitId: 'habit-snapshot', date: '2025-07-10', state: 'good' as const, completed: true },
  { id: '11', habitId: 'habit-snapshot', date: '2025-07-11', state: 'good' as const, completed: true },
  { id: '12', habitId: 'habit-snapshot', date: '2025-07-12', state: 'good' as const, completed: true },
  { id: '13', habitId: 'habit-snapshot', date: '2025-07-13', state: 'good' as const, completed: true },
  { id: '14', habitId: 'habit-snapshot', date: '2025-07-14', state: 'good' as const, completed: true },
  { id: '15', habitId: 'habit-snapshot', date: '2025-07-15', state: 'good' as const, completed: true },
];

describe('HabitRow Snapshot Tests', () => {
  it('should match snapshot with green success rate color (≥ 75%)', () => {
    const mockOnLogHabit = vi.fn();
    
    const { container } = render(
      <HabitRow 
        habit={mockHabitForSnapshot}
        logs={mockLogsForSnapshot}
        onLogHabit={mockOnLogHabit}
        isToday={true}
        showSavedFlash={false}
      />,
      { wrapper: createTestWrapper() }
    );

    // Take snapshot of the entire HabitRow component
    expect(container.firstChild).toMatchSnapshot();
  });
});
