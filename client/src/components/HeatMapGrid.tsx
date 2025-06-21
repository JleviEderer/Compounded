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
  // Diverging color scale for negative/positive momentum
  const getColor = (value: number | null) => {
    const NEG_HI = '#F43F5E';  // heavy negative
    const NEG_MID = '#FB7185';
    const NEAR_ZERO = '#FBC5D2';
    const POS_MID = '#6EE7B7';
    const POS_HI = '#059669';
    const NO_DATA = 'bg-gray-200 border border-gray-300';

    if (value === null) return NO_DATA;

    if (value < 0) {
      if (value <= -4) return `bg-[${NEG_HI}]`;
      if (value <= -2) return `bg-[${NEG_MID}]`;
      return `bg-[${NEAR_ZERO}]`;
    }
    if (value > 0) {
      if (value >= 4) return `bg-[${POS_HI}]`;
      if (value >= 2) return `bg-[${POS_MID}]`;
      return `bg-[${NEAR_ZERO}]`;
    }
    return NO_DATA;
  };

  const renderMonthGrid = () => {
    const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-0.5 bg-white dark:bg-gray-900 p-1 rounded">
          {daysInWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 bg-white dark:bg-gray-900 p-1 rounded">
          {cells.map((cell, index) => (
            <motion.div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-105 transition-transform ${
                cell.day ? getColor(cell.intensity) : ''
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
        <div className="grid grid-cols-8 gap-0.5 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
          <div></div>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center font-medium">{day}</div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <motion.div 
            key={weekIndex} 
            className="grid grid-cols-8 gap-0.5 bg-white dark:bg-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: weekIndex * 0.05 }}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              W{weekIndex + 1}
            </div>
            {week.map((cell, dayIndex) => (
              <motion.div
                key={dayIndex}
                className={`aspect-square rounded cursor-pointer hover:scale-105 transition-transform ${getColor(cell.intensity)} ${
                  cell.isToday ? 'ring-2 ring-coral ring-offset-1' : ''
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: weekIndex * 0.05 + dayIndex * 0.01 }}
                onClick={() => onCellClick?.(cell.dateISO)}
              />
            ))}
          </motion.div>
        ))}
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
        <div className="grid gap-0.5 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400" style={{ gridTemplateColumns: 'auto repeat(12, 1fr)' }}>
          <div></div>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
            <div key={month} className="text-center font-medium">{month}</div>
          ))}
        </div>
        {Object.entries(years).map(([year, months], yearIndex) => (
          <motion.div 
            key={year} 
            className="grid gap-0.5 bg-white dark:bg-gray-900"
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