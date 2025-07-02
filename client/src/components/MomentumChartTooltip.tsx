
import dayjs from 'dayjs';

interface MomentumChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}

export const MomentumChartTooltip = ({ active, payload, label }: MomentumChartTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 shadow-lg text-sm">
      <div className="font-medium text-gray-800 dark:text-white">
        {dayjs(data.date).format('MMM D, YYYY')}
      </div>
      <div className="text-coral font-semibold">
        Index: {data.value?.toFixed(3)}
      </div>
      <div className={`${(data.dailyRate || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        Rate: {((data.dailyRate || 0) * 100).toFixed(2)}%
      </div>
    </div>
  );
};
