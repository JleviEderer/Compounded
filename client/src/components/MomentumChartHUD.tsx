
import dayjs from 'dayjs';
import { MomentumData } from '../types';

interface MomentumChartHUDProps {
  hover: MomentumData;
}

export const MomentumChartHUD = ({ hover }: MomentumChartHUDProps) => {
  return (
    <div className="mb-4 px-4 sm:px-0 max-w-[640px] mx-auto py-1">
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">DATE</div>
          <div className="text-gray-800 dark:text-white font-medium">
            {dayjs(hover?.date).format('MMM D, YYYY')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">INDEX</div>
          <div className="text-lg font-bold text-coral">
            {hover?.value ? (hover.value >= 0.001 ? hover.value.toFixed(3) : hover.value.toFixed(4)) : '0.000'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">DAILY RATE</div>
          <div className={`font-semibold ${(hover?.dailyRate || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {((hover?.dailyRate || 0) * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
