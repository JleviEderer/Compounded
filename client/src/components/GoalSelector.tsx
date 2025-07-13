
import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { GoalOption } from '@/components/GoalOption';
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
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* None Pill */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedGoalIds.length === 0 ? "default" : "outline"}
          size="sm"
          onClick={handleNoneClick}
          className={cn(
            "text-sm",
            selectedGoalIds.length === 0 && "bg-gray-600 text-white hover:bg-gray-700"
          )}
        >
          None
        </Button>
      </div>

      {/* Goal Options */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {goals.length === 0 ? 'No goals created yet' : 'No goals match your search'}
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <GoalOption
              key={goal.id}
              goal={goal}
              isSelected={selectedGoalIds.includes(goal.id)}
              onToggle={handleGoalToggle}
            />
          ))
        )}
      </div>

      {/* Selection Summary */}
      {selectedGoalIds.length > 0 && (
        <div role="status" aria-live="polite" className="text-sm text-gray-600">
          {selectedGoalIds.length} goal{selectedGoalIds.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
