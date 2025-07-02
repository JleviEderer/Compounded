## Phase 0 — Schema prep & cleanup

### Key work
- **`client/src/types.ts`** (≤ 60 LoC) – add Goal interface
- **`client/src/hooks/useGoals.ts`** – CRUD for goals
- **`migration/goodOnly-v1.ts`** *(behind `GOALS_V1` flag)*  
  • converts all habits → default goal  
  • strips any `badHabit*` fields
- **Update existing files**
  - `client/src/types.ts` → remove `badWeight`, `isBad` from HabitPair
  - `client/src/hooks/useHabits.ts` → delete bad-habit branching
  - `client/src/utils/compound.ts` (or inline) → single green scale
  - Delete unused red-gradient CSS vars

### Files to touch (target)
Only those above; keep each edited file **≤ 300 LoC** after any splits.

### Guard-rails
- Unit tests for `useHabits` and the migration script  
- Feature flag `GOALS_V1` must default *off* until Phase 4  
- Heat-map visual diff: no red cells when flag is on

| Phase                         | Key work                                                                                                                                                                                   | Files touched (target)      | Guard-rails                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | --------------------------- |