// GoalDialog: add/edit only – delete lives in GoalCard
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Calendar } from 'lucide-react';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { Goal } from '@/types';
import { format } from 'date-fns';

interface GoalDialogProps {
  goal?: Goal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function GoalDialog({ goal, open, onOpenChange, trigger }: GoalDialogProps) {
  const { addGoal, updateGoal } = useGoalsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const isEditing = !!goal;
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setTargetDate(goal.targetDate ? format(goal.targetDate, 'yyyy-MM-dd') : '');
    } else {
      setTitle('');
      setDescription('');
      setTargetDate('');
    }
    setErrors({});
  }, [goal, dialogOpen]);

  const validateForm = () => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const goalData = {
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate ? (() => {
        // Split the date string and create date in local timezone
        const [year, month, day] = targetDate.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return date;
      })() : undefined
    };

    if (isEditing && goal) {
      updateGoal(goal.id, goalData);
    } else {
      addGoal(goalData.title, goalData.description, goalData.targetDate);
    }

    setDialogOpen(false);
  };

  const defaultTrigger = (
    <Button className="bg-coral hover:bg-coral/90 text-white">
      <Plus className="w-4 h-4 mr-2" />
      New Goal
    </Button>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {isEditing ? 'Edit Goal' : 'Add New Goal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter goal title"
              className={`mt-1.5 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[44px] text-base focus:ring-2 focus:ring-coral/20 focus:border-coral dark:focus:border-coral transition-colors ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Description
            </Label>
            <div className="mt-1.5 relative">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you want to achieve?"
                rows={3}
                maxLength={250}
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base focus:ring-2 focus:ring-coral/20 focus:border-coral dark:focus:border-coral transition-colors resize-none"
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400 dark:text-gray-500">
                {description.length}/250
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Target Date
            </Label>
            <div className="mt-1.5 relative">
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white min-h-[44px] text-base focus:ring-2 focus:ring-coral/20 focus:border-coral dark:focus:border-coral transition-colors [color-scheme:dark]"
                style={{
                  colorScheme: 'dark'
                }}
              />
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1 min-h-[44px] text-base font-medium bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-coral hover:bg-coral/90 text-white flex-1 min-h-[44px] text-base font-medium transition-colors"
            >
              {isEditing ? 'Update' : 'Create'} Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}