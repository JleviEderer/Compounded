import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Goal } from '@/types';
import { HorizonChip } from './HorizonChip';
import { easeOutQuart } from '@/utils/motionConfig';

interface GoalRowProps {
  goal: Goal;
  isExpanded: boolean;
  onToggle: () => void;
}

export function GoalRow({ goal, isExpanded, onToggle }: GoalRowProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: isExpanded 
          ? 'var(--card-hover)' 
          : 'var(--card-background)'
      }}
      transition={{ duration: 0.2, ease: easeOutQuart }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`goal-card-${goal.id}`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white text-base leading-snug">
              {goal.title}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-3">
          <HorizonChip targetDate={goal.targetDate} />
        </div>
      </button>
    </motion.div>
  );
}