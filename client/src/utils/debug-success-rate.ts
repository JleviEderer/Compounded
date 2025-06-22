
import { HabitPair, HabitLog } from '../types';
import { calculateSuccessRate } from './compound';

export function debugSuccessRateCalculation(
  habits: HabitPair[],
  logs: HabitLog[],
  days: number,
  label: string
): void {
  console.log(`\n🔍 DEBUG SUCCESS RATE CALCULATION - ${label} (${days} days)`);
  console.log('='.repeat(60));
  
  // Get all unique dates from logs to work with actual data
  const logDates = Array.from(new Set(logs.map(l => l.date))).sort();
  console.log(`📊 Total unique dates in logs: ${logDates.length}`);
  console.log(`📊 Date range: ${logDates[0]} → ${logDates[logDates.length - 1]}`);
  
  // Take the last 'days' number of dates, or all available dates if fewer
  const relevantDates = logDates.slice(-days);
  console.log(`📊 Relevant dates for calculation (last ${days}):`, relevantDates);
  console.log(`📊 Actually using ${relevantDates.length} dates`);
  
  let totalLogged = 0;
  let totalGood = 0;
  let totalBad = 0;
  let dateBreakdown: any[] = [];
  
  relevantDates.forEach(dateStr => {
    let dayGood = 0;
    let dayBad = 0;
    let dayUnlogged = 0;
    
    habits.forEach(habit => {
      const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
      if (log && log.state !== 'unlogged') {
        totalLogged++;
        if (log.state === 'good') {
          totalGood++;
          dayGood++;
        } else if (log.state === 'bad') {
          totalBad++;
          dayBad++;
        }
      } else {
        dayUnlogged++;
      }
    });
    
    dateBreakdown.push({
      date: dateStr,
      good: dayGood,
      bad: dayBad,
      unlogged: dayUnlogged,
      total: dayGood + dayBad + dayUnlogged
    });
  });
  
  console.log('\n📋 DATE-BY-DATE BREAKDOWN:');
  dateBreakdown.forEach(day => {
    console.log(`  ${day.date}: ${day.good} good, ${day.bad} bad, ${day.unlogged} unlogged (${day.total} total habits)`);
  });
  
  const calculatedRate = totalLogged > 0 ? Math.round((totalGood / totalLogged) * 100) : 0;
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Total habits checked: ${habits.length}`);
  console.log(`  Total days analyzed: ${relevantDates.length}`);
  console.log(`  Total possible logs: ${habits.length * relevantDates.length}`);
  console.log(`  Total logged (good + bad): ${totalLogged}`);
  console.log(`  Total good logs: ${totalGood}`);
  console.log(`  Total bad logs: ${totalBad}`);
  console.log(`  Total unlogged: ${habits.length * relevantDates.length - totalLogged}`);
  console.log(`  Success Rate: ${totalGood}/${totalLogged} = ${calculatedRate}%`);
  
  // Verify against the actual function
  const actualRate = calculateSuccessRate(habits, logs, days);
  console.log(`  Actual function result: ${actualRate}%`);
  console.log(`  Match: ${calculatedRate === actualRate ? '✅' : '❌'}`);
  
  console.log('='.repeat(60));
}
