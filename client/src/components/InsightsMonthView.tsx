
import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeatMapGrid from './HeatMapGrid';
import { useHabits } from '@/hooks/useHabits';
import { getCalendarDays, getIntensityColor } from '@/hooks/useInsightsHelpers';

interface InsightsMonthViewProps {
  anchor: Date;
  setAnchor: (date: Date) => void;
  openDay: (date: string) => void;
}

export const InsightsMonthView: React.FC<InsightsMonthViewProps> = ({
  anchor,
  setAnchor,
  openDay
}) => {
  const selectedDateRef = useRef<string>('');
  const { habits, logs, logsUpdatedAt } = useHabits();

  // ─── DEBUG: show current anchor month ───
  if (import.meta.env.DEV) {
    console.log('[ANCHOR]', anchor.toISOString());
  }
  // ───────────────────────────────────────

  const handleOpenDay = (isoDate: string) => {
    selectedDateRef.current = isoDate;
    openDay(isoDate);
  };

  const heatmapData = useMemo(() => {
    console.log('🔄 InsightsMonthView: Recomputing calendar data, logs.length =', logs.length);
    return getCalendarDays(habits, logs, anchor);
  }, [habits, logs, anchor]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {anchor.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          {(anchor.getFullYear() !== new Date().getFullYear() || anchor.getMonth() !== new Date().getMonth()) && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setAnchor(new Date())}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Current Month
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <HeatMapGrid
        key={`month-${logsUpdatedAt}`}
        cells={heatmapData}
        gridType="month"
        onCellClick={handleOpenDay}
        getIntensityColor={getIntensityColor}
        debugDateRef={selectedDateRef}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          More bad habits
        </div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-rose-500 rounded"></div>
          <div className="w-3 h-3 bg-rose-400 rounded"></div>
          <div className="w-3 h-3 bg-rose-200 rounded"></div>
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
          <div className="w-3 h-3 bg-emerald-300 rounded"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          More good habits
        </div>
      </div>
    </motion.div>
  );
};
