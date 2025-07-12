
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
      targetDate: targetDate ? new Date(targetDate) : undefined
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
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Goal' : 'Add New Goal'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter goal title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <div className="relative">
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-coral hover:bg-coral/90 text-white flex-1">
              {isEditing ? 'Update' : 'Create'} Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
