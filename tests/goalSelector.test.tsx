
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoalSelector } from '../client/src/components/GoalSelector';
import { GoalsProvider } from '../client/src/contexts/GoalsContext';

// Mock goals data
const mockGoals = [
  {
    id: '1',
    title: 'Short-term Goal',
    description: 'A short-term goal',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date()
  },
  {
    id: '2', 
    title: 'Mid-term Goal',
    description: 'A mid-term goal',
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Long-term Goal', 
    description: 'A long-term goal',
    targetDate: new Date(Date.now() + 500 * 24 * 60 * 60 * 1000), // 500 days from now
    createdAt: new Date()
  }
];

vi.mock('@/services/dataService', () => ({
  dataService: {
    getGoals: vi.fn(() => mockGoals),
    saveGoals: vi.fn()
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <GoalsProvider>{children}</GoalsProvider>
);

describe('GoalSelector', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    vi.clearAllMocks();
  });

  it('renders none pill and goal options', () => {
    render(
      <TestWrapper>
        <GoalSelector selectedGoalIds={[]} onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Short-term Goal')).toBeInTheDocument();
    expect(screen.getByText('Mid-term Goal')).toBeInTheDocument();
    expect(screen.getByText('Long-term Goal')).toBeInTheDocument();
  });

  it('calls onChange with empty array when None is clicked', () => {
    render(
      <TestWrapper>
        <GoalSelector selectedGoalIds={['1']} onChange={mockOnChange} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('None'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('toggles goal selection correctly', () => {
    render(
      <TestWrapper>
        <GoalSelector selectedGoalIds={[]} onChange={mockOnChange} />
      </TestWrapper>
    );

    // Select a goal
    fireEvent.click(screen.getByText('Short-term Goal'));
    expect(mockOnChange).toHaveBeenCalledWith(['1']);

    // Test with pre-selected goal to deselect
    render(
      <TestWrapper>
        <GoalSelector selectedGoalIds={['1']} onChange={mockOnChange} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Short-term Goal'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('filters goals based on search term with debounce', async () => {
    render(
      <TestWrapper>
        <GoalSelector selectedGoalIds={[]} onChange={mockOnChange} />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search goals...');
    fireEvent.change(searchInput, { target: { value: 'Short' } });

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('Short-term Goal')).toBeInTheDocument();
    }, { timeout: 200 });

    expect(screen.queryByText('Mid-term Goal')).not.toBeInTheDocument();
    expect(screen.queryByText('Long-term Goal')).not.toBeInTheDocument();
  });

  it('shows selection summary when goals are selected', () => {
    render(
      <TestWrapper>
        <GoalSelector selectedGoalIds={['1', '2']} onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByText('2 goals selected')).toBeInTheDocument();
  });

  it('ensures goalIds array reflects final selections', () => {
    render(
      <TestWrapper>
        <GoalSelector selectedGoalIds={[]} onChange={mockOnChange} />
      </TestWrapper>
    );

    // Select multiple goals
    fireEvent.click(screen.getByText('Short-term Goal'));
    fireEvent.click(screen.getByText('Mid-term Goal'));

    expect(mockOnChange).toHaveBeenCalledWith(['1']);
    expect(mockOnChange).toHaveBeenCalledWith(['2']);
  });
});
