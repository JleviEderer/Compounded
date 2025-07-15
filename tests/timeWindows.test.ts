
import { describe, it, expect } from 'vitest';
import { getWindowRange, humanLabel, TIME_WINDOWS } from '../client/src/utils/timeWindows';
import { HabitLog } from '../client/src/types';

describe('timeWindows', () => {
  const mockLogs: HabitLog[] = [
    { id: '1', habitId: '1', date: '2024-01-01', state: 'good', completed: true },
    { id: '2', habitId: '1', date: '2024-06-15', state: 'good', completed: true },
    { id: '3', habitId: '1', date: '2024-12-31', state: 'good', completed: true },
  ];

  describe('TIME_WINDOWS constant', () => {
    it('should have correct time window values', () => {
      expect(TIME_WINDOWS['30d']).toBe(30);
      expect(TIME_WINDOWS.quarter).toBe(90);
      expect(TIME_WINDOWS.year).toBe(365);
      expect(TIME_WINDOWS.all).toBe(-1);
    });
  });

  describe('humanLabel', () => {
    it('should return correct labels for each time window', () => {
      expect(humanLabel('30d')).toBe('30 days');
      expect(humanLabel('quarter')).toBe('quarter');
      expect(humanLabel('year')).toBe('year');
      expect(humanLabel('all')).toBe('all time');
    });

    it('should default to "30 days" for invalid input', () => {
      // @ts-expect-error - testing invalid input
      expect(humanLabel('invalid')).toBe('30 days');
    });
  });

  describe('getWindowRange', () => {
    const fixedDate = new Date('2024-12-31T12:00:00Z');

    it('should return correct range for 30 days', () => {
      const { start, end } = getWindowRange('30d', mockLogs);
      
      // Should be 30 days back from today (including today)
      expect(end.getTime()).toBeGreaterThan(start.getTime());
      
      // Start should be 29 days before end (to include 30 total days)
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(29);
    });

    it('should return correct range for quarter', () => {
      const { start, end } = getWindowRange('quarter', mockLogs);
      
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(89); // 90 days including today
    });

    it('should return correct range for year', () => {
      const { start, end } = getWindowRange('year', mockLogs);
      
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(364); // 365 days including today
    });

    it('should return range from earliest log for "all" time', () => {
      const { start, end } = getWindowRange('all', mockLogs);
      
      expect(start.toISOString().slice(0, 10)).toBe('2024-01-01');
      expect(end.getDate()).toBe(new Date().getDate()); // Should be today
    });

    it('should handle empty logs array for "all" time', () => {
      const { start, end } = getWindowRange('all', []);
      
      // Should return same date for start and end when no logs
      expect(start.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    it('should normalize dates to start/end of day', () => {
      const { start, end } = getWindowRange('30d', mockLogs);
      
      // Start should be at beginning of day (00:00:00)
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      
      // End should be at end of day (23:59:59)
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });
});
