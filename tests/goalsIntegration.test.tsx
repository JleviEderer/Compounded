
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock dataService at top level for test isolation
vi.mock('@/services/dataService', () => ({
  dataService: {
    getGoals: vi.fn(() => []),
    saveGoals: vi.fn()
  }
}));

import { GoalsProvider } from '@/contexts/GoalsContext';
import Goals from '@/pages/Goals';
import { GoalDialog } from '@/components/GoalDialog';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <GoalsProvider>{children}</GoalsProvider>
);

describe('Goals Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a goal via GoalDialog and adds it to the list', async () => {
    render(
      <TestWrapper>
        <Goals />
        <GoalDialog />
      </TestWrapper>
    );

    // Should show empty state initially
    expect(screen.getByText('Create your first goal')).toBeInTheDocument();

    // Click to add first goal
    const addButton = screen.getByRole('button', { name: /add your first goal/i });
    fireEvent.click(addButton);

    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Goal' } });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create goal/i });
    fireEvent.click(createButton);

    // Wait for goal to appear in the list
    await waitFor(() => {
      expect(screen.getByText('Test Goal')).toBeInTheDocument();
    });

    // Empty state should be gone
    expect(screen.queryByText('Create your first goal')).not.toBeInTheDocument();
  });

  it('toggles accordion expand/collapse state', async () => {
    // Mock goals data
    const mockGoals = [
      {
        id: '1',
        title: 'Test Goal',
        description: 'Test description',
        createdAt: new Date()
      }
    ];

    // Update mock before rendering
    vi.mocked(require('@/services/dataService').dataService.getGoals).mockReturnValue(mockGoals);

    render(
      <TestWrapper>
        <Goals />
      </TestWrapper>
    );

    // Find the goal row
    const goalRow = screen.getByRole('button', { name: /test goal/i });
    expect(goalRow).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(goalRow);
    expect(goalRow).toHaveAttribute('aria-expanded', 'true');

    // Should show goal details
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    // Click to collapse
    fireEvent.click(goalRow);
    expect(goalRow).toHaveAttribute('aria-expanded', 'false');
  });

  it('validates required title field', async () => {
    render(
      <TestWrapper>
        <GoalDialog />
      </TestWrapper>
    );

    // Open dialog
    const newGoalButton = screen.getByRole('button', { name: /new goal/i });
    fireEvent.click(newGoalButton);

    // Try to submit without title
    const createButton = screen.getByRole('button', { name: /create goal/i });
    fireEvent.click(createButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    // Dialog should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hides FAB when list is empty and shows when goals exist', async () => {
    const { rerender } = render(
      <TestWrapper>
        <Goals />
      </TestWrapper>
    );

    // FAB should be hidden when no goals (empty state present)
    expect(screen.queryByRole('button', { name: /new goal/i })).not.toBeInTheDocument();
    expect(screen.getByText('Create your first goal')).toBeInTheDocument();

    // Mock goals data for rerender
    const mockGoals = [{ id: '1', title: 'Test Goal', createdAt: new Date() }];
    vi.mocked(require('@/services/dataService').dataService.getGoals).mockReturnValueOnce(mockGoals);

    // Rerender with goals present
    rerender(
      <TestWrapper>
        <Goals />
      </TestWrapper>
    );

    // FAB should be visible when goals exist
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new goal/i })).toBeInTheDocument();
    });

    // Empty state should be gone
    expect(screen.queryByText('Create your first goal')).not.toBeInTheDocument();
  });
});
