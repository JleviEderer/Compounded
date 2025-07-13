
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoalsProvider } from '../client/src/contexts/GoalsContext';
import Goals from '../client/src/pages/Goals';

const mockHabits = [
  { id: 'h1', goodHabit: 'Read', weight: 0.5, goalIds: ['g1', 'g2'] },
  { id: 'h2', goodHabit: 'Exercise', weight: 0.3, goalIds: ['g1'] },
  { id: 'h3', goodHabit: 'Meditate', weight: 0.2, goalIds: ['g2'] }
];

const mockGoals = [
  { id: 'g1', title: 'Health Goals', createdAt: new Date() },
  { id: 'g2', title: 'Personal Growth', createdAt: new Date() }
];

vi.mock('@/services/dataService', () => ({
  dataService: {
    getGoals: vi.fn(() => mockGoals),
    saveGoals: vi.fn(),
    getHabits: vi.fn(() => mockHabits),
    saveHabits: vi.fn()
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <GoalsProvider>{children}</GoalsProvider>
);

describe('Goal Deletion Cascade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('strips deleted goal ID from all habits in single batch update', async () => {
    const { dataService } = require('@/services/dataService');
    
    render(
      <TestWrapper>
        <Goals />
      </TestWrapper>
    );

    // Find and delete a goal
    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      // Verify saveHabits was called once with updated habits
      expect(dataService.saveHabits).toHaveBeenCalledTimes(1);
      
      // Verify the habits were updated to remove the deleted goal ID
      const updatedHabits = dataService.saveHabits.mock.calls[0][0];
      updatedHabits.forEach((habit: any) => {
        expect(habit.goalIds).not.toContain('g1'); // Assuming g1 was deleted
      });
    });
  });
});
