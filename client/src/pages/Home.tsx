import { motion } from 'framer-motion';
import { Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useHabits } from '../hooks/useHabits';
import { useMomentum } from '../hooks/useMomentum';
import MomentumChart from '../components/MomentumChart';
import HabitRow from '../components/HabitRow';
import { Button } from '@/components/ui/button';
import { FullBleed } from '../components/FullBleed';

export default function Home() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('30 D');
  const [, setLocation] = useLocation();

  const timeRanges = [
    { label: '30 D', days: 30 },
    { label: '3 M', days: 90 },
    { label: '1 Y', days: 365 },
    { label: 'All Time', days: null }
  ];

  const currentTimeFilter = timeRanges.find(range => range.label === selectedTimeFilter);

  const { habits, logs, logHabit, lastSavedHabitId } = useHabits();
  const momentum = useMomentum(habits, logs, currentTimeFilter);

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
  const todayLogs = logs.filter(log => log.date === today && log.completed);
  const todayRate = momentum.todayRate * 100;

  const hasCheckedToday = todayLogs.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">




      {/* Momentum Chart */}
      {/* phones */}  
      <div className="pt-8 sm:pt-0">
        <div className="sm:hidden">
          <FullBleed>
            <MomentumChart
            data={momentum.momentumData}
            currentMomentum={momentum.currentMomentum}
            totalGrowth={momentum.totalGrowth}
            todayRate={momentum.todayRate}
            projectedTarget={momentum.projectedTarget}
            recentAvgRate={momentum.recentAvgRate}
            avgWindowDays={momentum.avgWindowDays}
            projWindowDays={momentum.projWindowDays}
            habits={habits}
            logs={logs}
            selectedRange={selectedTimeFilter}
            onRangeChange={setSelectedTimeFilter}
            timeRanges={timeRanges}
          />
          </FullBleed>
        </div>
      </div>

      {/* ≥ sm keeps old layout */}  
      <div className="hidden sm:block">
        <MomentumChart
          data={momentum.momentumData}
          currentMomentum={momentum.currentMomentum}
          totalGrowth={momentum.totalGrowth}
          todayRate={momentum.todayRate}
          projectedTarget={momentum.projectedTarget}
          recentAvgRate={momentum.recentAvgRate}
          avgWindowDays={momentum.avgWindowDays}
          projWindowDays={momentum.projWindowDays}
          habits={habits}
          logs={logs}
          selectedRange={selectedTimeFilter}
          onRangeChange={setSelectedTimeFilter}
          timeRanges={timeRanges}
        />
      </div>

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
            onClick={() => setLocation('/habits')}
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
                  showSavedFlash={lastSavedHabitId === habit.id}
                />
              </motion.div>
            ))}
          </div>
        )}


      </motion.div>
    </div>
  );
}