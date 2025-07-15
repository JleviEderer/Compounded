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
| **0 — Schema prep & cleanup** | • **Data Schema Transformation:**<br>  - *Before (legacy - REMOVED):* `HabitPair: { id, goodHabit, badHabit, weight, isBad, badWeight }` & `HabitLog: { state: 'good' \| 'bad' \| 'unlogged' }`<br>  - *After (goals-ready - CURRENT):* `HabitPair: { id, goodHabit, weight, goalIds?: string[] }` & `HabitLog: { state: 'good' \| 'unlogged', completed: boolean }` & `Goal: { id, title, description?, targetDate?, createdAt }`<br>• `client/src/types.ts` (≤ 60 LoC) – add Goal interface, remove `badWeight`/`isBad` from HabitPair, add `goalIds?: string[]`<br>• `client/src/hooks/useGoals.ts` – CRUD for goals<br>• `client/src/contexts/GoalsContext.tsx` + `GoalsProvider.tsx` (behind `GOALS_V1` flag)<br>• `migration/goodOnly-v1.ts` (behind `GOALS_V1` flag) – converts all habits → default goal, strips any `badHabit*` fields<br>• Update existing files: `client/src/hooks/useHabits.ts` → delete bad-habit branching, default `goalIds` to `[]` on load; `client/src/utils/compound.ts` → single green scale; Delete unused red-gradient CSS vars<br>• **Migration logic:** If `GOALS_V1` flag on first load → create single default goal "General Health" and assign all existing habits to it via `goalIds: [defaultGoalId]` | new files + existing updates | Unit tests for `useHabits` and migration script; Feature flag `GOALS_V1` must default off until Phase 4; Heat-map visual diff: no red cells when flag is on |
| **0.5 — Data Migration & Cleanup** | • run `migration/goodOnly-v1.ts` on first load after `GOALS_V1=true`<br>• drop 'bad' state from HabitLogState (keep 'good'/'unlogged')<br>• ensure `calculateDailyRate` counts `completed \|\| state==='good'`<br>• update copy: 'Completed' / 'Not logged'; remove red legend<br>• adjust heat-map diverging scale to grey➔green<br>• regression tests: import old JSON backup → green-only grids | migration script + UI updates | Flag-gated migration |
| **1 — Goals page skeleton**   | • `pages/Goals.tsx` (≤ 250 LoC) with empty-state + list<br>• Add "Goals" icon to bottom nav                                                                                                | `Navigation.tsx` + new page | Flag ON only in dev         |
| **2 — Goals CRUD**            | • Dialog: add / rename / delete goal (`components/GoalDialog.tsx`)<br>• Target date field in "Add Goal" modal (optional)<br>• Derive duration automatically: `const durationDays = differenceInDays(targetDate, today); const horizon = durationDays <= 90 ? 'Short-term' : durationDays <= 365 ? 'Mid-term' : 'Long-term';`<br>• Show subtle read-only chip next to each goal title: "Short-term › 12 Oct 2025"<br>• Filter/sort goals by horizon in list (short → mid → long)<br>• Each goal row supports expand/collapse UI (accordion)<br>• Expanded rows reveal a "Goal Card" with:<br>    – Description (optional user field)<br>    – Linked habits (via goalIds[])<br>    – Placeholder text if no details exist<br>• Visual structure:<br>    `<GoalRow>`<br>      `▶︎ Personal Growth                     Oct 12, 2025`<br>    `</GoalRow>`<br>    `<GoalCard expanded>`<br>      `Description:     Grow as a reader`<br>      `Success Rate:    78%`<br>      `Habits:          Read, Reflect, Write`<br>    `</GoalCard>` | new component               | File < 150 LoC              |
| **3 — Habit linking**         | • Re-use `GoalSelector` multiselect in habit modal                                                                                                                                         | `HabitModal.tsx`            | No weight logic change      |
| **4 — Flag removal & QA**     | • Delete `GOALS_V1` flag<br>• Tap-test iOS + Android<br>• Lighthouse ≥ 90                                                                                                                  | all                         | Ensure no bundle-size spike |
| **5 — Habit Frequency**       | **A. Frequency Inputs (UI & Data model)**<br>• Add `targetCount` (number) and `targetUnit` (`week \| month \| year`) to `HabitPair`.<br>• Migration: existing habits default to 7 × per week.<br>• Habit modal: new "Frequency" controls<br>    ▸ numeric input (#)  ▸ "× per"  ▸ unit dropdown.<br>• Show frequency read-only on each Habit row and GoalCard.<br><br>**B. Metric Refactor (Success-Rate v2)**<br>• Helper `expectedForRange(habit, start, end)` returns expected logs using targetCount/unit.<br>• Habit-level success rate = completed / expected.<br>• Goal-level = aggregated from linked habits.<br>• Insights dashboards use the same helper for Week / Month / Quarter / All-Time.<br>• Unit tests for edge ranges & partial periods. | types.ts + habit modal + insights | Migration script + comprehensive tests |
| **6 — Goal-level Insight polish** | **A. GoalCard expansions**<br>• Add "habit breakdown" section under the headline success-rate.<br>• Show each linked habit's own % for the *same* window.<br>• Style: two-column list **or** mini progress bars, max 5 visible then "+ N more".<br>• Add collapsible **Why?** pane (`<details>` for keyboard/SR).<br>• Contents: expected logs, completed logs, window length.<br>• Use `DEFAULT_SUCCESS_WINDOW_DAYS` **and** new time-window enum as single source of truth.<br><br>**B. Timeline picker** (weekly/quarterly/yearly/all-time)<br>• Constant map in `utils/timeWindows.ts`:<br>    ```ts<br>    export const TIME_WINDOWS = {<br>      '30d': 30,          // default<br>      'quarter': 90,      // or true quarter logic<br>      'year': 365,<br>      'all': -1           // sentinel = since first log<br>    } as const;<br>    export type TimeWindowKey = keyof typeof TIME_WINDOWS;<br>    ```<br>• UI: small SegmentedControl / Select right-aligned in GoalCard header.<br>• Helper `getWindowRange(key, logs[])` returns `{ start, end }`.<br>• GoalCard state `timeWindow` (default `'30d'`).<br>• Re-use `calculateAggregatedSuccessRate` with that range.<br>• Header becomes `Success Rate (last ${humanLabel(timeWindow)})`.<br><br>**C. Helper updates**<br>• Re-export `calculateHabitSuccessRate` for GoalCard.<br>• Memoise `habitId → completedLogs` map per GoalCard (perf).<br>• Each habit row in breakdown: tooltip + `aria-label` from `getFrequencyDisplayString`.<br>• Heat-map cells already have `aria-label`; keep consistent.<br>• Unit tests for `getWindowRange` and weighted vs individual rates for each window.<br>• Snapshot: expanded GoalCard with three habits, timeline picker set to quarter. | GoalCard + timeWindows utils | Unit tests + snapshot tests |
| **6.1 — Success-rate colour bands (spec only)** | • Constants: `SUCCESS_RATE_THRESHOLDS = { green: 0.75, yellow: 0.50 }` & `rateToColour(ratePct)`<br>• UI integration (future work): HabitRow tint % text, GoalCard headline ring + % text, Heat-map tooltip labels<br>• Helper fns `colourClass()` & `labelForColour()` will live next to constants<br>• Copy/a11y: tooltip copy for each band, "Why?" pane legend<br>• Tests: unit-test `rateToColour`, snapshot update for HabitRow & GoalCard<br>• No schema changes, no migrations—implementation deferred | documentation only | Documentation update only |

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

## 🚀 Future Roadmap

### Future Feature Idea – Smarter Success Rate with Target Frequency

In Goals v1, the success rate metric is postponed due to potential UX complexity around expected habit frequency.

🧮 **Challenge:**
Not all habits are meant to be done daily — users may want to track goals like:

- "Meditate 3× per week"
- "Go to the gym Mon/Wed/Fri"  
- "Journal every weekday"

A naive daily success rate unfairly penalizes users for habits they never intended to do daily.

✅ **Proposed Solution: Define Target Frequency per Habit**
Allow users to specify an expected frequency, such as:

- 3 times per week
- Every weekday
- Custom days: Mon / Wed / Fri

Then compute:

```ts
successRate = (completedLogs / expectedLogs) * 100
```

**Pros:**
✅ Feels fair and personalized

✅ Aligns with real-world habit planning

✅ Unlocks smarter insights (e.g. consistency vs. intent)

**Cons:**
❗ Adds complexity to habit setup UI

❗ Requires reworking log analysis and reporting

**Verdict:**
Strong candidate for post-Goals v1 release. Consider including in a future "Habit Frequency Settings" feature that unlocks smarter analytics across goals.

---

*You can drop this block directly into your Replit docs or issue—devs have everything they need, and no one will accidentally resurrect the "bad habit" logic.*

---

## Phase 6.1 — Success-rate colour bands (spec only)

**Constants**

```ts
export const SUCCESS_RATE_THRESHOLDS = { green: 0.75, yellow: 0.50 };
export type SuccessColour = 'green' | 'yellow' | 'red';
export function rateToColour(ratePct: number): SuccessColour
```

**UI integration (future work)**

HabitRow: tint % text via colourClass(rateToColour(x))

GoalCard: headline ring + % text

Heat-map: tooltip shows label ("On track / Needs focus / Stuck")

Helper fns colourClass() & labelForColour() will live next to the constants.

**Copy / a11y**

Tooltip copy for each band

"Why?" pane legend: Green ≥ 75 % · Yellow 50–74 % · Red < 50 %

**Tests**

Unit-test rateToColour (80 → green, 74 → yellow, 49 → red)

Snapshot update for one HabitRow & one GoalCard

No schema changes, no migrations—implementation deferred.