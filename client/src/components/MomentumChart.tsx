import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  ReferenceLine 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
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
  
  const [tooltipData, setTooltipData] = useState<any>(null);

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

  // Initialize with the most recent data point
  useState(() => {
    if (data.length > 0) {
      // Get the most recent historical data point
      const mostRecentHistorical = historicalData.length > 0 
        ? historicalData[historicalData.length - 1] 
        : data[data.length - 1];
      setTooltipData(mostRecentHistorical);
    }
  }, [data, historicalData]);

  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const chartData = state.activePayload[0].payload;
      setTooltipData(chartData);
    }
  };

  const handleMouseLeave = () => {
    // Reset to most recent historical data point instead of hiding
    if (historicalData.length > 0) {
      setTooltipData(historicalData[historicalData.length - 1]);
    }
  };

  const FloatingDataDisplay = () => {
    if (!tooltipData) return null;

    const epoch = tooltipData.epoch;
    return (
      <motion.div 
        className="absolute top-4 right-4 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-gray-300/50 dark:border-gray-600/50 min-w-[200px]"
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="space-y-3">
          <motion.p 
            className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50 pb-2"
            key={epoch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {format(epoch, 'MMM d, yyyy')}
          </motion.p>
          <div className="space-y-2">
            <motion.div 
              className="flex justify-between items-center"
              key={`momentum-${tooltipData.value}`}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">Momentum</span>
              <span className="font-bold text-coral text-lg">{tooltipData.value.toFixed(3)}</span>
            </motion.div>
            <motion.div 
              className="flex justify-between items-center"
              key={`rate-${tooltipData.dailyRate}`}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily Rate</span>
              <span className={`font-bold text-lg ${tooltipData.dailyRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {tooltipData.dailyRate >= 0 ? '+' : ''}{(tooltipData.dailyRate * 100).toFixed(2)}%
              </span>
            </motion.div>
            {tooltipData.isProjection && (
              <motion.div 
                className="text-center pt-2 border-t border-gray-300/30 dark:border-gray-600/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 italic font-medium bg-purple-100/50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                  Projected
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.section 
      className="w-full px-0 sm:px-6 lg:px-8 md:bg-white/50 md:dark:bg-gray-800/50 md:rounded-xl md:shadow-lg md:backdrop-blur-md p-4 sm:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Momentum Index
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your compound growth over time
        </p>
      </div>

      <motion.div 
          className="h-[220px] md:h-[300px] w-full mb-6 relative"
          layout
          transition={{ type: 'spring', stiffness: 80, duration: 0.3 }}
        >
        <FloatingDataDisplay />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
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
              padding={{ left: 0, right: 0 }}
              hide
            />
            <YAxis 
              domain={[(dataMin: number) => {
                const range = data.length > 0 ? Math.max(...data.map(d => d.value)) - Math.min(...data.map(d => d.value)) : 0;
                const buffer = Math.max(0.005, range * 0.1); // At least 0.005 or 10% of range
                return dataMin - buffer;
              }, (dataMax: number) => {
                const range = data.length > 0 ? Math.max(...data.map(d => d.value)) - Math.min(...data.map(d => d.value)) : 0;
                const buffer = Math.max(0.005, range * 0.1); // At least 0.005 or 10% of range
                return dataMax + buffer;
              }]}
              hide
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
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-8 justify-center">
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

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2">
        {/* Top Row */}
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

        {/* Bottom Row */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  className="text-2xl font-bold text-coral cursor-help"
                  key={dynamicCurrentIndex}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {dynamicCurrentIndex.toFixed(2)}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Total Growth since {selectedRange}: {timeFilterGrowth >= 0 ? '+' : ''}{timeFilterGrowth.toFixed(1)}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Index</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Growth since {formatDate(getTimeFilterStartDate())}
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
      </div>
    </motion.section>
  );
}