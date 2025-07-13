
import React from 'react';
import { Check } from 'lucide-react';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { cn } from '@/lib/utils';

interface GoalSelectorProps {
  selectedGoalIds: string[];
  onChange: (goalIds: string[]) => void;
  className?: string;
}

export function GoalSelector({ selectedGoalIds, onChange, className }: GoalSelectorProps) {
  const { goals } = useGoalsContext();

  const handleNoneClick = () => {
    onChange([]);
  };

  const handleGoalToggle = (goalId: string) => {
    const isSelected = selectedGoalIds.includes(goalId);
    if (isSelected) {
      onChange(selectedGoalIds.filter(id => id !== goalId));
    } else {
      onChange([...selectedGoalIds, goalId]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
        {/* None Option */}
        <button
          onClick={handleNoneClick}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left",
            selectedGoalIds.length === 0
              ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">None</span>
            {selectedGoalIds.length === 0 && (
              <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            )}
          </div>
        </button>

        {/* Goal Options */}
        <div className="max-h-48 overflow-y-auto space-y-1">
          {goals.length === 0 ? (
            <div className="text-center py-3 text-sm text-gray-500 dark:text-gray-400">
              No goals created yet
            </div>
          ) : (
            goals.map((goal) => {
              const isSelected = selectedGoalIds.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={cn(
                    "w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left",
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{goal.title}</div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

      {/* Compact Selection Summary */}
      {selectedGoalIds.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {selectedGoalIds.length} goal{selectedGoalIds.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
