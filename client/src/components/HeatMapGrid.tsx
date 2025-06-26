
import React from 'react';
import { motion } from 'framer-motion';

interface HeatMapCell {
  date: string;
  dateISO: string;
  intensity: number;
  day?: number;
  isToday?: boolean;
  year?: number;
  month?: string;
}

interface HeatMapGridProps {
  cells: HeatMapCell[];
  gridType: 'month' | 'quarter' | 'all-time';
  onCellClick?: (date: string) => void;
  getIntensityColor: (intensity: number) => string;
}

function HeatMapGrid({ cells, gridType, onCellClick, getIntensityColor }: HeatMapGridProps) {
  const getGridLayout = () => {
    switch (gridType) {
      case 'month':
        return 'grid-cols-7'; // 7 days per week
      case 'quarter':
        return 'grid-cols-7'; // 13 weeks × 7 days, but still 7 columns
      case 'all-time':
        return 'grid-cols-12'; // 12 months per year
      default:
        return 'grid-cols-7';
    }
  };

  const getCellSize = () => {
    switch (gridType) {
      case 'month':
        return 'min-w-[44px] min-h-[44px] w-12 h-12'; // Large for month view
      case 'quarter':
        return 'min-w-[44px] min-h-[44px] w-8 h-8'; // Medium for quarter view
      case 'all-time':
        return 'min-w-[44px] min-h-[44px] w-6 h-6'; // Small for all-time view
      default:
        return 'min-w-[44px] min-h-[44px] w-8 h-8';
    }
  };

  const getIntensityColorWithFallback = (intensity: number) => {
    if (getIntensityColor && typeof getIntensityColor === 'function') {
      return getIntensityColor(intensity);
    }
    
    // Fallback color logic
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-800';
    if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
    if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const handleCellClick = (cell: HeatMapCell) => {
    if (onCellClick) {
      // For all-time view, click should pass the month ISO string
      if (gridType === 'all-time' && cell.year && cell.month) {
        onCellClick(`${cell.year}-${cell.month}`);
      } else {
        onCellClick(cell.dateISO || cell.date);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Month view headers */}
      {gridType === 'month' && (
        <div className={`grid ${getGridLayout()} gap-1 mb-2`}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${getGridLayout()} gap-1`}>
        {cells.map((cell, index) => {
          const isEmpty = !cell.date || cell.date === '';
          
          return (
            <motion.button
              key={`${cell.date}-${index}`}
              onClick={() => !isEmpty && handleCellClick(cell)}
              disabled={isEmpty}
              className={`
                ${getCellSize()}
                rounded-sm transition-all duration-200 cursor-pointer
                active:scale-95 active:ring-2 active:ring-coral/50
                touch-manipulation
                ${isEmpty ? 'invisible' : getIntensityColorWithFallback(cell.intensity)}
                ${cell.isToday ? 'ring-2 ring-blue-500' : ''}
                ${!isEmpty ? 'hover:ring-2 hover:ring-gray-400' : ''}
              `}
              title={
                isEmpty 
                  ? undefined 
                  : gridType === 'month' && cell.day
                    ? `${cell.day}: ${(cell.intensity * 100).toFixed(0)}% daily rate`
                    : `${cell.date}: ${(cell.intensity * 100).toFixed(0)}% daily rate`
              }
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: index * 0.01,
                duration: 0.2,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Show day number for month view */}
              {gridType === 'month' && cell.day && (
                <span className="text-xs font-medium text-gray-800 dark:text-white">
                  {cell.day}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend for quarter and all-time views */}
      {(gridType === 'quarter' || gridType === 'all-time') && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-4">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-500 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      )}
    </div>
  );
}

export default HeatMapGrid;
