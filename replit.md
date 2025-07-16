# Compounded - Habit Tracker

## Overview
A React 18 + TypeScript habit tracking application with Headspace × Robinhood styling, compound growth visualization, and comprehensive testing suite. The app implements habit pairing with a 4-tier weight system, daily check-in grid, and momentum calculations using PRD-specified decay formula.

## Recent Changes
- **2025-01-16**: Fixed momentum calculation math - balanced penalties with tiny habit weights
  - **Root cause**: Penalties (-5% slip, -1% baseline) were 50x larger than habit gains (+0.03%)
  - **New ultra-gentle parameters**: slip penalty -0.01%, baseline drift -0.1%, decay -0.005% daily
  - **Math now balanced**: 4 good habits = +0.12% vs slip penalty -0.01% (reasonable ratio)
  - Enhanced Y-axis scaling with 200% buffers for tiny ranges to show curves clearly
  - Fixed chart cursor showing future dates by changing X-axis domain to 'dataMax'
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