import { useState, useEffect, useMemo } from 'react';
import { useHabitsContext as useHabits } from '../contexts/HabitsContext';
import { useMomentum } from './useMomentum';
import { calculateMomentumIndex, calculateSuccessRate, generateMomentumHistory } from '../utils/compound';

type InsightsViewMode = 'week' | 'month' | 'quarter' | 'all-time';

export const useInsightsData = () => {
  const { habits, logs, settings } = useHabits();
  const [activeView, setActiveView] = useState<InsightsViewMode>('week');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [weekAnchor, setWeekAnchor] = useState<Date>(new Date());
  const [quarterAnchor, setQuarterAnchor] = useState<Date>(new Date());

  // Sync anchors when switching views to maintain temporal context
  const setActiveViewWithSync = (newView: InsightsViewMode) => {
    if (newView === 'week') {
      // When switching to week view, sync weekAnchor to current month anchor
      setWeekAnchor(anchor);
    } else if (newView === 'month') {
      // When switching to month view, sync anchor to current weekAnchor's month
      const weekMonth = new Date(weekAnchor.getFullYear(), weekAnchor.getMonth(), 1);
      setAnchor(weekMonth);
    } else if (newView === 'quarter') {
      // When switching to quarter view, sync to current anchor
      setQuarterAnchor(anchor);
    }
    
    setActiveView(newView);
  };

  const getTimeFilterForView = (view: InsightsViewMode) => {
    switch (view) {
      case 'week':
        return { label: '7 D', days: 7 };
      case 'month':
        return { label: '30 D', days: 30 };
      case 'quarter':
        return { label: '3 M', days: 90 };
      case 'all-time':
        return { label: 'All Time', days: null };
      default:
        return { label: '7 D', days: 7 };
    }
  };

  const currentTimeFilter = getTimeFilterForView(activeView);

  const getFilteredLogs = () => {
    if (!currentTimeFilter.days) {
      return logs;
    }

    if (activeView === 'week') {
      // Match the exact logic from getLast7Days in InsightsWeekView
      const offset = (weekAnchor.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(weekAnchor);
      monday.setDate(weekAnchor.getDate() - offset);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startStr = monday.toLocaleDateString('en-CA');
      const endStr = sunday.toLocaleDateString('en-CA');

      return logs.filter(log => log.date >= startStr && log.date <= endStr);
    }

    if (activeView === 'month') {
      const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);

      const startStr = monthStart.toLocaleDateString('en-CA');
      const endStr = monthEnd.toLocaleDateString('en-CA');

      return logs.filter(log => log.date >= startStr && log.date <= endStr);
    }

    if (activeView === 'quarter') {
      const quarterStart = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3, 1);
      const quarterEnd = new Date(quarterStart);
      quarterEnd.setMonth(quarterStart.getMonth() + 3);
      quarterEnd.setDate(quarterEnd.getDate() - 1);

      const startStr = quarterStart.toLocaleDateString('en-CA');
      const endStr = quarterEnd.toLocaleDateString('en-CA');

      return logs.filter(log => log.date >= startStr && log.date <= endStr);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentTimeFilter.days);
    const cutoffStr = cutoffDate.toLocaleDateString('en-CA');

    return logs.filter(log => log.date >= cutoffStr);
  };
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.date);
      switch (activeView) {
        case 'week':
          // Match the exact logic from getLast7Days in InsightsWeekView
          const offset = (weekAnchor.getDay() + 6) % 7; // Monday = 0
          const monday = new Date(weekAnchor);
          monday.setDate(weekAnchor.getDate() - offset);
          
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          
          return logDate >= monday && logDate <= sunday;
        case 'month':
          const startOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
          const endOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
          return logDate >= startOfMonth && logDate <= endOfMonth;
        case 'quarter':
          const startOfQuarter = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3, 1);
          const endOfQuarter = new Date(startOfQuarter);
          endOfQuarter.setMonth(startOfQuarter.getMonth() + 3);
          endOfQuarter.setDate(endOfQuarter.getDate() - 1);
          return logDate >= startOfQuarter && logDate <= endOfQuarter;
        case 'all-time':
          return true;
        default:
          return true;
      }
    });
  }, [logs, activeView, anchor, weekAnchor, quarterAnchor]);

  const momentum = useMemo(() => {
    const momentumIndex = calculateMomentumIndex(habits, filteredLogs, new Date());

    // Calculate success rate based on current time filter
    const days = currentTimeFilter.days || 365; // Use 365 for all-time
    const successRate = calculateSuccessRate(habits, filteredLogs, days);

    // Calculate recent average rate from momentum history
    const history = generateMomentumHistory(habits, logs, 7);
    const recentAvgRate = history.length > 0 
      ? history.reduce((sum, day) => sum + day.dailyRate, 0) / history.length
      : 0;

    return {
      momentumIndex,
      successRate,
      recentAvgRate
    };
  }, [habits, filteredLogs, currentTimeFilter, logs]);

  return {
    habits,
    logs,
    settings,
    activeView,
    setActiveView: setActiveViewWithSync,
    anchor,
    setAnchor,
    weekAnchor,
    setWeekAnchor,
    quarterAnchor,
    setQuarterAnchor,
    currentTimeFilter,
    filteredLogs,
    momentum
  };
};