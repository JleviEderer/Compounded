import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface InsightsQuickStatsProps {
  successRate: number;
  recentAvgRate: number;
  currentStreak: number;
  totalHabits: number;
}

export const InsightsQuickStats: React.FC<InsightsQuickStatsProps> = ({
  successRate,
  recentAvgRate,
  currentStreak,
  totalHabits
}) => {
  // Helper function to get color based on value and type
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 75) return 'text-emerald-500 dark:text-emerald-400';
    if (rate >= 50) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-emerald-500 dark:text-emerald-400';
    if (streak >= 3) return 'text-yellow-500 dark:text-yellow-400';
    if (streak === 0) return 'text-red-500 dark:text-red-400';
    return 'text-coral';
  };

  return (
    <div className="border-t border-gray-700/50 pt-6 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[800px] mx-auto">
        {/* Success Rate */}
        <motion.div 
          className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 text-center border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <div className={`text-2xl font-bold ${getSuccessRateColor(successRate)}`}>
            {successRate.toFixed(0)}%
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-400 mt-1">
            <span>Success Rate</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 opacity-50 hover:opacity-80" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs p-2">
                  <p>Completed logs vs expected frequency-based targets</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Average Daily Rate */}
        <motion.div 
          className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 text-center border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">
            {recentAvgRate >= 0 ? '+' : ''}{(recentAvgRate * 100).toFixed(2)}%
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-400 mt-1">
            <span>Avg Daily Rate</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 opacity-50 hover:opacity-80" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs p-2">
                  <p>Average daily compound rate of improvement</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Current Streak */}
        <motion.div 
          className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 text-center border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`text-2xl font-bold ${getStreakColor(currentStreak)}`}>
            {currentStreak}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-400 mt-1">
            <span>Current Streak</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 opacity-50 hover:opacity-80" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs p-2">
                  <p>Consecutive days with at least one habit completed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Active Habits */}
        <motion.div 
          className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 text-center border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            {totalHabits}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-400 mt-1">
            <span>Active Habits</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 opacity-50 hover:opacity-80" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs p-2">
                  <p>Total number of habits currently being tracked</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      </div>
    </div>
  );
};