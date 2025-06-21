import { motion } from 'framer-motion';

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
}

export default function HeatMapGrid({ cells, gridType, onCellClick, getIntensityColor }: HeatMapGridProps) {
  // Normalize weighted daily rates to -1 to +1 range for color intensity
  const normalizeIntensity = (rawIntensity: number): number => {
    // Weighted daily rates typically range from -0.016 to +0.016 (4 habits * 0.004 max weight)
    // We'll use a reasonable scale factor to map this to -1 to +1 range
    const scaleFactor = 250; // Adjust this if needed based on actual data range
    return Math.max(-1, Math.min(1, rawIntensity * scaleFactor));
  };

  // Diverging color scale for negative/positive momentum
  const getColor = (intensity: number | null) => {
    if (intensity === null || intensity === undefined) {
      return 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-500'; // no data
    }

    // Normalize the intensity to -1 to +1 range
    const normalizedIntensity = normalizeIntensity(intensity);

    // Negative momentum (bad habits dominate) - coral/rose shades
    if (normalizedIntensity < 0) {
      const absValue = Math.abs(normalizedIntensity);
      if (absValue >= 0.75) return 'bg-rose-500'; // #F43F5E - heavy negative
      if (absValue >= 0.5) return 'bg-rose-400';  // #FB7185 - mid negative  
      if (absValue >= 0.25) return 'bg-rose-300'; // #FBC5D2 - light negative
      return 'bg-rose-200';                       // very light negative
    }
    
    // Positive momentum (good habits dominate) - teal/emerald shades
    if (normalizedIntensity > 0) {
      if (normalizedIntensity >= 0.75) return 'bg-emerald-600'; // #059669 - heavy positive
      if (normalizedIntensity >= 0.5) return 'bg-emerald-500';  // #10B981 - mid positive
      if (normalizedIntensity >= 0.25) return 'bg-emerald-400'; // #6EE7B7 - light positive  
      return 'bg-emerald-300';                        // very light positive
    }
    
    // Exactly zero or no habits logged
    return 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-500'; // #E5E7EB
  };
  const renderMonthGrid = () => {
    const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-0.5 bg-white p-1 rounded">
          {daysInWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 bg-white p-1 rounded">
          {cells.map((cell, index) => (
            <motion.div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-105 transition-transform ${
                cell.day ? getColor(cell.intensity) : 'bg-gray-100 dark:bg-gray-600'
              } ${cell.isToday ? 'ring-2 ring-coral ring-offset-2' : ''}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => cell.day && onCellClick?.(cell.dateISO)}
            >
              {cell.day}
            </motion.div>
          ))}
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
        <div className="grid grid-cols-8 gap-0.5 text-xs text-gray-600 dark:text-gray-400">
          <div></div>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className="text-center font-medium p-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-0.5 bg-white p-1 rounded">
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
                  key={`${weekIndex}-${dayIndex}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-105 transition-transform ${getColor(cell.intensity)} ${
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
        <div className="grid gap-2 text-xs text-gray-600 dark:text-gray-400" style={{ gridTemplateColumns: 'auto repeat(12, 1fr)' }}>
          <div></div>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
            <div key={month} className="text-center font-medium">{month}</div>
          ))}
        </div>
        {Object.entries(years).map(([year, months], yearIndex) => (
          <motion.div 
            key={year} 
            className="grid gap-2"
            style={{ gridTemplateColumns: 'auto repeat(12, 1fr)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: yearIndex * 0.1 }}
          >
            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center justify-end pr-2">
              {year}
            </div>
            {(months as HeatMapCell[]).map((cell, monthIndex) => (
              <motion.div
                key={monthIndex}
                className={`w-4 h-4 rounded cursor-pointer hover:scale-125 transition-transform ${getColor(cell.intensity)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: yearIndex * 0.1 + monthIndex * 0.02 }}
                title={`${year}-${monthIndex + 1}: ${(cell.intensity * 100).toFixed(1)}% completion`}
                onClick={() => onCellClick?.(cell.dateISO)}
              />
            ))}
          </motion.div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-xs text-gray-500">More negative</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-rose-500 rounded"></div>
            <div className="w-3 h-3 bg-rose-400 rounded"></div>
            <div className="w-3 h-3 bg-rose-200 rounded"></div>
            <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
            <div className="w-3 h-3 bg-emerald-300 rounded"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded"></div>
          </div>
          <span className="text-xs text-gray-500">More positive</span>
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