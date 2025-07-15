
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HabitPair, HabitLog, HabitWeight, Goal } from '../client/src/types';
import { GoalCard } from '../client/src/components/GoalCard';
import { HabitsProvider } from '../client/src/contexts/HabitsProvider';
import { GoalsContext } from '../client/src/contexts/GoalsContext';

// Mock data
const mockHabit: HabitPair = {
  id: 'habit-1',
  goodHabit: 'Exercise daily',
  targetCount: 1,
  targetUnit: 'day',
  weight: HabitWeight.MEDIUM,
  goalIds: ['goal-1']
};

const mockGoal: Goal = {
  id: 'goal-1',
  title: 'Stay Healthy',
  description: 'Maintain physical fitness',
  targetDate: '2025-12-31'
};

const mockLogs: HabitLog[] = [
  // High success rate logs (80%)
  { id: '1', habitId: 'habit-1', date: '2025-01-01', state: 'good' },
  { id: '2', habitId: 'habit-1', date: '2025-01-02', state: 'good' },
  { id: '3', habitId: 'habit-1', date: '2025-01-03', state: 'good' },
  { id: '4', habitId: 'habit-1', date: '2025-01-04', state: 'good' },
  { id: '5', habitId: 'habit-1', date: '2025-01-05', state: 'unlogged' },
];

const mockGoalsContext = {
  goals: [mockGoal],
  addGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
  linkHabitToGoal: vi.fn(),
  unlinkHabitFromGoal: vi.fn()
};

describe('Success Rate Color Integration', () => {
  it('renders GoalCard with colored success rate', () => {
    const { container } = render(
      <GoalsContext.Provider value={mockGoalsContext}>
        <HabitsProvider>
          <GoalCard goal={mockGoal} isExpanded={true} />
        </HabitsProvider>
      </GoalsContext.Provider>
    );

    // Should contain success rate color classes
    expect(container.innerHTML).toContain('text-emerald-600');
    expect(container.innerHTML).toContain('ring-emerald-500');
  });

  it('displays success rate legend in Why pane', () => {
    const { getByText } = render(
      <GoalsContext.Provider value={mockGoalsContext}>
        <HabitsProvider>
          <GoalCard goal={mockGoal} isExpanded={true} />
        </HabitsProvider>
      </GoalsContext.Provider>
    );

    expect(getByText('Green ≥ 75%, Yellow 50-74%, Red < 50%')).toBeInTheDocument();
  });
});
