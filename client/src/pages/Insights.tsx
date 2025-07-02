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
import { InsightsQuickStats } from '../components/InsightsQuickStats';
import { InsightsTimeFilterPills } from '../components/InsightsTimeFilterPills';
import { InsightsWeekView } from '../components/InsightsWeekView';
import { useInsightsData } from '../hooks/useInsightsData';
import { useInsightsNavigation } from '../hooks/useInsightsNavigation';

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
  const {
    habits,
    logs,
    settings,
    activeView,
    setActiveView,
    anchor,
    setAnchor,
    weekAnchor,
    setWeekAnchor,
    quarterAnchor,
    setQuarterAnchor,
    filteredLogs,
    momentum
  } = useInsightsData();

  const {
    isCurrentWeek,
    isCurrentQuarter,
    navigateWeek,
    navigateQuarter,
    getWeekLabel,
    getQuarterLabel
  } = useInsightsNavigation(weekAnchor, quarterAnchor, setWeekAnchor, setQuarterAnchor);

  const [dayModal, setDayModal] = useState<string | null>(null);
  const [popoverHabit, setPopoverHabit] = useState<{ id: string; name: string } | null>(null);
  const popoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { 
    successRate, 
    recentAvgRate
  } = momentum;

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

  React.useEffect(() => {
    if (habits.length > 0 && logs.length > 0) {
      import('../utils/debug-success-rate').then(({ debugSuccessRateCalculation }) => {
        debugSuccessRateCalculation(habits, logs, 7, 'WEEK');
        debugSuccessRateCalculation(habits, logs, 30, 'MONTH');
        debugSuccessRateCalculation(habits, logs, 90, 'QUARTER');
        debugSuccessRateCalculation(habits, logs, 365, 'ALL TIME');
      });
    }
  }, [habits, logs]);

  const openMonth = (isoMonth: string) => {
    const [year, month] = isoMonth.split('-');
    const newAnchor = new Date(parseInt(year), parseInt(month) - 1, 1);
    setAnchor(newAnchor);
    setActiveView('month');
  };

  const openDay = (isoDate: string) => {
    setDayModal(isoDate);
  };

  const getCurrentStreak = () => {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toLocaleDateString('en-CA');

      const dayLogs = logs.filter(log => log.date === dateStr && log.state === 'good');
      if (dayLogs.length > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getCalendarDays = () => {
    const today = new Date();
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: '',
        dateISO: '',
        intensity: 0,
        day: undefined
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(anchor.getFullYear(), anchor.getMonth(), day);
      const dateStr = date.toLocaleDateString('en-CA');
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

        let totalDailyRate = 0;
        let daysWithData = 0;

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = date.toLocaleDateString('en-CA');
          const dailyRate = calculateDailyRate(habits, filteredLogs, dateStr);

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

        <InsightsTimeFilterPills activeView={activeView} setActiveView={setActiveView} />

        <InsightsQuickStats
          successRate={successRate}
          recentAvgRate={recentAvgRate}
          currentStreak={getCurrentStreak()}
          totalHabits={habits.length}
        />

        {activeView === 'week' && (
          <InsightsWeekView
            habits={habits}
            filteredLogs={filteredLogs}
            weekAnchor={weekAnchor}
            isCurrentWeek={isCurrentWeek}
            getWeekLabel={getWeekLabel}
            navigateWeek={navigateWeek}
            setWeekAnchor={setWeekAnchor}
            popoverHabit={popoverHabit}
            setPopoverHabit={setPopoverHabit}
          />
        )}

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

        {activeView === 'all-time' && (
          <motion.div 
            className="space-y-6 overflow-x-hidden px-2 sm:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              All Time Overview
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

      {dayModal && (
        <DayDetailModal 
          date={dayModal} 
          onClose={() => setDayModal(null)} 
        />
      )}
    </div>
  );
}