
import { describe, it, expect } from 'vitest';
import {
  rateToColour,
  colourClass,
  labelForColour,
  SUCCESS_RATE_THRESHOLDS,
} from '../client/src/constants/successRate';

describe('rateToColour', () => {
  it('maps to green', () => {
    expect(rateToColour(80)).toBe('green');
    expect(rateToColour(75)).toBe('green');
  });
  it('maps to yellow', () => {
    expect(rateToColour(74)).toBe('yellow');
    expect(rateToColour(50)).toBe('yellow');
  });
  it('maps to red', () => {
    expect(rateToColour(49)).toBe('red');
    expect(rateToColour(0)).toBe('red');
  });
});

describe('colourClass', () => {
  it('returns default text classes', () => {
    expect(colourClass('green')).toContain('text-emerald');
    expect(colourClass('yellow')).toContain('text-amber');
    expect(colourClass('red')).toContain('text-red');
  });
  it('returns ring classes', () => {
    expect(colourClass('green', 'ring')).toBe('ring-emerald-500');
  });
});

describe('labelForColour', () => {
  it('returns correct labels', () => {
    expect(labelForColour('green')).toBe('On track');
    expect(labelForColour('yellow')).toBe('Needs focus');
    expect(labelForColour('red')).toBe('Stuck');
  });
});

describe('threshold constants', () => {
  it('are numeric fractions', () => {
    expect(SUCCESS_RATE_THRESHOLDS.green).toBe(0.75);
    expect(SUCCESS_RATE_THRESHOLDS.yellow).toBe(0.50);
  });
});
