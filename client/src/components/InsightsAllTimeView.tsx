import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import HeatMapGrid from './HeatMapGrid';
import { useHabits } from '@/hooks/useHabits';
import { getAllTimeYears, getIntensityColor } from '@/hooks/useInsightsHelpers';

interface InsightsAllTimeViewProps {
  openMonth: (month: string) => void;
}

export const InsightsAllTimeView: React.FC<InsightsAllTimeViewProps> = ({
  openMonth
}) => {
  const { habits, logs, logsUpdatedAt } = useHabits();
  const heatmapData = useMemo(() => {
    console.log('🔄 InsightsAllTimeView: Recomputing all-time data, logs.length =', logs.length);
    return getAllTimeYears(habits, logs);
  }, [habits, logs]);

  return (
    <motion.div 
      className="space-y-6 overflow-x-hidden px-2 sm:px-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        All Time Overview
      </h3>

      <HeatMapGrid
        key={`all-time-${logsUpdatedAt}`}
        cells={heatmapData}
        gridType="all-time"
        onCellClick={openMonth}
        getIntensityColor={getIntensityColor}
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