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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const epoch = data.epoch || label;
      return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            {format(epoch, 'M/d/yy')}
          </p>
          <p className="text-sm text-coral">
            Momentum: {data.value.toFixed(3)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Daily Rate: {(data.dailyRate * 100).toFixed(2)}%
          </p>
          {data.isProjection && (
            <p className="text-xs text-gray-500 italic">Projected</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="card-glass p-8"
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
              <TooltipContent className="max-w-xs">
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
      <div className="flex gap-2 mb-4">
        {timeRanges.map((range) => (
          <motion.button
            key={range.label}
            onClick={() => onRangeChange(range.label)}
            className={`relative flex px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedRange === range.label
                ? 'text-white dark:text-white'
                : 'text-teal-700 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {selectedRange === range.label && (
              <motion.div
                layoutId="range"
                className="absolute inset-0 bg-teal-600 dark:bg-teal-400 rounded-full"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30
                }}
              />
            )}
            <span className="relative z-10">{range.label}</span>
          </motion.button>
        ))}
      </div>

      <motion.div 
        className="h-80 w-full"
        layout
        transition={{ type: 'spring', stiffness: 80, duration: 0.3 }}
      >
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
            <RechartsTooltip content={<CustomTooltip />} />

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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                  <p>Daily momentum rate based on the latest day's habit completions in the selected time period. Positive weights for good habits, negative for bad habits.</p>
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
                  <p>Average daily momentum rate over the recent period. Shows your velocity and trend direction for the selected time range.</p>
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