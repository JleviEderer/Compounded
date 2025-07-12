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
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: isExpanded 
          ? 'var(--card-hover)' 
          : 'var(--card-background)'
      }}
      transition={{ duration: 0.2, ease: easeOutQuart }}
      className="card-glass rounded-lg overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`goal-card-${goal.id}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ChevronIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {goal.title}
          </span>
        </div>

        <div className="flex-shrink-0 ml-2">
          <HorizonChip targetDate={goal.targetDate} />
        </div>
      </button>
    </motion.div>
  );
}