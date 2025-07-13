
import React from 'react';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { getGoalHorizon } from '@/utils/goalUtils';
import { cn } from '@/lib/utils';

interface GoalDotsProps {
  goalIds: string[];
  maxVisible?: number;
  className?: string;
}

export function GoalDots({ goalIds, maxVisible = 3, className }: GoalDotsProps) {
  const { getGoalById } = useGoalsContext();

  if (!goalIds || goalIds.length === 0) {
    return null;
  }

  const goals = goalIds.map(id => getGoalById(id)).filter(Boolean);
  const visibleGoals = goals.slice(0, maxVisible);
  const overflowCount = goals.length - maxVisible;

  const getGoalDotColor = (targetDate?: Date) => {
    const horizon = getGoalHorizon(targetDate);
    return {
      'short-term': 'bg-green-500',
      'mid-term': 'bg-yellow-500', 
      'long-term': 'bg-blue-500'
    }[horizon] || 'bg-gray-500';
  };

  const getGoalNames = () => {
    return goals.map(goal => goal!.title).join(', ');
  };

  return (
    <div className={cn("flex items-center gap-1", className)} title={getGoalNames()}>
      {visibleGoals.map((goal, index) => (
        <div
          key={goal!.id}
          className={cn(
            "w-2 h-2 rounded-full",
            getGoalDotColor(goal!.targetDate)
          )}
        />
      ))}
      {overflowCount > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          +{overflowCount}
        </span>
      )}
    </div>
  );
}
