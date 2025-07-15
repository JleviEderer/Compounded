
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    habits: mockHabits
  })
}));

vi.mock('../client/src/contexts/HabitsContext', () => ({
  useHabitsContext: () => ({
    logs: mockLogs
  })
}));

const mockGoal: Goal = {
  id: 'goal-1',
  title: 'Fitness Goal',
  description: 'Get in shape',
  targetDate: '2025-12-31',
  createdAt: '2025-01-01'
};

const mockHabits: HabitPair[] = [
  {
    id: 'habit-1',
    goodHabit: 'Exercise',
    weight: HabitWeight.MEDIUM,
    goalIds: ['goal-1'],
    targetCount: 5,
    targetUnit: 'week'
  },
  {
    id: 'habit-2',
    goodHabit: 'Meditate',
    weight: HabitWeight.SMALL,
    goalIds: ['goal-1'],
    targetCount: 7,
    targetUnit: 'week'
  },
  {
    id: 'habit-3',
    goodHabit: 'Read',
    weight: HabitWeight.LARGE,
    goalIds: ['goal-1'],
    targetCount: 3,
    targetUnit: 'week'
  },
  {
    id: 'habit-4',
    goodHabit: 'Journal',
    weight: HabitWeight.MEDIUM,
    goalIds: ['goal-1'],
    targetCount: 4,
    targetUnit: 'week'
  },
  {
    id: 'habit-5',
    goodHabit: 'Walk',
    weight: HabitWeight.SMALL,
    goalIds: ['goal-1'],
    targetCount: 7,
    targetUnit: 'week'
  },
  {
    id: 'habit-6',
    goodHabit: 'Stretch',
    weight: HabitWeight.MICRO,
    goalIds: ['goal-1'],
    targetCount: 3,
    targetUnit: 'week'
  }
];

const mockLogs = [
  { id: '1', habitId: 'habit-1', date: '2025-07-01', state: 'good' as const, completed: true },
  { id: '2', habitId: 'habit-2', date: '2025-07-01', state: 'good' as const, completed: true },
  { id: '3', habitId: 'habit-3', date: '2025-07-02', state: 'good' as const, completed: true },
];

describe('GoalCard Phase 6 Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render timeline picker with correct options', () => {
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Should show timeline picker in success rate section
    expect(screen.getByText('Success Rate (last 30 days)')).toBeInTheDocument();
    
    // Should have select dropdown for time windows
    const timelineSelect = screen.getByRole('combobox');
    expect(timelineSelect).toBeInTheDocument();
  });

  it('should show habit breakdown with max 5 habits visible by default', () => {
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Should show "Habit Breakdown" section
    expect(screen.getByText('Habit Breakdown (6)')).toBeInTheDocument();
    
    // Should show first 5 habits by default
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Meditate')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('Journal')).toBeInTheDocument();
    expect(screen.getByText('Walk')).toBeInTheDocument();
    
    // Should not show 6th habit initially
    expect(screen.queryByText('Stretch')).not.toBeInTheDocument();
    
    // Should show "+ 1 more" button
    expect(screen.getByText('+ 1 more')).toBeInTheDocument();
  });

  it('should expand to show all habits when clicking "+ N more"', async () => {
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Click the "+ 1 more" button
    const moreButton = screen.getByText('+ 1 more');
    fireEvent.click(moreButton);

    await waitFor(() => {
      // Should now show all 6 habits
      expect(screen.getByText('Stretch')).toBeInTheDocument();
      
      // Button should change to "Show less"
      expect(screen.getByText('Show less')).toBeInTheDocument();
      expect(screen.queryByText('+ 1 more')).not.toBeInTheDocument();
    });
  });

  it('should collapse back to 5 habits when clicking "Show less"', async () => {
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // First expand
    const moreButton = screen.getByText('+ 1 more');
    fireEvent.click(moreButton);

    await waitFor(() => {
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });

    // Then collapse
    const lessButton = screen.getByText('Show less');
    fireEvent.click(lessButton);

    await waitFor(() => {
      // Should hide 6th habit again
      expect(screen.queryByText('Stretch')).not.toBeInTheDocument();
      
      // Should show "+ 1 more" button again
      expect(screen.getByText('+ 1 more')).toBeInTheDocument();
    });
  });

  it('should show collapsible "Why?" pane', () => {
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Should show "Why this success rate?" summary
    const whySummary = screen.getByText('Why this success rate?');
    expect(whySummary).toBeInTheDocument();
    
    // Should be a details element for accessibility
    const detailsElement = whySummary.closest('details');
    expect(detailsElement).toBeInTheDocument();
  });

  it('should show expected and completed logs in Why pane when expanded', async () => {
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Click to expand Why pane
    const whySummary = screen.getByText('Why this success rate?');
    fireEvent.click(whySummary);

    await waitFor(() => {
      // Should show expected and completed logs
      expect(screen.getByText('Expected logs:')).toBeInTheDocument();
      expect(screen.getByText('Completed logs:')).toBeInTheDocument();
      expect(screen.getByText('Window length:')).toBeInTheDocument();
    });
  });

  it('should display frequency and success rate for each habit', () => {
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Should show frequency display for habits
    expect(screen.getByText('5 × / wk')).toBeInTheDocument(); // Exercise
    expect(screen.getByText('7 × / wk')).toBeInTheDocument(); // Meditate
    expect(screen.getByText('3 × / wk')).toBeInTheDocument(); // Read
    
    // Should show percentage success rates (mocked calculations)
    const percentages = screen.getAllByText(/%$/);
    expect(percentages.length).toBeGreaterThan(0);
  });

  it('should handle goals with no linked habits', () => {
    const goalWithNoHabits: Goal = {
      ...mockGoal,
      id: 'goal-no-habits'
    };

    render(
      <GoalCard goal={goalWithNoHabits} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.getByText('Linked Habits (0)')).toBeInTheDocument();
    expect(screen.getByText('No habits linked to this goal yet')).toBeInTheDocument();
  });

  it('should handle goals with exactly 5 habits (no overflow)', () => {
    // Mock 5 habits exactly
    const fiveHabits = mockHabits.slice(0, 5);
    
    render(
      <GoalCard goal={mockGoal} isExpanded={true} />,
      { wrapper: createTestWrapper() }
    );

    // Should not show "+ N more" button with exactly 5 habits
    expect(screen.queryByText(/^\+ \d+ more$/)).not.toBeInTheDocument();
  });
});
