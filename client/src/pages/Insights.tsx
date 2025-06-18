import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useMomentum } from '../hooks/useMomentum';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ViewMode } from '../types';

export default function Insights() {
  const { habits, logs, settings } = useHabits();
  const momentum = useMomentum(habits, logs);
  const [activeView, setActiveView] = useState<ViewMode>('day');
  const [whatIfRate, setWhatIfRate] = useState([0.8]);

  const calculateWhatIf = (rate: number) => {
    return Math.pow(1 + (rate / 100), 30);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
        label: date.toLocaleDateString('en', { weekday: 'short' })
      });
    }
    return days;
  };

  const getCalendarDays = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
      const dayLogs = logs.filter(log => log.date === dateStr && log.completed);
      const intensity = dayLogs.length / habits.length;

      days.push({
        day,
        date: dateStr,
        intensity,
        isToday: day === today.getDate()
      });
    }

    return days;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-800';
    if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
    if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const ViewToggle = () => (
    <div className="flex space-x-4 mb-8">
      {(['day', 'week', 'month'] as ViewMode[]).map((view) => (
        <Button
          key={view}
          variant={activeView === view ? 'default' : 'outline'}
          onClick={() => setActiveView(view)}
          className={activeView === view ? 'bg-coral hover:bg-coral/90' : ''}
        >
          {view.charAt(0).toUpperCase() + view.slice(1)}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div 
        className="card-glass p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Analytics & Insights
          </h2>
          <Button 
            variant="ghost"
            className="text-coral hover:text-coral/80 font-medium text-sm"
          >
            🤓 {settings.nerdMode ? 'Exit' : 'Nerd'} Mode
          </Button>
        </div>

        <ViewToggle />

        {/* Day View */}
        {activeView === 'day' && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* What-if Analysis */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                What-If Analysis
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  If you maintain a daily rate of:
                </label>
                <Slider
                  value={whatIfRate}
                  onValueChange={setWhatIfRate}
                  max={2}
                  step={0.1}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>0%</span>
                  <span className="font-medium text-coral">+{whatIfRate[0].toFixed(1)}%</span>
                  <span>2%</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-700 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coral">
                      {calculateWhatIf(whatIfRate[0]).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Momentum Index in 30 days
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xl font-bold text-emerald-600">
                    {momentum.successRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xl font-bold text-coral">12</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xl font-bold text-purple-600">
                    +{(momentum.averageDailyRate * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Rate</div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xl font-bold text-blue-600">{habits.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Habits</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Week View */}
        {activeView === 'week' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              7-Day Habit Grid
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Habit
                    </th>
                    {getLast7Days().map((day) => (
                      <th key={day.date} className="text-center p-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {habits.map((habit, habitIndex) => (
                    <motion.tr 
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: habitIndex * 0.1 }}
                    >
                      <td className="p-3 font-medium text-gray-800 dark:text-white">
                        {habit.goodHabit}
                      </td>
                      {getLast7Days().map((day, dayIndex) => {
                        const log = logs.find(l => l.habitId === habit.id && l.date === day.date);
                        return (
                          <td key={day.date} className="p-3 text-center">
                            <motion.div 
                              className={`w-6 h-6 rounded mx-auto ${
                                log?.completed 
                                  ? 'bg-emerald-500' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: habitIndex * 0.1 + dayIndex * 0.02 }}
                            />
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Month View */}
        {activeView === 'month' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })} - Heat Map
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
                  {day}
                </div>
              ))}

              {getCalendarDays().map((day, index) => (
                <motion.div
                  key={index}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                    day ? getIntensityColor(day.intensity) : ''
                  } ${day?.isToday ? 'ring-2 ring-coral ring-offset-2' : ''}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                >
                  {day?.day}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Less activity
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-800 rounded"></div>
                <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-700 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded"></div>
                <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-500 rounded"></div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                More activity
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}