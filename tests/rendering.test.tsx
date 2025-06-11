import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../client/src/pages/Home';
import HabitRow from '../client/src/components/HabitRow';
import WeightSlider from '../client/src/components/WeightSlider';
import { HabitWeight } from '../client/src/types';

// Mock Recharts components
vi.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: () => <div data-testid="reference-line" />
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>
  },
  AnimatePresence: ({ children }: any) => children
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Component Rendering', () => {
  it('should render HabitRow with correct habit information', () => {
    const mockHabit = {
      id: '1',
      goodHabit: 'Read articles',
      badHabit: 'Endless scrolling',
      weight: HabitWeight.MEDIUM,
      createdAt: new Date()
    };

    const mockLogs = [
      {
        id: '1-2024-01-01',
        habitId: '1',
        date: new Date().toISOString().split('T')[0],
        completed: true
      }
    ];

    const mockOnToggle = vi.fn();

    render(
      <HabitRow 
        habit={mockHabit}
        logs={mockLogs}
        onToggle={mockOnToggle}
        isToday={true}
      />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.getByText('Read articles instead of')).toBeInTheDocument();
    expect(screen.getByText('Endless scrolling')).toBeInTheDocument();
    expect(screen.getByText('+0.25%')).toBeInTheDocument();
    expect(screen.getByText('Medium impact')).toBeInTheDocument();
  });

  it('should handle habit toggle interaction', async () => {
    const mockHabit = {
      id: '1',
      goodHabit: 'Test habit',
      badHabit: 'Test bad habit',
      weight: HabitWeight.LOW,
      createdAt: new Date()
    };

    const mockOnToggle = vi.fn();

    render(
      <HabitRow 
        habit={mockHabit}
        logs={[]}
        onToggle={mockOnToggle}
        isToday={true}
      />,
      { wrapper: createTestWrapper() }
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith('1', expect.any(String));
    });
  });

  it('should render WeightSlider with correct weight', () => {
    const mockOnChange = vi.fn();

    render(
      <WeightSlider 
        value={HabitWeight.HIGH}
        onChange={mockOnChange}
      />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.getByText('High (+0.40%)')).toBeInTheDocument();
    expect(screen.getByText('Impact Weight')).toBeInTheDocument();
  });

  it('should handle weight slider changes', async () => {
    const mockOnChange = vi.fn();

    render(
      <WeightSlider 
        value={HabitWeight.SMALL}
        onChange={mockOnChange}
      />,
      { wrapper: createTestWrapper() }
    );

    const slider = screen.getByRole('slider');
    
    // Simulate slider change
    fireEvent.change(slider, { target: { value: '2' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should expand habit row to show weekly view', async () => {
    const mockHabit = {
      id: '1',
      goodHabit: 'Test habit',
      badHabit: 'Test bad habit', 
      weight: HabitWeight.MEDIUM,
      createdAt: new Date()
    };

    const mockOnToggle = vi.fn();

    render(
      <HabitRow 
        habit={mockHabit}
        logs={[]}
        onToggle={mockOnToggle}
      />,
      { wrapper: createTestWrapper() }
    );

    // Find and click the expand button
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    // Should show weekly calendar after expansion
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  it('should render momentum chart components', () => {
    render(<Home />, { wrapper: createTestWrapper() });

    // Chart components should be rendered (mocked)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});