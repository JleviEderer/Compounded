import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useMomentum } from '../hooks/useMomentum';
import { useLongPress } from '../hooks/useLongPress';
import { calculateDailyRate } from '../utils/compound';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import HeatMapGrid from '../components/HeatMapGrid';
import DayDetailModal from '../components/DayDetailModal';

type InsightsViewMode = 'week' | 'month' | 'quarter' | 'all-time';

// Component to handle long press functionality without conditional hooks
interface HabitRowWithLongPressProps {
  habit: any;
  habitIndex: number;
  filteredLogs: any[];
  getLast7Days: () => any[];
  popoverHabit: { id: string; name: string } | null;
  setPopoverHabit: (habit: { id: string; name: string } | null) => void;
}

const HabitRowWithLongPress: React.FC<HabitRowWithLongPressProps> = ({
  habit,
  habitIndex,
  filteredLogs,
  getLast7Days,
  popoverHabit,
  setPopoverHabit
}) => {
  const longPressHandlers = useLongPress({
    onLongPress: () => setPopoverHabit({ id: habit.id, name: habit.goodHabit }),
    delay: 300
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <React.Fragment>
      <Popover 
        open={popoverHabit?.id === habit.id} 
        onOpenChange={(open) => {
          if (!open) setPopoverHabit(null);
        }}
      >
        <PopoverTrigger asChild>
          <motion.div 
            className="p-3 font-medium text-gray-800 dark:text-white w-[112px] line-clamp-2 break-words leading-tight text-left cursor-default sm:cursor-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: habitIndex * 0.1 }}
            {...(isMobile ? longPressHandlers : {})}
          >
            {habit.goodHabit}
          </motion.div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-3 text-sm sm:hidden" 
          side="right"
          align="start"
        >
          <div className="font-medium text-gray-800 dark:text-white">
            {habit.goodHabit}
          </div>
        </PopoverContent>
      </Popover>
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
          <div key={day.date} className="p-3 flex items-center justify-center">
            <motion.div 
              className={`w-6 h-6 rounded ${getSquareStyle()}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: habitIndex * 0.1 + dayIndex * 0.02 }}
            />
          </div>
        );
      })}
    </React.Fragment>
  );
};

export default function Insights() {
  const { habits, logs, settings } = useHabits();
  const [activeView, setActiveView] = useState<InsightsViewMode>('week');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [weekAnchor, setWeekAnchor] = useState<Date>(new Date());
  const [quarterAnchor, setQuarterAnchor] = useState<Date>(new Date());
  const [dayModal, setDayModal] = useState<string | null>(null);
  const [popoverHabit, setPopoverHabit] = useState<{ id: string; name: string } | null>(null);
  const popoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss popover after 2 seconds
  React.useEffect(() => {
    if (popoverHabit) {
      popoverTimeoutRef.current = setTimeout(() => {
        setPopoverHabit(null);
      }, 2000);
    }
    return () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, [popoverHabit]);

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

  // Debug success rate calculations
  React.useEffect(() => {
    if (habits.length > 0 && logs.length > 0) {
      // Import debug function dynamically
      import('../utils/debug-success-rate').then(({ debugSuccessRateCalculation }) => {
        // Each debug call will handle its own filtering based on the label
        debugSuccessRateCalculation(habits, logs, 7, 'WEEK');
        debugSuccessRateCalculation(habits, logs, 30, 'MONTH');
        debugSuccessRateCalculation(habits, logs, 90, 'QUARTER');
        debugSuccessRateCalculation(habits, logs, 365, 'ALL TIME');
      });
    }
  }, [habits, logs]);

  // Filter logs based on current time filter and anchor dates
  const getFilteredLogs = () => {
    if (!currentTimeFilter.days) {
      return logs; // All time
    }

    // For week view, filter based on weekAnchor
    if (activeView === 'week') {
      const startOfWeek = new Date(weekAnchor);
      startOfWeek.setDate(weekAnchor.getDate() - weekAnchor.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startStr = startOfWeek.toLocaleDateString('en-CA');
      const endStr = endOfWeek.toLocaleDateString('en-CA');

      return logs.filter(log => log.date >= startStr && log.date <= endStr);
    }

    // For month view, filter based on anchor (specific month)
    if (activeView === 'month') {
      const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0); // Last day of month

      const startStr = monthStart.toLocaleDateString('en-CA');
      const endStr = monthEnd.toLocaleDateString('en-CA');

      return logs.filter(log => log.date >= startStr && log.date <= endStr);
    }

    // For quarter view, filter based on quarterAnchor
    if (activeView === 'quarter') {
      const quarterStart = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3, 1);
      const quarterEnd = new Date(quarterStart);
      quarterEnd.setMonth(quarterStart.getMonth() + 3);
      quarterEnd.setDate(quarterEnd.getDate() - 1); // Last day of quarter

      const startStr = quarterStart.toLocaleDateString('en-CA');
      const endStr = quarterEnd.toLocaleDateString('en-CA');

      return logs.filter(log => log.date >= startStr && log.date <= endStr);
    }

    // For other views, use the original logic
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentTimeFilter.days);
    const cutoffStr = cutoffDate.toLocaleDateString('en-CA');

    return logs.filter(log => log.date >= cutoffStr);
  };

  const filteredLogs = getFilteredLogs();
  const { 
    momentumData, 
    currentMomentum, 
    totalGrowth, 
    todayRate, 
    successRate, 
    projectedTarget,
    recentAvgRate,
    avgWindowDays,
    projWindowDays
  } = useMomentum(habits, logs, currentTimeFilter, filteredLogs);

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

  // Helper functions for navigation
  const isCurrentWeek = () => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());

    const weekAnchorStart = new Date(weekAnchor);
    weekAnchorStart.setDate(weekAnchor.getDate() - weekAnchor.getDay());

    return currentWeekStart.toDateString() === weekAnchorStart.toDateString();
  };

  const isCurrentQuarter = () => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const anchorQuarter = Math.floor(quarterAnchor.getMonth() / 3);

    return now.getFullYear() === quarterAnchor.getFullYear() && currentQuarter === anchorQuarter;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newAnchor = new Date(weekAnchor);
    newAnchor.setDate(weekAnchor.getDate() + (direction === 'next' ? 7 : -7));
    setWeekAnchor(newAnchor);
  };

  const navigateQuarter = (direction: 'prev' | 'next') => {
    const newAnchor = new Date(quarterAnchor);
    const monthsToAdd = direction === 'next' ? 3 : -3;
    newAnchor.setMonth(quarterAnchor.getMonth() + monthsToAdd);
    setQuarterAnchor(newAnchor);
  };

  const getWeekLabel = () => {
    const startOfWeek = new Date(weekAnchor);
    startOfWeek.setDate(weekAnchor.getDate() - weekAnchor.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${startOfWeek.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getQuarterLabel = () => {
    const quarter = Math.floor(quarterAnchor.getMonth() / 3) + 1;
    return `Q${quarter} ${quarterAnchor.getFullYear()}`;
  };

  const getLast7Days = () => {
    const days = [];
    // Start from the Sunday of the week containing weekAnchor
    const startOfWeek = new Date(weekAnchor);
    startOfWeek.setDate(weekAnchor.getDate() - weekAnchor.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
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
      // Use weighted calculation instead of simple counting
      const dailyRate = calculateDailyRate(habits, logs, dateStr);

      days.push({
        date: dateStr,
        dateISO: dateStr,
        intensity: dailyRate,
        day,
        isToday: dateStr === today.toLocaleDateString('en-CA')
      });
    }

    return days;
  };

  const getQuarterWeeks = () => {
    const today = new Date();
    const quarterStart = new Date(quarterAnchor.getFullYear(), Math.floor(quarterAnchor.getMonth() / 3) * 3, 1);
    const cells = [];

    for (let week = 0; week < 13; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(quarterStart);
        date.setDate(quarterStart.getDate() + (week * 7) + day);
        const dateStr = date.toLocaleDateString('en-CA');
        // Use weighted calculation instead of simple counting
        const dailyRate = calculateDailyRate(habits, filteredLogs, dateStr);

        cells.push({
          date: dateStr,
          dateISO: dateStr,
          intensity: dailyRate,
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

        // Calculate weighted average daily rate for this month
        let totalDailyRate = 0;
        let daysWithData = 0;

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = date.toLocaleDateString('en-CA');
          const dailyRate = calculateDailyRate(habits, filteredLogs, dateStr);

          // Only include days that have some logged data
          const dayLogs = filteredLogs.filter(log => log.date === dateStr);
          if (dayLogs.length > 0) {
            totalDailyRate += dailyRate;
            daysWithData++;
          }
        }

        const avgDailyRate = daysWithData > 0 ? totalDailyRate / daysWithData : 0;
        const monthISO = `${year}-${String(month + 1).padStart(2, '0')}`;

        cells.push({
          date: monthStart.toLocaleDateString('en-CA'),
          dateISO: monthISO,
          intensity: avgDailyRate,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-emerald-600">
            {successRate.toFixed(0)}%
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Success Rate</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Good Habits / Habits Logged</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-purple-600">
            +{(recentAvgRate * 100).toFixed(2)}%
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Avg Daily Rate</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Average daily compound rate of improvement</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-coral">{getCurrentStreak()}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Current Streak</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Consecutive days with at least one habit completed</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg sm:text-xl font-bold text-blue-600">{habits.length}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="truncate">Active Habits</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs p-2">
                <p>Total number of habits currently being tracked</p>
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {getWeekLabel()}
              </h3>
              <div className="flex space-x-2">
                {/* Show "Current Week" button only when viewing a different week */}
                {!isCurrentWeek() && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setWeekAnchor(new Date())}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Current Week
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="w-full overflow-x-hidden">
              <div className="grid grid-cols-[112px_repeat(7,44px)] gap-y-3">
                {/* Header Row */}
                <div className="text-left text-sm font-medium text-gray-600 dark:text-gray-400 p-3">
                  Habit
                </div>
                {getLast7Days().map((day) => (
                  <div key={day.date} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-3">
                    {day.label}
                  </div>
                ))}
                
                {/* Habit Rows */}
                {habits.map((habit, habitIndex) => (
                  <HabitRowWithLongPress
                    key={habit.id}
                    habit={habit}
                    habitIndex={habitIndex}
                    filteredLogs={filteredLogs}
                    getLast7Days={getLast7Days}
                    popoverHabit={popoverHabit}
                    setPopoverHabit={setPopoverHabit}
                  />
                ))}
              </div>
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
                {anchor.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex space-x-2">
                {/* Show "Current Month" button only when viewing a different month */}
                {(anchor.getFullYear() !== new Date().getFullYear() || anchor.getMonth() !== new Date().getMonth()) && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setAnchor(new Date())}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Current Month
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <HeatMapGrid
              cells={getCalendarDays()}
              gridType="month"
              onCellClick={openDay}
              getIntensityColor={() => ''}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                More bad habits
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-rose-500 rounded"></div>
                <div className="w-3 h-3 bg-rose-400 rounded"></div>
                <div className="w-3 h-3 bg-rose-200 rounded"></div>
                <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-emerald-300 rounded"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <div className="w-3 h-3 bg-emerald-600 rounded"></div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                More good habits
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {getQuarterLabel()}
              </h3>
              <div className="flex space-x-2">
                {/* Show "Current Quarter" button only when viewing a different quarter */}
                {!isCurrentQuarter() && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setQuarterAnchor(new Date())}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Current Quarter
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateQuarter('prev')}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateQuarter('next')}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <HeatMapGrid
              cells={getQuarterWeeks()}
              gridType="quarter"
              onCellClick={openDay}
              getIntensityColor={getIntensityColor}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                More bad habits
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-rose-500 rounded"></div>
                <div className="w-3 h-3 bg-rose-400 rounded"></div>
                <div className="w-3 h-3 bg-rose-200 rounded"></div>
                <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-emerald-300 rounded"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <div className="w-3 h-3 bg-emerald-600 rounded"></div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                More good habits
              </div>
            </div>
          </motion.div>
        )}

        {/* All Time View */}
        {activeView === 'all-time' && (
          <motion.div 
            className="space-y-6 overflow-x-hidden px-2 sm:px-0"
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
              getIntensityColor={getIntensityColor}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                More bad habits
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-rose-500 rounded"></div>
                <div className="w-3 h-3 bg-rose-400 rounded"></div>
                <div className="w-3 h-3 bg-rose-200 rounded"></div>
                <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-emerald-300 rounded"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <div className="w-3 h-3 bg-emerald-600 rounded"></div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                More good habits
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