
import dayjs from 'dayjs';

interface MomentumChartHUDProps {
  currentMomentum: number;
  todayRate: number;
}

export const MomentumChartHUD = ({ currentMomentum = 1.0, todayRate = 0 }: MomentumChartHUDProps) => {
  const today = dayjs().format('MMM D, YYYY');
  
  return (
    <div className="mb-4 px-4 sm:px-0 max-w-[640px] mx-auto py-1">
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">DATE</div>
          <div className="text-gray-800 dark:text-white font-medium">
            {today}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">INDEX</div>
          <div className="text-lg font-bold text-coral">
            {currentMomentum >= 0.001 ? currentMomentum.toFixed(3) : currentMomentum.toFixed(4)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">DAILY RATE</div>
          <div className={`font-semibold ${todayRate >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {(todayRate * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
