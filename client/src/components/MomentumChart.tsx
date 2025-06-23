
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  ReferenceLine,
  CartesianGrid 
} from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { MomentumData } from '../types';
import { toLocalMidnight } from '../utils/compound';
import { getTodayEpoch } from '../utils/date';

interface MomentumChartProps {
  data: MomentumData[];
  currentMomentum: number;
  totalGrowth: number;
  todayRate: number;
  projectedTarget: number;
  recentAvgRate: number;
  avgWindowDays: number;
  habits?: any[];
  logs?: any[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  timeRanges: { label: string; days: number | null }[];
  projWindowDays: number;
}

interface ScrubTooltipData {
  x: number;
  value: number;
  date: string;
  rate: number;
}

// Custom hook for mobile scrub tooltip
function useScrubTooltip(data: MomentumData[], containerRef: React.RefObject<HTMLDivElement>) {
  const [tooltip, setTooltip] = useState<ScrubTooltipData | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;
      
      // Calculate which data point we're closest to
      const dataIndex = Math.round((x / containerWidth) * (data.length - 1));
      const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));
      const dataPoint = data[clampedIndex];
      
      if (dataPoint) {
        setTooltip({
          x,
          value: dataPoint.value,
          date: dataPoint.date,
          rate: dataPoint.dailyRate
        });
      }
    };

    const handlePointerLeave = () => {
      setTooltip(null);
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [data]);

  return tooltip;
}

