
# Code Modularization Analysis

## Overview
Analysis of files over 300 lines to identify candidates for modularization according to the mobile optimization guidelines.

## File Size Analysis Results

Based on the file-by-file analysis, here are the findings for files in the main source directories:

### Files Over 300 Lines (Candidates for Splitting)

**Analysis Command Output:**
```bash
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -E "(client/src|server|tests)" | grep -v node_modules | xargs wc -l | sort -nr
```

**Current Results:**
1. **client/src/pages/Insights.tsx** - 835 lines ⚠️ **PRIORITY**
2. **client/src/components/ui/sidebar.tsx** - 771 lines ⚠️ **PRIORITY** 
3. **client/src/components/MomentumChart.tsx** - 412 lines ⚠️ **NEEDS SPLITTING**
4. **client/src/components/ui/chart.tsx** - 365 lines ⚠️ **NEEDS SPLITTING**

> **CI Integration Note**: Line-count script should run in CI; any file >300 lines fails the build.

### Analysis Summary

- **4 files exceed the 300-line threshold**
- **Insights.tsx** is the largest at 835 lines - nearly 3x the recommended size
- **sidebar.tsx** is a UI component library file that could be split into individual components
- **MomentumChart.tsx** contains complex chart logic that could be modularized
- **chart.tsx** is a UI chart component library that could be split into individual chart components

### Modularization Guidelines

According to `tests/docs/MOBILE.md`:
> **File Size Rule**: When editing a file >300 lines, split into sub-components.

### Recommended Actions

For any files identified as over 300 lines:

1. **Split into sub-components** - Break large components into smaller, focused pieces
2. **Extract custom hooks** - Move complex state logic to separate hook files
3. **Create utility modules** - Extract pure functions to utility files
4. **Separate concerns** - Split UI logic from business logic

### File Structure Best Practices

- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use composition over large monolithic components
- Maintain clear separation between UI and business logic

### Naming Conventions

#### Component Split Naming
- **Main Component**: Keep original name (e.g., `Insights.tsx`)
- **Sub-components**: Use descriptive prefixes (e.g., `InsightsChart.tsx`, `InsightsMetrics.tsx`)
- **Hooks**: Use `use` prefix + context (e.g., `useInsightsData.ts`, `useChartFilters.ts`)
- **Utils**: Use descriptive function names (e.g., `insightsHelpers.ts`, `chartUtils.ts`)

#### File Organization
```
components/
  Insights/
    index.tsx          # Main component
    InsightsChart.tsx   # Chart sub-component
    InsightsMetrics.tsx # Metrics sub-component
    types.ts           # Local types
    utils.ts           # Helper functions
```

### Modularization Strategies

#### 1. Component Splitting Patterns
- **By Feature**: Group related functionality (chart, metrics, filters)
- **By Responsibility**: UI vs Logic vs Data (presentation vs container pattern)
- **By Reusability**: Extract common components for reuse

#### 2. Hook Extraction Guidelines
- **State Management**: Move complex state logic to custom hooks
- **Data Fetching**: Create hooks for API calls and data transformation
- **Side Effects**: Isolate useEffect logic into dedicated hooks

#### 3. Utility Function Organization
- **Pure Functions**: Extract calculations and transformations
- **Constants**: Move magic numbers and config to separate files
- **Type Definitions**: Create shared type files for complex interfaces

### Implementation Checklist

#### Branch Protocol
- [ ] **Each modularization goes in its own PR; no UI changes in that PR except renamed imports**
- [ ] Create feature branch with naming: `refactor/split-[component-name]`
- [ ] Keep PR focused on single file/component split
- [ ] Ensure all tests pass before and after split

#### Before Splitting
- [ ] Identify clear separation boundaries
- [ ] List all props and dependencies
- [ ] Document current functionality
- [ ] Ensure test coverage exists

#### During Splitting
- [ ] Create sub-components one at a time
- [ ] Maintain TypeScript strict typing
- [ ] Preserve existing prop interfaces
- [ ] Test each split incrementally

#### After Splitting
- [ ] Verify no functionality is lost
- [ ] Update imports and exports
- [ ] Run full test suite
- [ ] Check bundle size impact

### Code Quality Standards

#### Component Size Targets
- **Components**: 50-150 lines (excluding types/imports)
- **Hooks**: 30-100 lines
- **Utility files**: 20-200 lines
- **Type files**: No strict limit

#### Complexity Indicators (Split When You See)
- Multiple useEffect hooks with different concerns
- Large switch/case statements
- Deeply nested conditional rendering
- Mixed business logic and UI logic
- Functions longer than 20 lines

### Priority Matrix

| File | Lines | Priority | Complexity | Strategy | Owner | ETA |
|------|-------|----------|------------|----------|-------|-----|
| Insights.tsx | 835 | 🔴 Critical | High | Feature-based split | TBD | 2-3 days |
| sidebar.tsx | 771 | 🔴 Critical | Medium | Component extraction | TBD | 1-2 days |
| MomentumChart.tsx | 412 | 🟡 High | High | Logic/UI separation | TBD | 1 day |
| chart.tsx | 365 | 🟡 High | Medium | Component library split | TBD | 1 day |

> **Assignment Protocol**: Update Owner column when work begins to prevent duplicate effort and set team expectations.

### Next Steps

1. **Phase 1**: Start with Insights.tsx (highest priority)
   - Extract chart components
   - Create custom hooks for data logic
   - Split metrics display components

2. **Phase 2**: Tackle sidebar.tsx
   - Split into individual UI components
   - Extract navigation logic
   - Create reusable sidebar primitives

3. **Phase 3**: Optimize chart components
   - Separate chart types into individual files
   - Extract shared chart utilities
   - Create chart hook abstractions

4. **Phase 4**: Review and refine
   - Run analysis command again
   - Verify no new large files created
   - Document new architecture

### Success Metrics

- All files under 300 lines
- Improved test coverage
- Reduced component complexity
- Better code reusability
- Faster development velocity

---

*Last updated: [Current Date]*
*Analysis command: `find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -E "(client/src|server|tests)" | grep -v node_modules | xargs wc -l | sort -nr`*
