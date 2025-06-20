
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useMomentum } from '../hooks/useMomentum';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type InsightsViewMode = 'week' | 'month' | 'quarter' | 'all-time';

export default function Insights() {
  const { habits, logs, settings } = useHabits();
  const momentum = useMomentum(habits, logs);
  const [activeView, setActiveView] = useState<InsightsViewMode>('week');

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

  const getQuarterWeeks = () => {
    const today = new Date();
    const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
    const weeks = [];

    for (let week = 0; week < 13; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(quarterStart);
        date.setDate(quarterStart.getDate() + (week * 7) + day);
        const dateStr = date.toLocaleDateString('en-CA');
        const dayLogs = logs.filter(log => log.date === dateStr && log.completed);
        const intensity = dayLogs.length / habits.length;

        weekDays.push({
          date: dateStr,
          intensity,
          isToday: date.toDateString() === today.toDateString()
        });
      }
      weeks.push(weekDays);
    }

    return weeks;
  };

  const getAllTimeYears = () => {
    const years = {};
    const currentYear = new Date().getFullYear();

    // Initialize years with empty months
    for (let year = currentYear - 2; year <= currentYear; year++) {
      years[year] = Array(12).fill(0);
    }

    // Calculate intensity for each month
    logs.forEach(log => {
      if (log.completed) {
        const date = new Date(log.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        if (years[year]) {
          years[year][month] += 1;
        }
      }
    });

    // Normalize intensities by dividing by total possible completions per month
    Object.keys(years).forEach(year => {
      years[year] = years[year].map(monthTotal => {
        const daysInMonth = new Date(parseInt(year), 0, 32).getDate(); // Approximate
        const maxPossible = habits.length * daysInMonth;
        return maxPossible > 0 ? monthTotal / maxPossible : 0;
      });
    });

    return years;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-800';
    if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
    if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const getMonochromeIntensityColor = (intensity: number) => {
    const opacity = Math.min(intensity * 100, 100);
    return `bg-gray-800 dark:bg-gray-300` + (opacity > 0 ? ` opacity-${Math.floor(opacity / 10) * 10}` : ' opacity-10');
  };

  // Time Filter Pills
  const TimeFilterPills = () => (
    <div className="flex gap-2 mb-6">
      {(['week', 'month', 'quarter', 'all-time'] as InsightsViewMode[]).map((view) => (
        <motion.button
          key={view}
          onClick={() => setActiveView(view)}
          className={`relative flex px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeView === view
              ? 'text-white dark:text-white'
              : 'text-teal-700 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeView === view && (
            <motion.div
              layoutId="insightsRange"
              className="absolute inset-0 bg-teal-600 dark:bg-teal-400 rounded-full"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30
              }}
            />
          )}
          <span className="relative z-10 capitalize">{view.replace('-', ' ')}</span>
        </motion.button>
      ))}
    </div>
  );

  // Quick Stats Strip
  const QuickStatsStrip = () => (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4">
        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-emerald-600">
            {momentum.successRate.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            Success Rate
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-32 text-xs">
                <p>% habits completed</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-purple-600">
            +{(momentum.recentAvgRate * 100).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            {activeView === 'all-time' ? 'Lifetime Avg' : 'Recent Avg'}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-32 text-xs">
                <p>
                  {activeView === 'all-time' 
                    ? 'Avg momentum rate' 
                    : 'Recent momentum avg'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-coral">12</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            Current Streak
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-32 text-xs">
                <p>Consecutive days w/ ≥1 habit</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-blue-600">{habits.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            Active Habits
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-32 text-xs">
                <p>Total habits tracked</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>
      </div>
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

        <TimeFilterPills />
        <QuickStatsStrip />

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

        {/* Quarter View */}
        {activeView === 'quarter' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Quarterly Heatmap (13 Weeks)
            </h3>
            
            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div></div>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center font-medium">{day}</div>
                ))}
              </div>
              
              {getQuarterWeeks().map((week, weekIndex) => (
                <motion.div 
                  key={weekIndex} 
                  className="grid grid-cols-8 gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: weekIndex * 0.05 }}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    W{weekIndex + 1}
                  </div>
                  {week.map((day, dayIndex) => (
                    <motion.div
                      key={dayIndex}
                      className={`aspect-square rounded ${getIntensityColor(day.intensity)} ${
                        day.isToday ? 'ring-2 ring-coral ring-offset-1' : ''
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: weekIndex * 0.05 + dayIndex * 0.01 }}
                    />
                  ))}
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

        {/* All Time View */}
        {activeView === 'all-time' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              All Time Overview (By Year & Month)
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-13 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div></div>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                  <div key={month} className="text-center font-medium">{month}</div>
                ))}
              </div>
              
              {Object.entries(getAllTimeYears()).map(([year, months], yearIndex) => (
                <motion.div 
                  key={year} 
                  className="grid grid-cols-13 gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: yearIndex * 0.1 }}
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center">
                    {year}
                  </div>
                  {months.map((intensity, monthIndex) => (
                    <motion.div
                      key={monthIndex}
                      className={`aspect-square rounded ${getMonochromeIntensityColor(intensity)}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: yearIndex * 0.1 + monthIndex * 0.02 }}
                      title={`${year}-${monthIndex + 1}: ${(intensity * 100).toFixed(1)}% completion`}
                    />
                  ))}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Less activity
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-800 opacity-10 dark:bg-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-gray-800 opacity-30 dark:bg-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-gray-800 opacity-50 dark:bg-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-gray-800 opacity-70 dark:bg-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-gray-800 opacity-90 dark:bg-gray-300 rounded"></div>
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
