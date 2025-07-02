
import { motion } from 'framer-motion';

interface TimeRange {
  label: string;
  days: number | null;
}

interface MomentumChartTimeRangeSelectorProps {
  timeRanges: TimeRange[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

export const MomentumChartTimeRangeSelector = ({ 
  timeRanges, 
  selectedRange, 
  onRangeChange 
}: MomentumChartTimeRangeSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4 mb-8 justify-center px-4 sm:px-0 max-w-[640px] mx-auto">
      {timeRanges.map((range) => (
        <motion.button
          key={range.label}
          onClick={() => onRangeChange(range.label)}
          className={`px-4 py-3 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 touch-manipulation ${
            selectedRange === range.label
              ? 'bg-coral text-white shadow-lg'
              : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/50'
            }`}
          whileTap={{ scale: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.98 }}
          transition={{ duration: 0.1 }}
          >
            {range.label}
          </motion.button>
        ))}
    </div>
  );
};
