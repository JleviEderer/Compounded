import { motion } from 'framer-motion';
import { useState } from 'react';
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

interface MomentumChartProps {
  data: MomentumData[];
  currentMomentum: number;
  totalGrowth: number;
  todayRate: number;
  projectedTarget: number;
  habits?: any[];
  logs?: any[];
}

export default function MomentumChart({
  data,
  currentMomentum,
  totalGrowth,
  todayRate,
  projectedTarget,
  habits = [],
  logs = []
}: MomentumChartProps) {
  const [selectedRange, setSelectedRange] = useState('30 D');
  
  const timeRanges = [
    { label: '30 D', days: 30 },
    { label: '6 M', days: 180 },
    { label: '1 Y', days: 365 },
    { label: 'All', days: null }
  ];

  // Filter data based on selected time range
  const getFilteredData = () => {
    const range = timeRanges.find(r => r.label === selectedRange);
    if (!range || range.days === null) return data;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - range.days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    return data.filter(d => d.date >= cutoffString);
  };

  const combinedData = getFilteredData();

  // Calculate dynamic Current Index based on time filter
  const getDynamicCurrentIndex = () => {
    if (combinedData.length === 0) return currentMomentum;
    return combinedData[combinedData.length - 1].value;
  };

  // Calculate growth percentage over selected time filter
  const getTimeFilterGrowth = () => {
    if (combinedData.length < 2) return 0;
    const startValue = combinedData[0].value;
    const endValue = combinedData[combinedData.length - 1].value;
    return ((endValue - startValue) / startValue) * 100;
  };

  // Get start date based on time filter
  const getTimeFilterStartDate = () => {
    const range = timeRanges.find(r => r.label === selectedRange);
    if (!range || range.days === null) {
      // For "All", get actual start date
      const habitDates = habits.map(h => new Date(h.createdAt).toISOString().split('T')[0]);
      const logDates = logs.map(l => l.date);
      const allDates = [...habitDates, ...logDates].sort();
      return allDates.length > 0 ? allDates[0] : (data.length > 0 ? data[0].date : 'start');
    } else {
      // For specific ranges, calculate from current date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - range.days);
      return cutoffDate.toISOString().split('T')[0];
    }
  };

  const dynamicCurrentIndex = getDynamicCurrentIndex();
  const timeFilterGrowth = getTimeFilterGrowth();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            {formatDate(label)}
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
            onClick={() => setSelectedRange(range.label)}
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
          <AreaChart data={combinedData}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 58%, 46%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(261, 84%, 82%)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(8, 100%, 74%)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="hsl(8, 100%, 74%)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              interval="preserveStartEnd"
              tickCount={6}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              tickFormatter={(value) => value < 1.00 ? '' : value.toFixed(2)}
              tickCount={5}
            />
            <RechartsTooltip content={<CustomTooltip />} />

            {/* Historical data (before and including today) */}
            <Area
              type="monotone"
              dataKey={(entry: any) => !entry.isProjection ? entry.value : null}
              stroke="hsl(174, 58%, 46%)"
              strokeWidth={3}
              fill="url(#areaGradient)"
              dot={false}
              connectNulls={false}
            />

            {/* Projection line (dotted, from today forward) */}
            <Area
              type="monotone"
              dataKey={(entry: any) => entry.isProjection ? entry.value : null}
              stroke="hsl(8, 100%, 74%)"
              strokeWidth={2}
              strokeDasharray="6,6"
              fill="url(#projectionGradient)"
              dot={false}
              connectNulls={true}
            />

            {/* Today's reference line */}
            <ReferenceLine 
              x={new Date().toISOString().split('T')[0]} 
              stroke="hsl(8, 100%, 74%)" 
              strokeWidth={2}
              strokeDasharray="3,3" 
              opacity={0.8}
              label={{ value: "Today", position: "topLeft", offset: 10 }}
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
              Today's Rate
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Daily momentum rate based on today's habit completions. Positive weights for good habits, negative for bad habits. Formula: sum of (habit_weight × completion_state)</p>
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
              30-Day Target
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Projected momentum index in 30 days based on your recent 7-day average performance. Uses compound growth formula: current_momentum × (1 + avg_rate)^30</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {data.length >= 7 ? ((data.slice(-7).reduce((sum, d) => sum + d.dailyRate, 0) / 7) * 100).toFixed(2) : '0.00'}%
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              7-Day Avg Rate
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Average daily momentum rate over the last 7 days. Shows your recent velocity and trend direction.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
    </motion.div>
  );
}