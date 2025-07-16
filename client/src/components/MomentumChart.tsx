import { motion } from 'framer-motion';
import { useState } from 'react';
import { MomentumData } from '../types';
import { MomentumChartHUD } from './MomentumChartHUD';
import { MomentumChartCore } from './MomentumChartCore';
import { MomentumChartTimeRangeSelector } from './MomentumChartTimeRangeSelector';
import { MomentumChartQuickStats } from './MomentumChartQuickStats';

interface MomentumChartProps {
  data: MomentumData[];
  currentMomentum: number;
  totalGrowth: number;
  todayRate: number;
  projectedTarget: number;
  recentAvgRate: number;
  avgWindowDays: number;
  habits?: any[];
  logs?: any[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  timeRanges: { label: string; days: number | null }[];
  projWindowDays: number;
}

export default function MomentumChart({
  data,
  currentMomentum,
  totalGrowth,
  todayRate,
  projectedTarget,
  recentAvgRate,
  avgWindowDays,
  habits = [],
  logs = [],
  selectedRange,
  onRangeChange,
  timeRanges,
  projWindowDays
}: MomentumChartProps) {

  const [hover, setHover] = useState(data[data.length-1]); // last point as default
  const [isDragging, setIsDragging] = useState(false);

  // Use the pre-calculated current momentum from filtered data
  const getDynamicCurrentIndex = () => {
    return currentMomentum;
  };

  // Use the pre-calculated total growth from filtered data
  const getTimeFilterGrowth = () => {
    return totalGrowth;
  };

  // Get start date based on actual filtered data
  const getTimeFilterStartDate = () => {
    if (data.length === 0) return 'start';
    return data[0].date;
  };

  const dynamicCurrentIndex = getDynamicCurrentIndex();
  const timeFilterGrowth = getTimeFilterGrowth();

  const handleHover = (data: MomentumData) => {
    setHover(data);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <motion.section 
      className="relative w-full px-0 sm:px-6 lg:px-8 md:bg-white/50 md:dark:bg-gray-800/50 md:rounded-xl md:shadow-lg md:backdrop-blur-md p-2 sm:p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="mb-2 px-4 sm:px-0 max-w-[640px] mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Momentum Index
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Your compound growth over time
        </p>
      </div>

      {/* Floating HUD positioned directly under title */}
      <MomentumChartHUD hover={hover} />

      <motion.div 
          className="h-[300px] md:h-[300px] w-full mb-4"
          layout
          transition={{ 
            type: window.innerWidth < 768 ? 'tween' : 'spring', 
            stiffness: 80, 
            duration: window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.1 : 0.3 
          }}
        >
        <div className="relative w-full h-full">
          <MomentumChartCore 
            data={data}
            onHover={handleHover}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <MomentumChartTimeRangeSelector 
        timeRanges={timeRanges}
        selectedRange={selectedRange}
        onRangeChange={onRangeChange}
      />

      {/* Quick Stats */}
      <MomentumChartQuickStats 
        todayRate={todayRate}
        recentAvgRate={recentAvgRate}
        avgWindowDays={avgWindowDays}
        dynamicCurrentIndex={dynamicCurrentIndex}
        timeFilterGrowth={timeFilterGrowth}
        selectedRange={selectedRange}
        startDate={getTimeFilterStartDate()}
        projectedTarget={projectedTarget}
        projWindowDays={projWindowDays}
      />
    </motion.section>
  );
}