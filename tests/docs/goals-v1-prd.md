# Goals v1 - Product Requirements Document

*Updated: July 2, 2025*

Here's an **updated mini-PRD block** you can paste over the earlier one.
Only two things changed:

1. A new **"Good-only" de-scoping row** in *Out-of-scope* to state that *all* "replace bad habit" mechanics and red/green math are being retired.
2. Phase 0 now runs a **data migration** that strips the obsolete `badHabit` fields while it adds the new Goal schema.

Everything else (phases, line-count guardrails, UX bullet) stays the same so Replit can keep moving without surprises.

---

## 📄 Product Requirements (v1 - Goals, Good-only)

| Section          | Requirement                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**    | Add a **Goals** page so users define goals, then assign existing *good habits* to those goals. Bad-habit replacement logic is removed.   |
| **In-scope**     | *Goals CRUD*, *Habit ↔ Goals linking UI*, **remove** "bad habit", data-model update, bottom-nav entry.                                   |
| **Success**      | – Goals page loads < 200 ms<br>– Add / edit / delete goal on mobile<br>– Habit can link to ≥ 1 goal with no regression elsewhere.        |

---

## 🛠️ Phased delivery plan

| Phase                         | Key work                                                                                                                                                                                   | Files touched (target)      | Guard-rails                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | --------------------------- |
| **0 — Schema prep & cleanup** | • `client/src/types.ts` (≤ 60 LoC) – add Goal interface<br>• `client/src/hooks/useGoals.ts` – CRUD for goals<br>• `client/src/contexts/GoalsContext.tsx` + `GoalsProvider.tsx` (behind `GOALS_V1` flag)<br>• `migration/goodOnly-v1.ts` (behind `GOALS_V1` flag) – converts all habits → default goal, strips any `badHabit*` fields<br>• Update existing files: `client/src/types.ts` → remove `badWeight`, `isBad` from HabitPair, add `goalIds?: string[]`; `client/src/hooks/useHabits.ts` → delete bad-habit branching, default `goalIds` to `[]` on load, write empty `goals: []` if none exists; `client/src/utils/compound.ts` → single green scale; Delete unused red-gradient CSS vars<br>• Keep each edited file ≤ 300 LoC after any splits<br><br>## Phase 0 – Engineering checklist<br><br>1. **Types**<br>   - `GoalPair { id: string; name: string; createdAt: Date }`<br>   - extend `HabitPair` → `goalIds?: string[]`<br><br>2. **Goals plumbing**<br>   - `useGoals()` hook + `GoalsContext`/`GoalsProvider` that simply returns an (initially empty) `goals` array and stub CRUD fns.<br><br>3. **Storage / dataService / export–import**<br>   - Persist `goals: GoalPair[]` alongside `habits`, `logs`, `settings`.<br>   - Write migration so that if `GOALS_V1` is turned **on** later, a default goal "General" is created and every existing habit gets `goalIds = ['<general-id>']`.<br><br>4. **Feature flag**<br>   - New code path guarded by `GOALS_V1` (default **false**).<br><br>5. **No UI changes yet** – pages, buttons, filters will be added in Phase 1.<br><br>## Example localStorage blob (after Phase 0, flag OFF)<br><br>```json<br>{<br>  "habits": [<br>    {<br>      "id": "1",<br>      "goodHabit": "Meditate",<br>      "createdAt": "2024-04-13T08:00:00.000Z",<br>      "goalIds": []               // new, but empty while flag OFF<br>    }<br>  ],<br>  "logs": [<br>    { "id": "1-2025-07-10", "habitId": "1", "date": "2025-07-10", "state": "good", "completed": true }<br>  ],<br>  "goals": [],                    // ← NEW ARRAY (empty for now)<br>  "settings": {<br>    "theme": "light",<br>    "nerdMode": false<br>  },<br>  "version": "1.1.0"<br>}<br>```<br><br>**Expected data shape after migration:**<br>```typescript<br>// Before (legacy - REMOVED)
// HabitPair: { id, goodHabit, badHabit, weight, isBad, badWeight }
// HabitLog: { state: 'good' | 'bad' | 'unlogged' }

// After (goals-ready - CURRENT)
HabitPair: { id, goodHabit, weight, goalIds?: string[] }
HabitLog: { state: 'good' | 'unlogged', completed: boolean }
Goal: { id, title, description?, targetDate?, createdAt }
```
**Migration logic:** If `GOALS_V1` flag on first load → create single default goal "General Health" and assign all existing habits to it via `goalIds: [defaultGoalId]`. | new files + existing updates | Unit tests for `useHabits` and migration script; Feature flag `GOALS_V1` must default off until Phase 4; Heat-map visual diff: no red cells when flag is on |
| **0.5 — Data Migration & Cleanup** | • run `migration/goodOnly-v1.ts` on first load after `GOALS_V1=true`<br>• drop 'bad' state from HabitLogState (keep 'good'/'unlogged')<br>• ensure `calculateDailyRate` counts `completed \|\| state==='good'`<br>• update copy: 'Completed' / 'Not logged'; remove red legend<br>• adjust heat-map diverging scale to grey➔green<br>• regression tests: import old JSON backup → green-only grids | migration script + UI updates | Flag-gated migration |
| **1 — Goals page skeleton**   | • `pages/Goals.tsx` (≤ 250 LoC) with empty-state + list<br>• Add "Goals" icon to bottom nav                                                                                                | `Navigation.tsx` + new page | Flag ON only in dev         |
| **2 — Goals CRUD**            | • Dialog: add / rename / delete goal (`components/GoalDialog.tsx`)<br>• Target date field in "Add Goal" modal (optional)<br>• Derive duration automatically: `const durationDays = differenceInDays(targetDate, today); const horizon = durationDays <= 90 ? 'Short-term' : durationDays <= 365 ? 'Mid-term' : 'Long-term';`<br>• Show subtle read-only chip next to each goal title: "Short-term › 12 Oct 2025"<br>• Filter/sort goals by horizon in list (short → mid → long) | new component               | File < 150 LoC              |
| **3 — Habit linking**         | • Re-use `GoalSelector` multiselect in habit modal                                                                                                                                         | `HabitModal.tsx`            | No weight logic change      |
| **4 — Flag removal & QA**     | • Delete `GOALS_V1` flag<br>• Tap-test iOS + Android<br>• Lighthouse ≥ 90                                                                                                                  | all                         | Ensure no bundle-size spike |

> **Rule:** If any file creeps past 300 lines while you code a phase, split it immediately.

---

### UX Notes

* **Navigation**: five-item bottom nav; "Goals" uses `LucideTarget`.
* **Empty state**: illustration + "Create your first goal".
* **Habit chips**: up to three coloured dots on each habit row; long-press shows full goal list.
* **Accessibility**: tap targets ≥ 44 px.

---

### How the user experiences it

1. **Tap "Goals"** → sees clean list or empty state.
2. **"+ New Goal"** → adds title, optional *why* & target date.
3. Edits a habit → selects one or more goals from a pop-over multiselect.
4. Old "Replace Bad Habit" UI and red squares disappear; heat-maps stay green-gradient only.

---

*You can drop this block directly into your Replit docs or issue—devs have everything they need, and no one will accidentally resurrect the "bad habit" logic.*