// Mobile scrub bubble component
function MobileScrubBubble({ tooltip }: { tooltip: ScrubTooltipData | null }) {
  if (!tooltip) return null;

  return (
    <div
      className="absolute pointer-events-none z-10 sm:hidden"
      style={{
        left: tooltip.x,
        top: -60,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 text-xs">
        <p className="font-medium text-gray-800 dark:text-white">
          {format(new Date(tooltip.date), 'M/d/yy')}
        </p>
        <p className="text-coral font-medium">
          {tooltip.value.toFixed(3)}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {(tooltip.rate * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

export default function MomentumChart({
  data,
  currentMomentum,
  totalGrowth,
  todayRate,
  projectedTarget,
  recentAvgRate,
  avgWindowDays,
  habits = [],
  logs = [],
  selectedRange,
  onRangeChange,
  timeRanges,
  projWindowDays
}: MomentumChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltip = useScrubTooltip(data, chartContainerRef);

  // Separate historical and forecast data for clean rendering
  const historicalData = data.filter(d => !d.isProjection);
  const forecastData = data.filter(d => d.isProjection);

  // Create a connecting point between historical and forecast
  const todayPoint = historicalData.length > 0 ? historicalData[historicalData.length - 1] : null;
  const forecastWithConnection = todayPoint && forecastData.length > 0 
    ? [{ ...todayPoint, isProjection: true }, ...forecastData]
    : forecastData;

  // Determine forecast trend direction
  const isForecastTrendingUp = () => {
    if (forecastData.length < 2 || !todayPoint) return true; // Default to up if no data
    const lastForecastValue = forecastData[forecastData.length - 1].value;
    const todayValue = todayPoint.value;
    return lastForecastValue > todayValue;
  };

  const forecastTrendUp = isForecastTrendingUp();
  const forecastStrokeColor = forecastTrendUp ? "#009B72" : "#D84C3E";
  const forecastGradientId = forecastTrendUp ? "projectionGradientUp" : "projectionGradientDown";

  // Use the pre-calculated current momentum from filtered data
  const getDynamicCurrentIndex = () => {
    return currentMomentum;
  };

  // Use the pre-calculated total growth from filtered data
  const getTimeFilterGrowth = () => {
    return totalGrowth;
  };

  // Get start date based on actual filtered data
  const getTimeFilterStartDate = () => {
    if (data.length === 0) return 'start';
    return data[0].date;
  };

  const dynamicCurrentIndex = getDynamicCurrentIndex();
  const timeFilterGrowth = getTimeFilterGrowth();

  const formatDate = (epochOrDateStr: number | string) => {
    const date = typeof epochOrDateStr === 'number' ? new Date(epochOrDateStr) : new Date(epochOrDateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
  };

  // Create today's epoch for reference line
  const todayEpoch = getTodayEpoch();

  // Compute the last historical epoch for custom ticks
  const lastHist = [...data].reverse().find(d => !d.isProjection)?.epoch;

  // Build ticks array to handle case where lastHist === todayEpoch
  const ticksArr = [data[0]?.epoch, todayEpoch];
  if (lastHist && lastHist !== todayEpoch) {
    ticksArr.splice(1, 0, lastHist);
  }

  return (
    <motion.div 
      className="w-full sm:px-4 px-4 sm:px-6 lg:px-8 rounded-none shadow-none sm:rounded-xl sm:shadow card-glass p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Momentum Index
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your compound growth over time
          </p>
        </div>
        <div className="text-right">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  className="text-4xl font-bold text-coral cursor-help"
                  key={dynamicCurrentIndex}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {dynamicCurrentIndex.toFixed(2)}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>Total Growth since {selectedRange}: {timeFilterGrowth >= 0 ? '+' : ''}{timeFilterGrowth.toFixed(1)}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Index</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Growth since {formatDate(getTimeFilterStartDate())}
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
        {timeRanges.map((range) => (
          <motion.button
            key={range.label}
            onClick={() => onRangeChange(range.label)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedRange === range.label
                ? 'bg-coral text-white shadow-lg'
                : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              {range.label}
            </motion.button>
          ))}
        </div>

        <motion.div 
          ref={chartContainerRef}
          className="h-[220px] md:h-[300px] relative"
          layout
          transition={{ type: 'spring', stiffness: 80, duration: 0.3 }}
        >
          <div className="-mx-4 sm:mx-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 58%, 46%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(261, 84%, 82%)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="projectionGradientUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009B72" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#009B72" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="projectionGradientDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D84C3E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D84C3E" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="hidden sm:block" />
                <XAxis 
                  dataKey="epoch"
                  type="number"
                  scale="time"
                  domain={['dataMin', todayEpoch]}
                  ticks={ticksArr.filter(Boolean)}
                  tickFormatter={(t) => format(t, 'M/d')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  hide
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  domain={[
                    (dataMin: number) => Math.max(0.98, dataMin - 0.02),
                    (dataMax: number) => dataMax + 0.02
                  ]}
                  tickFormatter={(value) => value.toFixed(3)}
                  tickCount={5}
                />

                {/* Historical data area - only show non-projection points */}
                <Area
                  type="monotone"
                  dataKey={(entry: any) => !entry.isProjection ? entry.value : null}
                  stroke="hsl(174, 58%, 46%)"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />

                {/* Forecast area - only show projection points */}
                <Area
                  type="monotone"
                  dataKey={(entry: any) => entry.isProjection ? entry.value : null}
                  stroke={forecastStrokeColor}
                  strokeWidth={1.5}
                  strokeDasharray="8,4"
                  fill={`url(#${forecastGradientId})`}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />

                {/* Today marker */}
                <ReferenceLine
                  x={todayEpoch}
                  stroke="#6B7280"
                  strokeWidth={1}
                  opacity={0.5}
                  isFront
                  ifOverflow="extendDomain"
                  label={{ 
                    value: 'Today', 
                    position: 'top', 
                    offset: 8,
                    fill: '#6B7280', 
                    fontSize: 12, 
                    fontWeight: 500 
                  }}
                  data-testid="today-line"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Mobile scrub tooltip */}
          <MobileScrubBubble tooltip={tooltip} />
        </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 mb-6">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {todayRate >= 0 ? '+' : ''}{(todayRate * 100).toFixed(2)}%
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            Latest Rate
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Daily rate from your most recent day with habit data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {projectedTarget.toFixed(2)}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            Projected Index
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    {selectedRange === 'All Time' 
                      ? 'Current momentum index (no forecast for All Time view)'
                      : `Projected momentum index based on your recent avg rate`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {selectedRange === 'All Time' ? '(current)' : `(${projWindowDays}-day projection)`}
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {(recentAvgRate * 100).toFixed(2)}%
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            Recent Avg Rate
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Recent average rate used to calculate the projected index</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ({avgWindowDays}-day average)
          </div>
        </div>
      </div>
    </motion.div>
  );
}
