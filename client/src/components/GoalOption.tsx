
import React from 'react';
import { motion } from 'framer-motion';
import { Goal } from '@/types';
import { getGoalHorizon } from '@/utils/goalUtils';
import { cn } from '@/lib/utils';

interface GoalOptionProps {
  goal: Goal;
  isSelected: boolean;
  onToggle: (goalId: string) => void;
}

export function GoalOption({ goal, isSelected, onToggle }: GoalOptionProps) {
  const getGoalColor = (targetDate?: Date) => {
    const horizon = getGoalHorizon(targetDate);
    return {
      'short': 'bg-green-100 text-green-800 border-green-200',
      'mid': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'long': 'bg-blue-100 text-blue-800 border-blue-200'
    }[horizon] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const colorClass = getGoalColor(goal.targetDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
        isSelected 
          ? "bg-blue-50 border-blue-200" 
          : "bg-white hover:bg-gray-50 border-gray-200"
      )}
      onClick={() => onToggle(goal.id)}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(goal.id)}
        className="h-4 w-4 text-blue-600 rounded"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">
            {goal.title}
          </span>
          <span className={cn("px-2 py-1 text-xs rounded-full border", colorClass)}>
            {getGoalHorizon(goal.targetDate)}
          </span>
        </div>
        {goal.description && (
          <p className="text-sm text-gray-500 truncate">
            {goal.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
