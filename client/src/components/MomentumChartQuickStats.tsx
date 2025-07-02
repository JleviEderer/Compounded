
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface MomentumChartQuickStatsProps {
  todayRate: number;
  recentAvgRate: number;
  avgWindowDays: number;
  dynamicCurrentIndex: number;
  timeFilterGrowth: number;
  selectedRange: string;
  startDate: string;
  projectedTarget: number;
  projWindowDays: number;
}

export const MomentumChartQuickStats = ({
  todayRate,
  recentAvgRate,
  avgWindowDays,
  dynamicCurrentIndex,
  timeFilterGrowth,
  selectedRange,
  startDate,
  projectedTarget,
  projWindowDays
}: MomentumChartQuickStatsProps) => {
  const formatDate = (epochOrDateStr: number | string) => {
    const date = typeof epochOrDateStr === 'number' ? new Date(epochOrDateStr) : new Date(epochOrDateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div className="grid gap-3 grid-cols-2 px-4 sm:px-0 max-w-[640px] mx-auto">
      {/* Top Row */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {todayRate >= 0 ? '+' : ''}{(todayRate * 100).toFixed(2)}%
        </div>
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          Latest Rate
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Daily rate from your most recent day with habit data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {(recentAvgRate * 100).toFixed(2)}%
        </div>
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          Recent Avg Rate
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Recent average rate used to calculate the projected index</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ({avgWindowDays}-day average)
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="text-2xl font-bold text-coral cursor-help"
                key={dynamicCurrentIndex}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {dynamicCurrentIndex.toFixed(2)}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Total Growth since {selectedRange}: {timeFilterGrowth >= 0 ? '+' : ''}{timeFilterGrowth.toFixed(1)}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="text-sm text-gray-600 dark:text-gray-400">Current Index</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Growth since {formatDate(startDate)}
        </div>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {projectedTarget.toFixed(2)}
        </div>
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          Projected Index
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  {selectedRange === 'All Time' 
                    ? 'Current momentum index (no forecast for All Time view)'
                    : `Projected momentum index based on your recent avg rate`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {selectedRange === 'All Time' ? '(current)' : `(${projWindowDays}-day projection)`}
        </div>
      </div>
    </div>
  );
};
