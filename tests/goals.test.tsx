
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Goals from '../client/src/pages/Goals';

describe('Goals Page', () => {
  it('renders empty state with CTA when no goals exist', () => {
    render(<Goals />);
    
    expect(screen.getByText('Create your first goal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add your first goal/i })).toBeInTheDocument();
  });
});
