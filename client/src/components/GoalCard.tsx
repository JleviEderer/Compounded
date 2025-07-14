
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Goal } from '@/types';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { useHabits } from '@/hooks/useHabits';
import { GoalDialog } from './GoalDialog';
import { easeOutQuart } from '@/utils/motionConfig';
import { calculateAggregatedSuccessRate } from '@/utils/frequencyHelpers';
import { useHabitsContext } from '@/contexts/HabitsContext';

// Consistent timeframe for success rate calculations
const DEFAULT_SUCCESS_WINDOW_DAYS = 30;

interface GoalCardProps {
  goal: Goal;
  isExpanded: boolean;
}

export function GoalCard({ goal, isExpanded }: GoalCardProps) {
  const { deleteGoal } = useGoalsContext();
  const { habits } = useHabits();
  const { logs } = useHabitsContext();

  // Find habits linked to this goal
  const linkedHabits = habits.filter(habit => 
    habit.goalIds?.includes(goal.id)
  );

  // Calculate success rate for configurable window
  const calculateGoalSuccessRate = () => {
    if (linkedHabits.length === 0) return null;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - DEFAULT_SUCCESS_WINDOW_DAYS);
    
    // Create habit logs map from completed logs in the period
    const habitLogs: { [habitId: string]: number } = {};
    
    linkedHabits.forEach(habit => {
      const completedCount = logs.filter(log => 
        log.habitId === habit.id && 
        log.date >= startDate.toLocaleDateString('en-CA') &&
        log.date <= endDate.toLocaleDateString('en-CA') &&
        log.state === 'good'
      ).length;
      
      habitLogs[habit.id] = completedCount;
    });
    
    return calculateAggregatedSuccessRate(linkedHabits, habitLogs, startDate, endDate);
  };

  const successRate = calculateGoalSuccessRate();

  const handleDelete = () => {
    deleteGoal(goal.id);
  };

  if (!isExpanded) return null;

  return (
    <motion.div
      id={`goal-card-${goal.id}`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: easeOutQuart }}
      className="overflow-hidden"
      aria-labelledby={`goal-title-${goal.id}`}
    >
      <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {goal.description || 'No description provided'}
            </p>
          </div>

          {/* Success Rate */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Success Rate ({DEFAULT_SUCCESS_WINDOW_DAYS} days)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {successRate !== null ? `${Math.round(successRate)}%` : '– %'}
            </p>
          </div>

          {/* Linked Habits */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Linked Habits ({linkedHabits.length})
            </h4>
            {linkedHabits.length > 0 ? (
              <div className="space-y-1">
                {linkedHabits.map(habit => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {habit.goodHabit}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {habit.targetCount && habit.targetUnit ? (
                        `${habit.targetCount} × / ${habit.targetUnit === 'week' ? 'wk' : habit.targetUnit === 'month' ? 'mo' : 'yr'}`
                      ) : (
                        '7 × / wk'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No habits linked to this goal yet
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <GoalDialog
              goal={goal}
              trigger={
                <Button variant="outline" size="sm" className="flex-1 text-gray-900 dark:text-gray-100">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              }
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  aria-label="Delete goal"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                    Habits linked to this goal will be unlinked.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Goal
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
