
import { describe, it, expect } from 'vitest';
import { rateToColour, colourClass, labelForColour, SUCCESS_RATE_THRESHOLDS } from '../client/src/constants/successRate';

describe('rateToColour', () => {
  it('returns green for rates >= 75%', () => {
    expect(rateToColour(100)).toBe('green');
    expect(rateToColour(80)).toBe('green');
    expect(rateToColour(75)).toBe('green');
  });

  it('returns yellow for rates 50-74%', () => {
    expect(rateToColour(74)).toBe('yellow');
    expect(rateToColour(60)).toBe('yellow');
    expect(rateToColour(50)).toBe('yellow');
  });

  it('returns red for rates < 50%', () => {
    expect(rateToColour(49)).toBe('red');
    expect(rateToColour(25)).toBe('red');
    expect(rateToColour(0)).toBe('red');
  });

  it('handles edge cases correctly', () => {
    expect(rateToColour(74.9)).toBe('yellow');
    expect(rateToColour(49.9)).toBe('red');
  });
});

describe('colourClass', () => {
  it('returns correct text classes', () => {
    expect(colourClass('green')).toBe('text-emerald-600 dark:text-emerald-400');
    expect(colourClass('yellow')).toBe('text-yellow-600 dark:text-yellow-400');
    expect(colourClass('red')).toBe('text-red-600 dark:text-red-400');
  });

  it('returns correct ring classes', () => {
    expect(colourClass('green', 'ring')).toBe('ring-emerald-500');
    expect(colourClass('yellow', 'ring')).toBe('ring-yellow-500');
    expect(colourClass('red', 'ring')).toBe('ring-red-500');
  });

  it('returns correct background classes', () => {
    expect(colourClass('green', 'bg')).toBe('bg-emerald-50 dark:bg-emerald-900/20');
    expect(colourClass('yellow', 'bg')).toBe('bg-yellow-50 dark:bg-yellow-900/20');
    expect(colourClass('red', 'bg')).toBe('bg-red-50 dark:bg-red-900/20');
  });
});

describe('labelForColour', () => {
  it('returns correct labels for each color', () => {
    expect(labelForColour('green')).toBe('On track');
    expect(labelForColour('yellow')).toBe('Needs focus');
    expect(labelForColour('red')).toBe('Stuck');
  });
});

describe('SUCCESS_RATE_THRESHOLDS', () => {
  it('has correct threshold values', () => {
    expect(SUCCESS_RATE_THRESHOLDS.green).toBe(75);
    expect(SUCCESS_RATE_THRESHOLDS.yellow).toBe(50);
  });
});
