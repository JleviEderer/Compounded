
# Momentum App Metrics Reference

This document explains each metric displayed in the Momentum app, how it's calculated, and what value it provides to users.

## 1. Total Growth

**What it shows:** The percentage change from your starting momentum index to your current momentum index.

**How it's calculated:**
```typescript
// From the initial momentum value to current momentum value
const totalGrowth = ((currentMomentum - initialMomentum) / initialMomentum) * 100;
```

**User value:** 
- Shows your overall compound progress over time
- Helps you see the big picture of your habit journey
- Demonstrates the power of consistent small improvements

**Display:** `+15.3%` (green for positive, red for negative)

---

## 2. Today's Rate

**What it shows:** Your daily momentum rate based on today's habit completions.

**How it's calculated:**
```typescript
// Sum of (habit_weight × completion_state) for today
let totalWeight = 0;
for (const habit of habits) {
  const log = logs.find(l => l.habitId === habit.id && l.date === today);
  if (log?.state === 'good') {
    totalWeight += habit.weight;  // Positive contribution
  } else if (log?.state === 'bad') {
    totalWeight -= habit.weight;  // Negative contribution
  }
  // No log = 0 contribution
}
return totalWeight;
```

**User value:**
- Immediate feedback on today's performance
- Shows how your daily choices impact momentum
- Motivates completion of remaining habits

**Display:** `+0.35%` (percentage format)

---

## 3. Current Index

**What it shows:** Your current momentum index calculated by compounding daily rates from your start date.

**How it's calculated:**
```typescript
// Compound formula starting from 1.0
let momentum = 1.0;
for (each day from startDate to today) {
  const dailyRate = calculateDailyRate(habits, logs, date);
  momentum *= (1 + dailyRate);
}
return Math.max(0, momentum); // Clamp to >= 0
```

**User value:**
- Your core momentum score
- Shows compound effect of consistent habits
- Primary indicator of progress trajectory

**Display:** `1.23` (decimal format, prominently featured)

---

## 4. 30-Day Target

**What it shows:** Projected momentum index in 30 days based on your recent 7-day average performance.

**How it's calculated:**
```typescript
// Get 7-day average rate
const last7Days = recentData.slice(-7);
const avgRate = last7Days.reduce((sum, d) => sum + d.dailyRate, 0) / 7;

// Project 30 days forward
const projectedTarget = currentMomentum * Math.pow(1 + avgRate, 30);
```

**User value:**
- Forward-looking motivation
- Shows where current habits will take you
- Helps set realistic expectations and goals

**Display:** `1.45` (decimal format)

---

## 5. 7-Day Average Rate

**What it shows:** Average daily momentum rate over the last 7 days.

**How it's calculated:**
```typescript
const last7Days = data.slice(-7);
const avgRate = last7Days.reduce((sum, d) => sum + d.dailyRate, 0) / 7;
const percentage = avgRate * 100;
```

**User value:**
- Shows recent velocity and trend direction
- Quick "velocity" read without going to detailed insights
- Smooths out daily fluctuations for clearer patterns

**Display:** `+0.15%` (percentage format)

---

## 6. Success Rate

**What it shows:** Percentage of habit completions that were "good" over the last 30 days.

**How it's calculated:**
```typescript
let totalLogged = 0;
let totalGood = 0;

// Count all logged habits in the period
for (each date in last 30 days) {
  for (each habit) {
    const log = logs.find(l => l.habitId === habit.id && l.date === date);
    if (log && log.state !== 'unlogged') {
      totalLogged++;
      if (log.state === 'good') {
        totalGood++;
      }
    }
  }
}

return totalLogged > 0 ? (totalGood / totalLogged) * 100 : 0;
```

**User value:**
- Simple completion percentage metric
- Easy to understand progress indicator
- Complements momentum calculations with raw completion data

**Display:** `73%` (percentage format)

---

## 7. Average Daily Rate

**What it shows:** Average daily momentum rate across the entire tracking period.

**How it's calculated:**
```typescript
const totalDays = momentumData.length;
const totalRate = momentumData.reduce((sum, day) => sum + day.dailyRate, 0);
const avgDailyRate = totalRate / totalDays;
```

**User value:**
- Long-term average performance indicator
- Shows overall habit effectiveness
- Baseline for comparing recent performance

**Display:** `+0.12%` (percentage format)

---

## 8. Current Streak

**What it shows:** Number of consecutive days a specific habit has been completed successfully.

**How it's calculated:**
```typescript
function calculateCurrentStreak(habitId: string, logs: HabitLog[]): number {
  let streak = 0;
  let currentDate = new Date();
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = logs.find(l => l.habitId === habitId && l.date === dateStr);
    
    if (log?.state === 'good') {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
```

**User value:**
- Gamification element that encourages consistency
- Immediate feedback on habit-specific progress
- Motivates maintaining winning streaks

**Display:** `7 days` (per habit)

---

## 9. Active Habits

**What it shows:** Total number of habit pairs currently being tracked.

**How it's calculated:**
```typescript
const activeHabits = habits.length;
```

**User value:**
- Simple count of complexity/scope
- Helps users understand their current commitment level
- Context for other metrics (higher habit count = more complexity)

**Display:** `4` (simple number)

---

## Metric Relationships

- **Current Index** is the primary metric, calculated from daily rates
- **Total Growth** shows the percentage change in Current Index
- **Today's Rate** contributes to tomorrow's Current Index
- **7-Day Average** is used to calculate the **30-Day Target**
- **Success Rate** provides a simpler view compared to weighted momentum calculations
- **Active Habits** provides context for the complexity of other metrics

## Weight System

Habits have different weights that affect daily rate calculations:
- **Small:** 0.05% (0.0005)
- **Low:** 0.10% (0.001)
- **Medium:** 0.25% (0.0025)
- **High:** 0.40% (0.004)

Good habits add their weight to the daily rate, bad habits subtract their weight.
