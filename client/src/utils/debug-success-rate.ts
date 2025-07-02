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

  let filteredLogs = logs;
  let relevantDates: string[] = [];

  // Filter logs based on the time filter type, matching Insights.tsx logic
  if (label === 'WEEK') {
    // Week: June 15-21, 2025 (current week containing today June 21)
    const today = new Date('2025-06-21'); // Using June 21 as "today" for consistency
    const weekAnchor = today;
    const startOfWeek = new Date(weekAnchor);
    startOfWeek.setDate(weekAnchor.getDate() - weekAnchor.getDay()); // June 15, 2025
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // June 21, 2025

    const startStr = startOfWeek.toLocaleDateString('en-CA');
    const endStr = endOfWeek.toLocaleDateString('en-CA');

    filteredLogs = logs.filter(log => log.date >= startStr && log.date <= endStr);
    relevantDates = Array.from(new Set(filteredLogs.map(l => l.date))).sort();

    console.log(`📊 WEEK FILTER: ${startStr} → ${endStr}`);
  } else if (label === 'MONTH') {
    // Month: June 1-21, 2025 (current month up to today)
    const startStr = '2025-06-01';
    const endStr = '2025-06-21';

    filteredLogs = logs.filter(log => log.date >= startStr && log.date <= endStr);
    relevantDates = Array.from(new Set(filteredLogs.map(l => l.date))).sort();

    console.log(`📊 MONTH FILTER: ${startStr} → ${endStr}`);
  } else if (label === 'QUARTER') {
    // Quarter: March 31 - June 21, 2025 (Q2 2025 up to today)
    const startStr = '2025-04-01'; // Q2 starts April 1
    const endStr = '2025-06-21';

    filteredLogs = logs.filter(log => log.date >= startStr && log.date <= endStr);
    relevantDates = Array.from(new Set(filteredLogs.map(l => l.date))).sort();

    console.log(`📊 QUARTER FILTER: ${startStr} → ${endStr}`);
  } else if (label === 'ALL TIME') {
    // All Time: June 1, 2024 - June 21, 2025 (all available data)
    const startStr = '2024-06-01';
    const endStr = '2025-06-21';

    filteredLogs = logs.filter(log => log.date >= startStr && log.date <= endStr);
    relevantDates = Array.from(new Set(filteredLogs.map(l => l.date))).sort();

    console.log(`📊 ALL TIME FILTER: ${startStr} → ${endStr}`);
  }

  console.log(`📊 Total unique dates in filtered logs: ${relevantDates.length}`);
  console.log(`📊 Filtered date range: ${relevantDates[0]} → ${relevantDates[relevantDates.length - 1]}`);
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
      const log = filteredLogs.find(l => l.habitId === habit.id && l.date === dateStr);
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