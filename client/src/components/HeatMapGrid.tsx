import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface HeatMapCell {
  date: string;
  dateISO: string;
  intensity: number;
  isToday?: boolean;
  day?: number;
  month?: string;
  year?: number;
}

interface HeatMapGridProps {
  cells: HeatMapCell[];
  gridType: 'month' | 'quarter' | 'all-time';
  onCellClick?: (isoDate: string) => void;
  getIntensityColor: (intensity: number) => string;
  debugDateRef?: React.MutableRefObject<string>;
}

export default function HeatMapGrid({ cells, gridType, onCellClick, getIntensityColor, debugDateRef }: HeatMapGridProps) {
  // 🔎 One-time probe — remove after test
  if (cells.length) {
    const debugISO = '2025-06-11';                    // change to the date you'll click
    const probe = cells.find(c => c.dateISO === debugISO);
    console.log('[PROBE]', debugISO, probe?.intensity, Date.now());
  }

  const resizeTimeout = useRef<NodeJS.Timeout>();

  // Force re-render when cells data changes with debounced resize
  useEffect(() => {
    clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);
  }, [cells]);
  // Normalize weighted daily rates to -1 to +1 range for color intensity
  const normalizeIntensity = (rawIntensity: number): number => {
    // For debugging: log the raw intensity values
    if (import.meta.env.DEV && rawIntensity !== null && rawIntensity !== undefined) {
      console.log('Raw intensity:', rawIntensity);
    }
    
    // Simple completion rate (0 to 1) - no complex scaling needed
    // Raw intensity should already be a completion rate between 0 and 1
    return Math.max(0, Math.min(1, rawIntensity));
  };

  // Good-only color scale: grey to green gradient only
  const getColor = (intensity: number | null) => {
    if (intensity === null || intensity === undefined) {
      return 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-500'; // no data
    }

    // Debug logging
    if (import.meta.env.DEV) {
      console.log('Getting color for intensity:', intensity);
    }

    // Normalize the intensity to 0 to 1 range (good-only)
    const normalizedIntensity = normalizeIntensity(intensity);
    
    if (import.meta.env.DEV) {
      console.log('Normalized intensity:', normalizedIntensity);
    }

    // Good habits only - grey to green gradient
    if (normalizedIntensity >= 0.75) return 'bg-emerald-600'; // #059669 - heavy positive
    if (normalizedIntensity >= 0.5) return 'bg-emerald-500';  // #10B981 - mid positive
    if (normalizedIntensity >= 0.25) return 'bg-emerald-400'; // #6EE7B7 - light positive  
    if (normalizedIntensity > 0) return 'bg-emerald-300';     // very light positive

    // Exactly zero or no habits logged
    return 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-500'; // #E5E7EB
  };
  const renderMonthGrid = () => {
    const daysInWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded">
          {daysInWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded">
          {cells.map((cell, index) => {
            return (
              <motion.div
                key={`${cell.dateISO}-${cell.intensity}`}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-105 active:scale-95 transition-transform ${
                  cell.day ? getColor(cell.intensity) : 'bg-gray-100 dark:bg-gray-600'
                } ${cell.isToday ? 'ring-2 ring-coral ring-offset-2' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => cell.day && onCellClick?.(cell.dateISO)}
              >
                {cell.day}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQuarterGrid = () => {
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-8 gap-1 text-xs text-gray-600 dark:text-gray-400">
          <div></div>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={i} className="text-center font-medium p-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded">
          {weeks.map((week, weekIndex) => {
            // Get the Sunday date for this week (first cell of the week)
            const sundayDate = week[0]?.date ? new Date(week[0].date) : null;
            const sundayLabel = sundayDate ? sundayDate.toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';

            return [
              <motion.div 
                key={`label-${weekIndex}`}
                className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center p-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: weekIndex * 0.05 }}
              >
                {sundayLabel}
              </motion.div>,
              ...week.map((cell, dayIndex) => (
                <motion.div
                  key={`${cell.dateISO}-${cell.intensity}-${weekIndex}-${dayIndex}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-105 active:scale-95 transition-transform ${getColor(cell.intensity)} ${
                    cell.isToday ? 'ring-2 ring-coral ring-offset-2' : ''
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: weekIndex * 0.05 + dayIndex * 0.01 }}
                  onClick={() => onCellClick?.(cell.dateISO)}
                />
              ))
            ];
          }).flat()}
        </div>
      </div>
    );
  };

  const renderAllTimeGrid = () => {
    const years = {};
    cells.forEach(cell => {
      if (!years[cell.year]) years[cell.year] = [];
      years[cell.year].push(cell);
    });

    return (
      <div className="space-y-4">
        {/* Scrollable wrapper for mobile */}
        <div className="w-full overflow-x-auto heatmap-wrapper pr-6 lg:pr-8 scrollbar-none snap-x relative after:content-['→'] after:text-neutral-500 after:text-xs after:absolute after:right-1 after:top-1/2 after:-translate-y-1/2 after:pointer-events-none sm:after:hidden">
          <div className="grid gap-2 min-w-[672px]" style={{ gridTemplateColumns: 'auto repeat(12, 1fr)' }}>
            {/* Header row */}
            <div></div>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
              <div key={month} className="text-center font-medium text-xs text-gray-600 dark:text-gray-400 pb-2">{month}</div>
            ))}
            
            {/* Year rows */}
            {Object.entries(years).map(([year, months], yearIndex) => [
              <motion.div 
                key={`year-${year}`}
                className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center justify-end pr-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: yearIndex * 0.1 }}
              >
                {year}
              </motion.div>,
              ...(months as HeatMapCell[]).map((cell, monthIndex) => (
                <motion.div
                  key={`${cell.dateISO}-${cell.intensity}-${year}-${monthIndex}`}
                  className={`w-11 h-11 rounded cursor-pointer hover:scale-110 active:bg-neutral-700 active:scale-95 transition-all touch-manipulation ${getColor(cell.intensity)}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: yearIndex * 0.1 + monthIndex * 0.02 }}
                  title={`${year}-${monthIndex + 1}: ${(cell.intensity * 100).toFixed(1)}% completion`}
                  onClick={() => onCellClick?.(cell.dateISO)}
                />
              ))
            ]).flat()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-xs text-gray-500">Less active</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
            <div className="w-3 h-3 bg-emerald-300 rounded"></div>
            <div className="w-3 h-3 bg-emerald-400 rounded"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded"></div>
          </div>
          <span className="text-xs text-gray-500">More active</span>
        </div>
      </div>
    );
  };

  switch (gridType) {
    case 'month':
      return renderMonthGrid();
    case 'quarter':
      return renderQuarterGrid();
    case 'all-time':
      return renderAllTimeGrid();
    default:
      return null;
  }
}