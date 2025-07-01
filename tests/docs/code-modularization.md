
# Code Modularization Analysis

## Overview
Analysis of files over 300 lines to identify candidates for modularization according to the mobile optimization guidelines.

## File Size Analysis Results

Based on the file-by-file analysis, here are the findings for files in the main source directories:

### Files Over 300 Lines (Candidates for Splitting)

Based on the analysis of actual source files (excluding node_modules):

1. **client/src/pages/Insights.tsx** - 835 lines ⚠️ **PRIORITY**
2. **client/src/components/ui/sidebar.tsx** - 771 lines ⚠️ **PRIORITY** 
3. **client/src/components/MomentumChart.tsx** - 412 lines ⚠️ **NEEDS SPLITTING**
4. **client/src/components/ui/chart.tsx** - 365 lines ⚠️ **NEEDS SPLITTING**

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

### Next Steps

1. Run the line count analysis command
2. Identify files exceeding 300 lines
3. Plan modularization strategy for each large file
4. Implement splits incrementally to maintain functionality

---

*Last updated: [Current Date]*
*Analysis command: `find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -E "(client/src|server|tests)" | grep -v node_modules | xargs wc -l | sort -nr`*
