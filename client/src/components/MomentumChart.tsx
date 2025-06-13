import { motion } from 'framer-motion';
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
}

export default function MomentumChart({
  data,
  currentMomentum,
  totalGrowth,
  todayRate,
  projectedTarget
}: MomentumChartProps) {
  const combinedData = data;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
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
          <motion.div 
            className="text-4xl font-bold text-coral"
            key={currentMomentum}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {currentMomentum.toFixed(2)}
          </motion.div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Index</div>
        </div>
      </div>

      <div className="h-80 w-full">
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
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
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
      </div>

      {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(1)}%
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              Total Growth
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Percentage change from your starting momentum index to current momentum. Shows overall compound progress over time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

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
            <div className="text-2xl font-bold text-coral">
              {currentMomentum.toFixed(2)}
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              Current Index
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Your current momentum index calculated by compounding daily rates from start date. Formula: momentum = 1.0 × ∏(1 + daily_rate) for each day</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
    </motion.div>
  );
}