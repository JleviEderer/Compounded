
# Switching Between Mock Data and User Data

This guide explains how to switch your Compounded habit tracker between **mock data** (for development) and **user data** (for production) modes.

## Overview

The app has two data modes:
- **Mock Data Mode**: Uses predefined test data, perfect for development and testing
- **User Data Mode**: Uses localStorage to persist user's actual habit data

## Current Configuration

Your app is currently set to **Mock Data Mode**:

```typescript
// client/src/services/dataSourceConfig.ts
export const dataSourceConfig: DataSourceConfig = {
  source: 'mock',           // Using mock data
  enableLocalStorage: false // Not saving to localStorage
};
```

## How to Switch to User Data Mode

### Step 1: Update Data Source Configuration

Change **both** settings in `client/src/services/dataSourceConfig.ts`:

```typescript
export const dataSourceConfig: DataSourceConfig = {
  source: 'user',          // ✅ Switch to user data
  enableLocalStorage: true // ✅ Enable localStorage persistence
};
```

**What each setting does:**
- `source: 'user'` → Tells `dataService` to read from localStorage instead of mock data
- `enableLocalStorage: true` → Allows the app to save changes to localStorage

### Step 2: Re-enable localStorage in useHabits Hook

Currently, `useHabits.ts` has localStorage code commented out for debugging. You need to uncomment it:

1. Remove the forced mock data initialization
2. Restore the original localStorage loading logic
3. Update the fallback behavior

## When to Use Each Mode

### Development Environment ✅
```typescript
// Recommended for development
source: 'mock',
enableLocalStorage: false
```

**Benefits:**
- Consistent, predictable test data
- Fast iteration without data corruption concerns
- All developers work with identical data
- Known test scenarios for debugging

### Production Environment ✅
```typescript
// Recommended for production
source: 'user', 
enableLocalStorage: true
```

**Benefits:**
- Real user experiences with persistent data
- Users can create their own habits
- Data survives browser sessions
- Personalized tracking

## Environment-Based Switching (Advanced)

For automatic switching based on environment:

```typescript
// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost';

export const dataSourceConfig: DataSourceConfig = {
  source: isProduction ? 'user' : 'mock',
  enableLocalStorage: isProduction
};
```

## Programmatic Switching

You can also switch modes at runtime using the built-in function:

```typescript
import { setDataSource } from '../services/dataSourceConfig';

// Switch to user data
setDataSource('user');

// Switch to mock data  
setDataSource('mock');
```

## Verification

After switching to user data mode, verify it's working:

1. **Check console logs**: Look for "USER DATA" messages instead of "MOCK DATA"
2. **Add a habit**: It should persist after page refresh
3. **Browser DevTools**: Check localStorage for `compounded-data` key

## Common Issues

### ❌ Only changing `enableLocalStorage`
Just changing `enableLocalStorage: false` to `true` **won't switch to user data**. You must change **both** settings.

### ❌ Commented localStorage code
If localStorage code is still commented out in `useHabits.ts`, the switch won't work fully.

### ❌ Browser cache
Clear browser cache/localStorage if switching between modes causes issues.

## Testing Compatibility

Your tests are designed to work with both data modes, so switching won't break your test suite. The tests verify data flow architecture rather than specific data content.

---

## Quick Reference

| Mode | Source | EnableLocalStorage | Use Case |
|------|--------|-------------------|----------|
| Development | `'mock'` | `false` | Testing, debugging |
| Production | `'user'` | `true` | Real user data |
| Hybrid | `'user'` | `false` | User data without persistence |
