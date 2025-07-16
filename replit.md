# Compounded - Habit Tracker

## Overview
A React 18 + TypeScript habit tracking application with Headspace × Robinhood styling, compound growth visualization, and comprehensive testing suite. The app implements habit pairing with a 4-tier weight system, daily check-in grid, and momentum calculations using PRD-specified decay formula.

## Recent Changes
- **2025-01-16**: **CRITICAL FIX** - Implemented timeframe-specific Current Index calculations
  - **Root cause**: Current Index was identical (1.29) across all timeframes - mathematically impossible
  - **Solution**: Created `calculateTimeframeMomentumIndex()` that starts from 1.0 at each timeframe's beginning
  - **Now correctly shows**:
    - 30D: Growth over last 30 days (starts from 1.0)
    - 3M: Growth over last 3 months (starts from 1.0)  
    - 1Y: Growth over last year (starts from 1.0)
    - All Time: Growth since habit creation (traditional calculation)
  - **Math validation**: +0.12% daily with -0.005% decay = ~54% annual growth
  - Fixed momentum penalty math: slip penalty -0.01%, baseline drift -0.1% (balanced vs +0.03% habits)
- **2025-01-16**: Successfully refactored momentum calculation system to follow momentumindex-v1-prd.md specifications
  - Implemented decay-based momentum formula: R_t = logged ? P_t : B and M_t = max(0, (1 + R_t) * β * M_{t-1})
  - Created momentum config file with configurable σ, β, B parameters
  - Removed duplicate getMomentumParams() calls throughout codebase

## Project Architecture

### Core Features
- **Habit Pairing System**: Bad→Good habit transformation with 4-tier weight system
- **Momentum Calculation**: PRD-compliant decay formula with penalty system
- **Visualization**: Gradient area charts with 30-day projections
- **Data Storage**: In-memory storage with localStorage persistence
- **Testing**: Comprehensive test suite with 18 passing momentum tests

### Technology Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Charts: Recharts
- Animations: Framer Motion
- Icons: Lucide React
- State Management: React Context + TanStack Query
- Testing: Vitest + React Testing Library

### Key Files
- `client/src/config/momentum.ts` - Momentum parameters (σ, β, B)
- `client/src/utils/compound.ts` - Core momentum calculation functions
- `client/src/hooks/useMomentum.ts` - React hook for momentum data
- `tests/compound.test.ts` - Comprehensive momentum tests

## User Preferences
- Follow PRD specifications exactly for momentum calculations
- Maintain Headspace × Robinhood aesthetic (teal→lilac gradient, coral accents)
- Keep tests aligned with implementation changes