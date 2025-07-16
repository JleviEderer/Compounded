
import { useState } from 'react';
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
import { MomentumData } from '../types';
import { getTodayEpoch } from '../utils/date';

interface MomentumChartCoreProps {
  data: MomentumData[];
  onHover: (data: MomentumData) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const MomentumChartCore = ({ 
  data, 
  onHover, 
  onDragStart, 
  onDragEnd 
}: MomentumChartCoreProps) => {
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
    if (forecastData.length < 2 || !todayPoint) return true;
    const lastForecastValue = forecastData[forecastData.length - 1].value;
    const todayValue = todayPoint.value;
    return lastForecastValue > todayValue;
  };

  const forecastTrendUp = isForecastTrendingUp();
  const forecastStrokeColor = forecastTrendUp ? "#009B72" : "#D84C3E";
  const forecastGradientId = forecastTrendUp ? "projectionGradientUp" : "projectionGradientDown";

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
    <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
      <AreaChart 
        data={data}
        margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
        onMouseMove={({activePayload}) => activePayload && onHover(activePayload[0].payload)}
        onMouseLeave={() => {
          onHover(data[data.length-1]);
          onDragEnd();
        }}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
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
            if (data.length === 0) return 0.9;
            const values = data.map(d => d.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            
            // For small ranges (typical momentum), use more aggressive scaling
            let buffer;
            if (range < 0.05) {
              // For very small ranges, use minimum 2% buffer to show growth clearly
              buffer = Math.max(range * 0.25, 0.02);
            } else {
              // For larger ranges, use standard 10% buffer
              buffer = range * 0.1;
            }
            
            return Math.max(0.9, min - buffer); // Never go below 0.9 for momentum charts
          }, (dataMax: number) => {
            if (data.length === 0) return 1.1;
            const values = data.map(d => d.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            
            // For small ranges (typical momentum), use more aggressive scaling
            let buffer;
            if (range < 0.05) {
              // For very small ranges, use minimum 2% buffer to show growth clearly
              buffer = Math.max(range * 0.25, 0.02);
            } else {
              // For larger ranges, use standard 10% buffer
              buffer = range * 0.1;
            }
            
            return max + buffer;
          }]}
          hide
        />

        {/* Historical data area */}
        <Area
          type="monotone"
          dataKey={(entry: any) => !entry.isProjection ? entry.value : null}
          stroke="hsl(174, 58%, 46%)"
          strokeWidth={3}
          fill="url(#areaGradient)"
          dot={false}
          connectNulls={false}
        />

        {/* Forecast area */}
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

        {/* Trackball cursor */}
        <RechartsTooltip 
          content={() => null}
          cursor={{ 
            stroke: '#6B7280', 
            strokeWidth: 2, 
            strokeDasharray: '3,3',
            fill: '#6B7280',
            fillOpacity: 0.1,
            r: 4
          }}
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
  );
};
