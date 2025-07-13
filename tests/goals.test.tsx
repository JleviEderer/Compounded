
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Goals from '../client/src/pages/Goals';
import { HabitsProvider } from '../client/src/contexts/HabitsProvider';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <HabitsProvider>
    {children}
  </HabitsProvider>
);

describe('Goals Page', () => {
  it('renders empty state with CTA when no goals exist', () => {
    render(<Goals />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Create your first goal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add your first goal/i })).toBeInTheDocument();
  });
});
