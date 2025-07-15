# Habit Tracker

A modern habit tracking application built with React, TypeScript, and Vite.

## Features

- Track daily habits with customizable weights
- Visualize momentum and progress over time
- Goal-based habit organization
- Momentum Index v2 with decay model
- Responsive design for mobile and desktop

## Environment Configuration

### Momentum Index v2 (Decay Model)

The app supports two momentum calculation models:

**v1 (Original):** Always-growing index that compounds positively
**v2 (Decay Model):** Realistic momentum with decay, slip penalties, and baseline drift

#### Environment Variables:

```bash
# Enable/disable momentum v2 decay model
VITE_MOMENTUM_V2=true          # false = use v1 (default)

# Select parameter preset for v2 model
VITE_MOMENTUM_PRESET=default   # lenient|default|hard
```

#### Parameter Presets:

| Preset  | σ (slip) | B (baseline) | β (decay) | Description |
|---------|----------|--------------|-----------|-------------|
| lenient | -0.20    | -0.40        | 0.998     | Forgiving penalties |
| default | -0.25    | -0.50        | 0.995     | Balanced approach |
| hard    | -0.35    | -0.70        | 0.992     | Strict accountability |

#### Formulas (v2):

```
Daily Return: R_t = logged ? (S_t + (σ × misses)) : B
Momentum Step: M_t = max(0, min(M_{t-1} × 1.5, (1 + R_t) × β × M_{t-1}))
```

Where:
- `S_t` = sum of completed habit weights
- `σ` = slip penalty (negative)
- `B` = baseline drift when no logs
- `β` = daily decay factor

# Compounded - Habit Tracker

**Tagline:** *Tiny gains, massive growth*

A modern habit tracking web application that visualizes personal growth through compound momentum. Track bad-to-good habit swaps and watch your "Momentum Index" snowball over time with beautiful gradient charts.

## 🎯 Overview

Compounded reimagines habit tracking by focusing on **compound growth** rather than streaks. Instead of resetting progress when you miss a day, it shows how small daily choices accumulate into significant personal transformation through mathematical compounding.

### Key Features

- **Habit Pairing**: Create bad → good habit pairs with weighted impact
- **Momentum Index**: Compound growth visualization with gradient charts
- **Multi-View Analytics**: Day, Week, Month, Quarter, and All-Time insights
- **Heat Maps**: GitHub-style contribution grids for habit completion
- **Mobile-First**: Responsive design optimized for all devices
- **No Account Required**: All data stored locally in your browser
- **Export/Import**: Full data backup and restore functionality

## 🚀 Live Demo

The app comes pre-loaded with 4 sample habit pairs and 90+ days of mock data so you can immediately see the compound growth visualization in action.

## 🧮 How Compounding Works

```typescript
A_today = A_yesterday × (1 + Σ weights_checked_today)
```

- **4 Weight Tiers**: Micro (+0.010%), Small (+0.020%), Medium (+0.030%), Large (+0.050%), Keystone (+0.100%)
- **Daily Calculation**: Your momentum multiplies based on completed habits
- **30-Day Projection**: Shows future growth trajectory based on recent performance
- **No Negative Spiral**: Momentum index never goes below 0

## 🎨 Design Philosophy

**Aesthetic**: Headspace meets Robinhood
- **Gradient Background**: Teal (#3ABAB4) → Lilac (#B4A7FF)
- **Accent Color**: Coral (#FF8C7A)
- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth, spring-based transitions
- **Theme Support**: Light and dark mode

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Lucide React** for consistent iconography

### Data Layer
- **LocalStorage** for persistence (no backend required)
- **Mock Data** for instant demo experience
- **Export/Import** for data portability
- **Type-safe** data models with full TypeScript coverage

### Architecture Patterns
- **Custom Hooks** for state management (`useHabits`, `useMomentum`)
- **Service Layer** for data abstraction (`dataService`)
- **Component Library** with reusable UI components
- **Responsive Design** with mobile-first approach

## 📁 Project Structure

```
compounded/
├── client/src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI library (buttons, modals, etc.)
│   │   ├── HeatMapGrid.tsx # GitHub-style contribution grids
│   │   ├── MomentumChart.tsx # Main compound growth visualization
│   │   └── DayDetailModal.tsx # Habit logging interface
│   ├── pages/              # Main application views
│   │   ├── Home.tsx        # Dashboard with momentum chart
│   │   ├── Habits.tsx      # Habit management interface
│   │   ├── Insights.tsx    # Multi-view analytics
│   │   └── Settings.tsx    # Configuration and data management
│   ├── hooks/              # Custom React hooks
│   │   ├── useHabits.ts    # Main state management
│   │   ├── useMomentum.ts  # Compound calculations
│   │   └── useInsights*.ts # Analytics data processing
│   ├── services/           # Data layer
│   │   ├── dataService.ts  # Data access abstraction
│   │   └── dataSourceConfig.ts # Mock vs user data switching
│   ├── utils/              # Utility functions
│   │   ├── compound.ts     # Mathematical compound calculations
│   │   └── date.ts         # Date manipulation helpers
│   └── types.ts            # TypeScript type definitions
├── tests/                  # Test suite
│   ├── compound.test.ts    # Mathematical accuracy tests
│   ├── data-flow-integration.test.ts # End-to-end data flow
│   └── docs/               # Technical documentation
└── server/                 # Express.js server (for deployment)
```

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install
```

### Key Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run test suite
npm run test:data-flow # Test core data flow integration
npm run check        # TypeScript type checking
```

## 🎯 Success Metrics

- **Consistency Goal**: ≥40% of users log ≥3 habit pairs after 30 days
- **Habit Reduction**: ≥25% drop in negative daily rate after 60 days  
- **User Satisfaction**: Net Promoter Score ≥40

## 📈 Future Roadmap

- **Cloud Sync**: Optional account-based data synchronization
- **Social Features**: Share progress with friends and family
- **Advanced Analytics**: Correlation analysis between habits
- **Habit Suggestions**: AI-powered habit recommendation engine
- **Integration**: Connect with fitness trackers and other apps

## 🤝 Contributing

This is a personal habit tracking application, but suggestions and feedback are welcome! The codebase is designed to be readable and modular for easy extension.

## 📄 License

MIT License - Feel free to use this code for your own habit tracking needs.

---

**Built with ❤️ on Replit** | *Compounding your way to a better you, one habit at a time.*

# Compounded

A habit-tracking app that demonstrates the power of compound growth through consistent daily actions.

## Features

- **Momentum Index**: Track your compound growth over time
- **Habit Tracking**: Log daily habits with weighted importance
- **Visual Analytics**: See your progress through charts and heatmaps
- **Goal Setting**: Organize habits into meaningful goals

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Momentum Formula

The app uses a compound growth model where your daily habit completion rate determines your momentum:

```
Daily Rate = Σ(habit_weight × completion_status)
Momentum = Previous_Momentum × (1 + Daily_Rate)
```

Each habit has a weight (Small: 0.0003, Medium: 0.001, Large: 0.003) that contributes to your daily rate.

**Zero-trap prevention**: If momentum hits 0 but you have positive daily returns, it restarts from MIN_MOMENTUM (0.001 by default) to prevent staying at zero forever.