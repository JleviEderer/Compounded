
import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { cn } from '@/lib/utils';

interface GoalSelectorProps {
  selectedGoalIds: string[];
  onChange: (goalIds: string[]) => void;
  className?: string;
}

export function GoalSelector({ selectedGoalIds, onChange, className }: GoalSelectorProps) {
  const { goals } = useGoalsContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input by 150ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter goals based on debounced search term
  const filteredGoals = useMemo(() => {
    if (!debouncedSearchTerm) return goals;
    return goals.filter(goal =>
      goal.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      goal.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [goals, debouncedSearchTerm]);

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
    <div className={cn("space-y-3", className)}>
      {/* Compact Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
        <Input
          type="text"
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Goal Chips Grid */}
      <div className="space-y-2">
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
          {filteredGoals.length === 0 ? (
            <div className="text-center py-3 text-sm text-gray-500 dark:text-gray-400">
              {goals.length === 0 ? 'No goals created yet' : 'No goals match your search'}
            </div>
          ) : (
            filteredGoals.map((goal) => {
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
