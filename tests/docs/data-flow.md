
# Data Flow Documentation

## Overview

The Compounded habit tracker application follows a clear data flow pattern from raw JSON data through processing layers to the UI components. Understanding this flow is crucial for debugging, maintenance, and feature development.

## Data Flow Diagram

```
myMockData.json → mockData.ts → dataService.ts → useHabits.ts → UI Components
```

## Detailed File Descriptions

### 1. `client/src/data/myMockData.json`
**Role**: Raw data source  
**Purpose**: Contains the complete mock dataset with habits and logs spanning from June 2024 to June 2025.

**What it does**:
- Stores 4 habit definitions with their IDs, names, weights, and creation dates
- Contains 1113+ habit logs covering approximately one year of data
- Provides realistic data patterns with mixed good/bad habit entries
- Serves as the single source of truth for all application data in development

**Structure**:
```json
{
  "habits": [
    {
      "id": "1",
      "goodHabit": "Read articles", 
      "weight": 0.001,
      "createdAt": "2024-06-01T00:00:00.000Z"
    }
  ],
  "logs": [
    {
      "id": "1-2024-06-01",
      "habitId": "1", 
      "date": "2024-06-01",
      "state": "good"
    }
  ]
}
```

### 2. `client/src/data/mockData.ts`
**Role**: Data processor and type converter  
**Purpose**: Transforms raw JSON into TypeScript objects with proper types and validation.

**What it does**:
- Imports raw JSON data using Vite's JSON import feature
- Maps JSON weight values to proper HabitWeight enum values
- Converts date strings to Date objects for habits
- Exports typed arrays (`mockHabits` and `mockLogs`)
- Provides comprehensive debugging logs for data verification
- Handles weight mapping inconsistencies between JSON and enum

**Key transformations**:
- `0.00025` → `HabitWeight.SMALL` (0.0005)
- `0.001` → `HabitWeight.LOW` (0.001)
- `0.0025` → `HabitWeight.MEDIUM` (0.0025)
- Date strings → `Date` objects

### 3. `client/src/services/dataService.ts`
**Role**: Data access layer  
**Purpose**: Provides a centralized API for accessing habit and log data with debugging capabilities.

**What it does**:
- Imports processed data from `mockData.ts`
- Exposes methods for data retrieval: `getHabits()`, `getLogs()`, `getLogsForDate()`, `getLogsForHabit()`
- Implements debug logging that can be toggled on/off
- Provides helper methods for finding closest dates when exact matches aren't found
- Acts as an abstraction layer that could easily be swapped for API calls in production

**Methods**:
```typescript
- getHabits(): HabitPair[]
- getLogs(): HabitLog[]
- getLogsForDate(date: string): HabitLog[]
- getLogsForHabit(habitId: string): HabitLog[]
- setDebugMode(enabled: boolean): void
```

### 4. `client/src/hooks/useHabits.ts`
**Role**: State management and business logic  
**Purpose**: Manages application state, provides CRUD operations, and handles data persistence.

**What it does**:
- Initializes application state with data from `dataService`
- Provides methods for habit management: add, update, delete
- Handles habit logging with state management
- Manages settings (theme, nerd mode)
- Implements localStorage persistence (currently disabled for debugging)
- Provides data export/import functionality
- Serves as the primary interface between UI components and data

**State structure**:
```typescript
{
  habits: HabitPair[],
  logs: HabitLog[],
  settings: {
    theme: 'light' | 'dark',
    nerdMode: boolean
  }
}
```

### 5. UI Components
**Role**: Data presentation and user interaction  
**Purpose**: Display data and capture user input through various interfaces.

**What they do**:
- **Home.tsx**: Displays momentum index, quick stats, and recent activity
- **Habits.tsx**: Shows habit management interface with logging capabilities
- **Insights.tsx**: Presents analytics views (day/week/month) with charts
- **Settings.tsx**: Provides configuration options and data management
- **HabitRow.tsx**: Individual habit display with state buttons
- **MomentumChart.tsx**: Visualizes momentum trends over time

## Data Flow Process

1. **Application Start**: `useHabits` hook initializes by calling `dataService.getHabits()` and `dataService.getLogs()`

2. **Data Service Access**: `dataService` returns the processed arrays from `mockData.ts`

3. **Type Conversion**: `mockData.ts` imports raw JSON and converts it to proper TypeScript types

4. **State Management**: `useHabits` maintains the current state and provides methods for updates

5. **UI Rendering**: Components consume data through the `useHabits` hook and display it to users

6. **User Interactions**: UI components call `useHabits` methods to update state

7. **Persistence**: Changes are saved to localStorage (when enabled)

## Debugging Features

The data flow includes extensive debugging capabilities:
- Raw data verification logs in `mockData.ts`
- Data service access logging in `dataService.ts`
- State change tracking in `useHabits.ts`
- Console logs for momentum calculations in compound utilities

## Future Considerations

This architecture is designed for easy transition to a real backend:
- `dataService.ts` can be updated to make API calls instead of importing mock data
- `useHabits.ts` already supports async operations for import/export
- The component layer remains unchanged when switching data sources
- Mock data structure matches the expected production API format
