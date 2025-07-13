
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
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="w-24 h-24 bg-gradient-to-r from-coral to-pink-400 rounded-full flex items-center justify-center mb-6">
      <Target className="w-12 h-12 text-white" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
      Create your first goal
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
      Set meaningful goals and connect your habits to track your progress towards what matters most.
    </p>
    <GoalDialog
      trigger={
        <Button className="bg-coral hover:bg-coral/90 text-white px-6 py-3 text-lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Goal
        </Button>
      }
    />
  </div>
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
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Goals
            </h1>
            {/* Hide FAB when list is empty (empty-state CTA suffices) */}
            {goals.length > 0 && (
              <GoalDialog
                trigger={
                  <Button className="bg-coral hover:bg-coral/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                  </Button>
                }
              />
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Define your objectives and connect them to your daily habits
          </p>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-gray-800 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="space-y-2">
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
          </div>
        )}
      </motion.div>
    </div>
  );
}
