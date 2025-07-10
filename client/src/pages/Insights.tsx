import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DayDetailModal from '../components/DayDetailModal';
import { InsightsQuickStats } from '../components/InsightsQuickStats';
import { InsightsTimeFilterPills } from '../components/InsightsTimeFilterPills';
import { InsightsWeekView } from '../components/InsightsWeekView';
import { InsightsMonthView } from '../components/InsightsMonthView';
import { InsightsQuarterView } from '../components/InsightsQuarterView';
import { InsightsAllTimeView } from '../components/InsightsAllTimeView';
import { useInsightsData } from '../hooks/useInsightsData';
import { useInsightsNavigation } from '../hooks/useInsightsNavigation';
import { getCurrentStreak } from '../hooks/useInsightsHelpers';
import { useHabitsContext as useHabits } from '../contexts/HabitsContext';

type InsightsViewMode = 'week' | 'month' | 'quarter' | 'all-time';

export default function Insights() {
  const {
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
  const { habits } = useHabits();

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
          currentStreak={getCurrentStreak(habits, logs)}
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
          <InsightsMonthView
            anchor={anchor}
            setAnchor={setAnchor}
            openDay={openDay}
          />
        )}

        {activeView === 'quarter' && (
          <InsightsQuarterView
            quarterAnchor={quarterAnchor}
            setQuarterAnchor={setQuarterAnchor}
            isCurrentQuarter={isCurrentQuarter}
            getQuarterLabel={getQuarterLabel}
            navigateQuarter={navigateQuarter}
            openDay={openDay}
          />
        )}

        {activeView === 'all-time' && (
          <InsightsAllTimeView
            openMonth={openMonth}
          />
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