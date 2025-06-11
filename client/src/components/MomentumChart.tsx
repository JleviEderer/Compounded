import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  ReferenceLine 
} from 'recharts';
import { MomentumData } from '../types';

interface MomentumChartProps {
  data: MomentumData[];
  projectionData?: MomentumData[];
  currentMomentum: number;
  totalGrowth: number;
  todayRate: number;
  projectedTarget: number;
  showProjection?: boolean;
}

export default function MomentumChart({
  data,
  projectionData = [],
  currentMomentum,
  totalGrowth,
  todayRate,
  projectedTarget,
  showProjection = false
}: MomentumChartProps) {
  const combinedData = showProjection 
    ? [...data, ...projectionData.map(d => ({ ...d, isProjection: true }))]
    : data;

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
            <Tooltip content={<CustomTooltip />} />
            
            {/* Historical data */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(174, 58%, 46%)"
              strokeWidth={3}
              fill="url(#areaGradient)"
              dot={false}
              connectNulls={false}
            />
            
            {/* Projection line */}
            {showProjection && (
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
            )}
            
            {/* Current day reference line */}
            <ReferenceLine 
              x={new Date().toISOString().split('T')[0]} 
              stroke="hsl(8, 100%, 74%)" 
              strokeDasharray="2,2" 
              opacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <motion.div 
          className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            {totalGrowth.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Growth</div>
        </motion.div>
        
        <motion.div 
          className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-emerald-600">
            +{(todayRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Today's Rate</div>
        </motion.div>
        
        <motion.div 
          className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl font-bold text-coral">
            {projectedTarget.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">30-Day Target</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
