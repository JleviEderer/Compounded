
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
  
  // Calculate dynamic growth from start of timeframe to hovered point
  const getDynamicGrowth = () => {
    if (!data || data.length === 0) return 0;
    
    // For timeframe calculations, we always use 1.0 as baseline (matches Current Index calculation)
    // This ensures consistency between HUD growth and Current Index growth
    const baselineValue = 1.0;
    const currentValue = hover.value;
    
    // Calculate relative growth from 1.0 baseline (same as timeframe momentum calculation)
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
