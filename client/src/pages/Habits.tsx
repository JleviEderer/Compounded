import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, X, Check } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { HabitWeight, WEIGHT_LABELS } from '../types';
import WeightSlider from '../components/WeightSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Habits() {
  const { habits, addHabit, updateHabit, deleteHabit, lastSavedHabitId } = useHabits();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [goodHabit, setGoodHabit] = useState('');
  const [badHabit, setBadHabit] = useState('');
  const [weight, setWeight] = useState<HabitWeight>(HabitWeight.MEDIUM);

  const resetForm = () => {
    setGoodHabit('');
    setBadHabit('');
    setWeight(HabitWeight.MEDIUM);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (goodHabit.trim() && badHabit.trim()) {
      addHabit(goodHabit.trim(), badHabit.trim(), weight);
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleEdit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setGoodHabit(habit.goodHabit);
      setBadHabit(habit.badHabit);
      setWeight(habit.weight);
      setEditingId(habitId);
      setIsAddModalOpen(true);
    }
  };

  const handleUpdate = () => {
    if (editingId && goodHabit.trim() && badHabit.trim()) {
      updateHabit(editingId, {
        goodHabit: goodHabit.trim(),
        badHabit: badHabit.trim(),
        weight
      });
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = (habitId: string) => {
    deleteHabit(habitId);
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
              <Button className="btn-coral">
                <Plus className="w-5 h-5 mr-2" />
                Add Pair
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">
                  {editingId ? 'Edit Habit Pair' : 'Add New Habit Pair'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="good-habit" className="text-gray-700 dark:text-gray-300 font-medium">
                    Good Habit (What you want to do)
                  </Label>
                  <Input
                    id="good-habit"
                    value={goodHabit}
                    onChange={(e) => setGoodHabit(e.target.value)}
                    placeholder="e.g., Read for 15 minutes"
                    className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="bad-habit" className="text-gray-700 dark:text-gray-300 font-medium">
                    Bad Habit (What you want to replace)
                  </Label>
                  <Input
                    id="bad-habit"
                    value={badHabit}
                    onChange={(e) => setBadHabit(e.target.value)}
                    placeholder="e.g., Mindless phone scrolling"
                    className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                <WeightSlider
                  value={weight}
                  onChange={setWeight}
                />

                <div className="flex space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingId ? handleUpdate : handleAdd}
                    className="flex-1 btn-coral"
                    disabled={!goodHabit.trim() || !badHabit.trim()}
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
              className="btn-coral"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add your first habit pair
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="cursor-move p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <GripVertical className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white relative">
                          {habit.goodHabit} → Replace {habit.badHabit}
                          <Check 
                            className={`absolute -right-6 w-5 h-5 text-emerald-500 transition-opacity duration-1000 ${
                              lastSavedHabitId === habit.id ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {WEIGHT_LABELS[habit.weight] || 'Unknown weight'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => handleEdit(habit.id)}
                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </motion.button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <motion.button
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </motion.button>
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
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <WeightSlider
                      value={habit.weight}
                      onChange={(newWeight) => updateHabit(habit.id, { weight: newWeight })}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
