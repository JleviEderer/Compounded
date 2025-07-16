
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

## 📊 Momentum Formula

The Momentum Index uses a decay model that rewards consistency and penalizes missed days:

### Daily Return (R_t)
```
S_t = Σ (w_i * d_i)          // completed weight sum
misses = Σ (w_i * (1−d_i))   // missed weight sum
P_t = S_t − σ * misses       // penalized return
R_t = logged ? P_t : B       // baseline drift if nothing logged
```

### Momentum Index (M_t)
```
M_t = max(0, (1 + R_t) * β * M_{t-1})
```

### Default Parameters
- **σ** (slip penalty) = -0.25
- **B** (baseline drift) = -0.50
- **β** (decay factor) = 0.995

This formula ensures that consistent effort compounds positively (like 1.001^365 ≈ 1.440194), while missed days create visible dips that motivate recovery.

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

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Key Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run test suite
npm run test:data-flow # Test core data flow integration
npm run check        # TypeScript type checking
```

## 📊 Data Model

### Core Types
```typescript
interface HabitPair {
  id: string;
  goodHabit: string;
  weight: HabitWeight;
  createdAt: Date;
}

interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  state: 'good' | 'unlogged';
}

enum HabitWeight {
  MICRO = 0.0001,    // +0.010%
  SMALL = 0.0002,    // +0.020%  
  MEDIUM = 0.0003,   // +0.030%
  LARGE = 0.0005,    // +0.050%
  KEYSTONE = 0.001   // +0.100%
}
```

## 🎮 User Experience

### Onboarding Flow
1. **Landing** → See compound growth demo
2. **Create First Pair** → Bad habit → Good habit → Set weight
3. **Interface Tour** → Quick feature highlights
4. **Dashboard** → Start tracking with Momentum Index

### Daily Workflow
1. **Morning Check-in** → Review habits for today
2. **Log Completion** → Tap checkmarks for completed habits
3. **View Progress** → See momentum chart update in real-time
4. **Weekly Review** → Check insights for patterns and trends

## 📱 Mobile Optimization

- **Touch-Friendly**: All interactive elements ≥44px tap targets
- **Responsive Grids**: Adaptive layouts for all screen sizes
- **Gesture Support**: Long-press for mobile context menus
- **Viewport Units**: Uses `svh` units for mobile browser compatibility
- **Keyboard Handling**: Mobile keyboard-aware modal positioning

## 🧪 Testing

- **Unit Tests**: Mathematical compound calculations
- **Integration Tests**: End-to-end data flow validation
- **Component Tests**: UI component rendering and interaction
- **Data Flow Tests**: Mock data → calculations → UI display pipeline

## 🔒 Privacy

- **Local-Only**: All data stays in your browser
- **No Tracking**: No analytics or user tracking
- **Export Control**: Full data export/import for user control
- **No Account**: No sign-up or personal information required

## 🚀 Deployment

The application is optimized for Replit deployment:
- **Static Frontend**: Served via Express.js
- **Environment Detection**: Auto-switches between development and production
- **Asset Optimization**: Vite handles bundling and optimization
- **Port Configuration**: Uses port 5000 for Replit compatibility

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
