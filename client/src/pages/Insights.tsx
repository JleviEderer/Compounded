import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useMomentum } from '../hooks/useMomentum';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import HeatMapGrid from '../components/HeatMapGrid';
import DayDetailModal from '../components/DayDetailModal';

type InsightsViewMode = 'week' | 'month' | 'quarter' | 'all-time';

export default function Insights() {
  const { habits, logs, settings } = useHabits();
  const [activeView, setActiveView] = useState<InsightsViewMode>('week');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [dayModal, setDayModal] = useState<string | null>(null);

  // Define time filters that match what useMomentum expects
  const getTimeFilterForView = (view: InsightsViewMode) => {
    switch (view) {
      case 'week':
        return { label: '7 D', days: 7 };
      case 'month':
        return { label: '30 D', days: 30 };
      case 'quarter':
        return { label: '3 M', days: 90 };
      case 'all-time':
        return { label: 'All Time', days: null };
      default:
        return { label: '7 D', days: 7 };
    }
  };

  const currentTimeFilter = getTimeFilterForView(activeView);
  const momentum = useMomentum(habits, logs, currentTimeFilter);

  // Filter logs based on current time filter
  const getFilteredLogs = () => {
    if (!currentTimeFilter.days) {
      return logs; // All time
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentTimeFilter.days);
    const cutoffStr = cutoffDate.toLocaleDateString('en-CA');

    return logs.filter(log => log.date >= cutoffStr);
  };

  const filteredLogs = getFilteredLogs();

  // Click handlers for zoom functionality
  const openMonth = (isoMonth: string) => {
    const [year, month] = isoMonth.split('-');
    const newAnchor = new Date(parseInt(year), parseInt(month) - 1, 1);
    setAnchor(newAnchor);
    setActiveView('month');
  };

  const openDay = (isoDate: string) => {
    setDayModal(isoDate);
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
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: '',
        dateISO: '',
        intensity: 0,
        day: undefined
      });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(anchor.getFullYear(), anchor.getMonth(), day);
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
      const dayLogs = filteredLogs.filter(log => log.date === dateStr && log.state === 'good');
      const intensity = dayLogs.length / habits.length;

      days.push({
        date: dateStr,
        dateISO: dateStr,
        intensity,
        day,
        isToday: dateStr === today.toLocaleDateString('en-CA')
      });
    }

    return days;
  };

  const getQuarterWeeks = () => {
    const today = new Date();
    const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
    const cells = [];

    for (let week = 0; week < 13; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(quarterStart);
        date.setDate(quarterStart.getDate() + (week * 7) + day);
        const dateStr = date.toLocaleDateString('en-CA');
        const dayLogs = filteredLogs.filter(log => log.date === dateStr && log.state === 'good');
        const intensity = dayLogs.length / habits.length;

        cells.push({
          date: dateStr,
          dateISO: dateStr,
          intensity,
          isToday: date.toDateString() === today.toDateString()
        });
      }
    }

    return cells;
  };

  const getAllTimeYears = () => {
    const currentYear = new Date().getFullYear();
    const cells = [];

    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const daysInMonth = monthEnd.getDate();

        // Calculate total good logs for this month
        let monthTotal = 0;
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = date.toLocaleDateString('en-CA');
          const dayLogs = filteredLogs.filter(log => log.date === dateStr && log.state === 'good');
          monthTotal += dayLogs.length;
        }

        const maxPossible = habits.length * daysInMonth;
        const intensity = maxPossible > 0 ? monthTotal / maxPossible : 0;
        const monthISO = `${year}-${String(month + 1).padStart(2, '0')}`;

        cells.push({
          date: monthStart.toLocaleDateString('en-CA'),
          dateISO: monthISO,
          intensity,
          year,
          month: String(month + 1).padStart(2, '0')
        });
      }
    }

    return cells;
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

  // Calculate current streak
  const getCurrentStreak = () => {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toLocaleDateString('en-CA');

      const dayLogs = logs.filter(log => log.date === dateStr && log.state === 'good');
      if (dayLogs.length > 0) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  };

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
              <TooltipContent className="max-w-32 text-[8px] p-1 leading-tight">
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
            Avg Daily Rate
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-20 text-[8px] p-1 leading-tight">
                <p>Avg daily rate</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-coral">{getCurrentStreak()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            Current Streak
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-20 text-[8px] p-1 leading-tight">
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
              <TooltipContent className="max-w-20 text-[8px] p-1 leading-tight">
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
                        const log = filteredLogs.find(l => l.habitId === habit.id && l.date === day.date);
                        
                        const getSquareStyle = () => {
                          if (log?.state === 'good') {
                            return 'bg-teal-500'; // #10b981 - good habit completed
                          } else if (log?.state === 'bad') {
                            return 'bg-red-400'; // #f87171 (coral) - bad habit completed
                          } else {
                            return 'bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500'; // #e5e7eb - not logged
                          }
                        };

                        return (
                          <td key={day.date} className="p-3 text-center">
                            <motion.div 
                              className={`w-6 h-6 rounded mx-auto ${getSquareStyle()}`}
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
                {anchor.toLocaleDateString('en', { month: 'long', year: 'numeric' })} - Heat Map
              </h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <HeatMapGrid
              cells={getCalendarDays()}
              gridType="month"
              onCellClick={openDay}
              getIntensityColor={getIntensityColor}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Less activity
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-700 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded"></div>
                <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-500 rounded"></div>
                <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-400 rounded"></div>
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

            <HeatMapGrid
              cells={getQuarterWeeks()}
              gridType="quarter"
              onCellClick={openDay}
              getIntensityColor={getIntensityColor}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Less activity
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-700 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded"></div>
                <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-500 rounded"></div>
                <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-400 rounded"></div>
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

            <HeatMapGrid
              cells={getAllTimeYears()}
              gridType="all-time"
              onCellClick={openMonth}
              getIntensityColor={getMonochromeIntensityColor}
            />

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

      {/* Day Detail Modal */}
      {dayModal && (
        <DayDetailModal 
          date={dayModal} 
          onClose={() => setDayModal(null)} 
        />
      )}
    </div>
  );
}