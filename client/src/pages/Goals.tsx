import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { GoalDialog } from '@/components/GoalDialog';
import { GoalRow } from '@/components/GoalRow';
import { GoalCard } from '@/components/GoalCard';
import { sortGoalsByHorizon } from '@/utils/goalUtils';

// Empty state component to keep main Goals component under 250 LoC
const EmptyState = () => (
  <motion.div 
    className="text-center py-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    <div className="w-16 h-16 bg-gradient-to-r from-coral to-pink-400 rounded-full flex items-center justify-center mb-6 mx-auto">
      <Target className="w-8 h-8 text-white" />
    </div>
    <div className="text-gray-500 dark:text-gray-400 mb-4">
      No goals yet. Ready to set your first objective?
    </div>
    <GoalDialog
      trigger={
        <Button className="bg-coral hover:bg-coral/90 text-white px-6 py-3">
          <Plus className="w-5 h-5 mr-3" />
          Add your first goal
        </Button>
      }
    />
  </motion.div>
);

export default function Goals() {
  const { goals } = useGoalsContext();
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const sortedGoals = sortGoalsByHorizon(goals);

  const toggleGoal = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-8">
      <motion.div 
        className="card-glass p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Goals
          </h2>
          {goals.length > 0 && (
            <GoalDialog
              trigger={
                <Button className="bg-coral hover:bg-coral/90 text-white min-h-[44px] min-w-[44px] px-4 py-3 text-base font-medium touch-manipulation">
                  <Plus className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">New Goal</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              }
            />
          )}
        </div>

        <div className="text-gray-600 dark:text-gray-400 mb-6">
          Define your objectives and connect them to your daily habits
        </div>

        {goals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {sortedGoals.map((goal) => (
              <div key={goal.id}>
                <GoalRow
                  goal={goal}
                  isExpanded={expandedGoals.has(goal.id)}
                  onToggle={() => toggleGoal(goal.id)}
                />
                <GoalCard
                  goal={goal}
                  isExpanded={expandedGoals.has(goal.id)}
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}