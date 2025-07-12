
import { describe, it, expect } from 'vitest';
import { sortGoalsByHorizon, getGoalHorizon } from '@/utils/goalUtils';
import { Goal } from '@/types';

describe('Goal Utils', () => {
  describe('getGoalHorizon', () => {
    const today = new Date();
    
    it('returns "short" for goals within 90 days', () => {
      const shortDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      expect(getGoalHorizon(shortDate)).toBe('short');
    });

    it('returns "mid" for goals within 365 days', () => {
      const midDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 days
      expect(getGoalHorizon(midDate)).toBe('mid');
    });

    it('returns "long" for goals beyond 365 days', () => {
      const longDate = new Date(today.getTime() + 400 * 24 * 60 * 60 * 1000); // 400 days
      expect(getGoalHorizon(longDate)).toBe('long');
    });

    it('returns "none" for undefined target date', () => {
      expect(getGoalHorizon(undefined)).toBe('none');
    });
  });

  describe('sortGoalsByHorizon', () => {
    it('sorts goals by horizon: Short → Mid → Long → None', () => {
      const today = new Date();
      const goals: Goal[] = [
        {
          id: '1',
          title: 'Long Goal',
          targetDate: new Date(today.getTime() + 400 * 24 * 60 * 60 * 1000),
          createdAt: today
        },
        {
          id: '2',
          title: 'Short Goal',
          targetDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          createdAt: today
        },
        {
          id: '3',
          title: 'No Date Goal',
          createdAt: today
        },
        {
          id: '4',
          title: 'Mid Goal',
          targetDate: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000),
          createdAt: today
        }
      ];

      const sorted = sortGoalsByHorizon(goals);
      
      expect(sorted[0].title).toBe('Short Goal');
      expect(sorted[1].title).toBe('Mid Goal');
      expect(sorted[2].title).toBe('Long Goal');
      expect(sorted[3].title).toBe('No Date Goal');
    });
  });
});
