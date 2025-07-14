
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-emerald-600">
            {successRate.toFixed(0)}%
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Success Rate</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Completed logs vs expected frequency-based targets</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-purple-600">
            +{(recentAvgRate * 100).toFixed(2)}%
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Avg Daily Rate</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Average daily compound rate of improvement</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-coral">{currentStreak}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Current Streak</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Consecutive days with at least one habit completed</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-blue-600">{totalHabits}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Active Habits</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Total number of habits currently being tracked</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
