import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, X, Check, ChevronRight } from 'lucide-react';
import { useHabitsContext as useHabits } from '../contexts/HabitsContext';
import { HabitWeight, WEIGHT_LABELS } from '../types';
import WeightSlider from '../components/WeightSlider';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GoalDots } from '../components/GoalDots'; // Import GoalDots component
import { GoalSelector } from '../components/GoalSelector'; // Import GoalSelector component

export default function Habits() {
  const { habits, addHabit, updateHabit, deleteHabit, lastSavedHabitId, reorderHabits } = useHabits();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set());

  // Form state
  const [goodHabit, setGoodHabit] = useState('');
  const [weightIndex, setWeightIndex] = useState<number>(2); // Default to MEDIUM (index 2)
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  const resetForm = () => {
    setGoodHabit('');
    setWeightIndex(2); // MEDIUM
    setSelectedGoalIds([]);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (goodHabit.trim()) {
      const weight = [HabitWeight.MICRO, HabitWeight.SMALL, HabitWeight.MEDIUM, HabitWeight.LARGE, HabitWeight.KEYSTONE][weightIndex];
      addHabit(goodHabit.trim(), weight, selectedGoalIds);
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleEdit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setGoodHabit(habit.goodHabit);
      const weightValues = [HabitWeight.MICRO, HabitWeight.SMALL, HabitWeight.MEDIUM, HabitWeight.LARGE, HabitWeight.KEYSTONE];
      setWeightIndex(weightValues.indexOf(habit.weight));
      setSelectedGoalIds(habit.goalIds || []);
      setEditingId(habitId);
      setIsAddModalOpen(true);
    }
  };

  const handleUpdate = () => {
    if (editingId && goodHabit.trim()) {
      const weight = [HabitWeight.MICRO, HabitWeight.SMALL, HabitWeight.MEDIUM, HabitWeight.LARGE, HabitWeight.KEYSTONE][weightIndex];
      updateHabit(editingId, {
        goodHabit: goodHabit.trim(),
        weight,
        goalIds: selectedGoalIds
      });
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = (habitId: string) => {
    deleteHabit(habitId);
  };

  const toggleExpanded = (habitId: string) => {
    setExpandedHabits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
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
            Manage Habits
          </h2>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="btn-coral min-h-[44px] min-w-[44px] px-4 py-3 text-base font-medium touch-manipulation">
                <Plus className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Add Pair</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white text-lg">
                  {editingId ? 'Edit Habit Pair' : 'Add New Habit Pair'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pb-2">
                <div>
                  <Label htmlFor="good-habit" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    Habit Description
                  </Label>
                  <Input
                    id="good-habit"
                    value={goodHabit}
                    onChange={(e) => setGoodHabit(e.target.value)}
                    placeholder="e.g., Read for 15 minutes"
                    className="mt-1.5 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[44px] text-base"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-2 block">
                    Impact Weight
                  </Label>
                  <WeightSlider
                    value={weightIndex}
                    onChange={setWeightIndex}
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    Goals (Optional)
                  </Label>
                  <div className="mt-1.5">
                    <GoalSelector 
                      selectedGoalIds={selectedGoalIds}
                      onChange={setSelectedGoalIds}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 min-h-[48px] text-base font-medium touch-manipulation text-gray-900 dark:text-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingId ? handleUpdate : handleAdd}
                    className="flex-1 btn-coral min-h-[48px] text-base font-medium touch-manipulation"
                    disabled={!goodHabit.trim()}
                  >
                    {editingId ? 'Update' : 'Add'} Habit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {habits.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No habits yet. Ready to build something amazing?
            </div>
            <Button 
              className="btn-coral min-h-[48px] px-6 py-3 text-base font-medium touch-manipulation"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-3 flex-shrink-0" />
              Add your first habit pair
            </Button>
          </motion.div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={habits} 
            onReorder={reorderHabits}
            className="space-y-3"
          >
            <AnimatePresence>
              {habits.map((habit, index) => {
                const isExpanded = expandedHabits.has(habit.id);
                return (
                  <Reorder.Item
                    key={habit.id}
                    value={habit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Collapsed View - Always Visible */}
                    <div className="w-full px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                        </div>

                        <button
                          onClick={() => toggleExpanded(habit.id)}
                          className="flex items-center gap-2 text-left hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          aria-expanded={isExpanded}
                          aria-controls={`habit-card-${habit.id}`}
                        >
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-medium text-gray-900 dark:text-white text-base leading-snug"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {habit.goodHabit}
                          </div>
                          <GoalDots goalIds={habit.goalIds || []} className="mt-1" />
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-3 text-right">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {WEIGHT_LABELS[habit.weight]?.split(' ')[0] || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{(habit.weight * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Expanded View - Conditionally Visible */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          id={`habit-card-${habit.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="space-y-4 pt-4">
                              {/* Habit Weight Control */}
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                  Impact Weight
                                </div>
                                <WeightSlider
                                  value={[HabitWeight.MICRO, HabitWeight.SMALL, HabitWeight.MEDIUM, HabitWeight.LARGE, HabitWeight.KEYSTONE].indexOf(habit.weight)}
                                  onChange={(newIndex) => {
                                    const newWeight = [HabitWeight.MICRO, HabitWeight.SMALL, HabitWeight.MEDIUM, HabitWeight.LARGE, HabitWeight.KEYSTONE][newIndex];
                                    updateHabit(habit.id, { weight: newWeight });
                                  }}
                                />
                              </div>



                              {/* Action Buttons */}
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(habit.id)}
                                  className="flex-1 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit2 className="w-3 h-3 mr-2" />
                                  Edit
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 dark:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3 mr-2" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{habit.goodHabit}"? 
                                        This will also remove all associated logs. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(habit.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </motion.div>
    </div>
  );
}