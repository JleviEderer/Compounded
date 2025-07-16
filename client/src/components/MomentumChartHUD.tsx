
import dayjs from 'dayjs';
import { MomentumData } from '../types';

interface MomentumChartHUDProps {
  hover: MomentumData;
  selectedRange: string;
  totalGrowth: number;
  data: MomentumData[];
}

export const MomentumChartHUD = ({ hover, selectedRange, totalGrowth, data }: MomentumChartHUDProps) => {
  if (!hover) return null;
  
  // Calculate dynamic growth: relative to timeframe start, not absolute from 1.0
  const getDynamicGrowth = () => {
    if (!data || data.length === 0) return 0;
    
    // Find the first historical point (timeframe start) and last historical point
    const historicalData = data.filter(d => !d.isProjection);
    if (historicalData.length === 0) return 0;
    
    const firstHistorical = historicalData[0];
    const lastHistorical = historicalData[historicalData.length - 1];
    
    // For the last historical point, use totalGrowth for consistency with Current Index
    if (lastHistorical && hover.date === lastHistorical.date) {
      return totalGrowth;
    }
    
    // For all other points, calculate growth relative to the timeframe start
    const baselineValue = firstHistorical.value;
    const currentValue = hover.value;
    
    // Calculate growth from timeframe start, not from 1.0
    return ((currentValue - baselineValue) / baselineValue) * 100;
  };
  
  const dynamicGrowth = getDynamicGrowth();
  
  return (
    <div className="mb-4 px-4 sm:px-0 max-w-[640px] mx-auto py-1">
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">DATE</div>
          <div className="text-gray-800 dark:text-white font-medium">
            {dayjs(hover.date).format('MMM D, YYYY')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">GROWTH</div>
          <div className="text-lg font-bold text-coral">
            {dynamicGrowth !== undefined 
              ? `${dynamicGrowth >= 0 ? '+' : ''}${dynamicGrowth.toFixed(1)}%`
              : '+0.0%'
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">DAILY RATE</div>
          <div className={`font-semibold ${(hover.dailyRate || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {((hover.dailyRate || 0) * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
