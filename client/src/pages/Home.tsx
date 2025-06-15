import { motion } from 'framer-motion';
import { Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useMomentum } from '../hooks/useMomentum';
import MomentumChart from '../components/MomentumChart';
import HabitRow from '../components/HabitRow';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('Last 30 Days');
  
  const timeRanges = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'All Time', days: null }
  ];

  const currentTimeFilter = timeRanges.find(range => range.label === selectedTimeFilter);
  
  const { habits, logs, logHabit } = useHabits();
  const momentum = useMomentum(habits, logs, currentTimeFilter);
  
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(log => log.date === today && log.completed);
  const todayRate = momentum.todayRate * 100;
  
  const hasCheckedToday = todayLogs.length > 0;

  return (
    <div className="space-y-8">
      {/* Progress Banner */}
      {hasCheckedToday && (
        <motion.div 
          className="bg-gradient-to-r from-emerald-400/90 to-teal-500/90 rounded-2xl p-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Great momentum today! 🚀</h2>
              <p className="text-emerald-50">
                You've completed {todayLogs.length} out of {habits.length} good habits. 
                Keep building that compound growth!
              </p>
            </div>
            <div className="text-right">
              <motion.div 
                className="text-3xl font-bold"
                key={todayRate}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                +{todayRate.toFixed(1)}%
              </motion.div>
              <div className="text-sm text-emerald-100">Today's impact</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Momentum Chart */}
      <MomentumChart
        data={momentum.momentumData}
        currentMomentum={momentum.currentMomentum}
        totalGrowth={momentum.totalGrowth}
        todayRate={momentum.todayRate}
        projectedTarget={momentum.projectedTarget}
        habits={habits}
        logs={logs}
        selectedRange={selectedTimeFilter}
        onRangeChange={setSelectedTimeFilter}
        timeRanges={timeRanges}
      />

      {/* Today's Habits */}
      <motion.div 
        className="card-glass p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Today's Habits
          </h2>
          <Button
            variant="ghost"
            className="text-coral hover:text-coral/80 font-medium text-sm"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {habits.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No habits yet. Ready to build something amazing?
            </div>
            <Button className="btn-coral">
              <Plus className="w-4 h-4 mr-2" />
              Add your first habit pair
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <HabitRow
                  habit={habit}
                  logs={logs}
                  onLogHabit={logHabit}
                  isToday={true}
                />
              </motion.div>
            ))}
          </div>
        )}

        {habits.length > 0 && (
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button className="w-full btn-coral">
              <Plus className="w-5 h-5 mr-2" />
              Add Quick Check-In
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
