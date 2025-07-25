import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeatMapGrid from './HeatMapGrid';
import { useHabitsContext } from '../contexts/HabitsContext';
import { getQuarterWeeks, getIntensityColor } from '@/hooks/useInsightsHelpers';
import { useInsightsNavigation } from '@/hooks/useInsightsNavigation';

interface InsightsQuarterViewProps {
  quarterAnchor: Date;
  setQuarterAnchor: (date: Date) => void;
  openDay: (date: string) => void;
}

export const InsightsQuarterView: React.FC<InsightsQuarterViewProps> = ({
  quarterAnchor,
  setQuarterAnchor,
  openDay
}) => {
  const { habits, logs, logsUpdatedAt } = useHabitsContext();
  const { isCurrentQuarter, getQuarterLabel, navigateQuarter } = useInsightsNavigation(
    new Date(), // weekAnchor (not used here)
    quarterAnchor,
    () => {}, // setWeekAnchor (not used here)
    setQuarterAnchor
  );
  const heatmapData = useMemo(() => {
    console.log('🔄 InsightsQuarterView: Recomputing quarter data, logs.length =', logs.length);
    return getQuarterWeeks(habits, logs, quarterAnchor);
  }, [habits, logs, quarterAnchor]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {getQuarterLabel()}
        </h3>
        <div className="flex space-x-2">
          {!isCurrentQuarter() && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setQuarterAnchor(new Date())}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Current Quarter
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateQuarter('prev')}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateQuarter('next')}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <HeatMapGrid
        key={`quarter-${logsUpdatedAt}`}
        cells={heatmapData}
        gridType="quarter"
        onCellClick={openDay}
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