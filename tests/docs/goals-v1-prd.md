
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
| **0 — Schema prep & cleanup** | • `types/goal.ts` (≤ 60 LoC)<br>• `hooks/useGoals.ts` CRUD<br>• **Migration:** drop `badHabit*` fields + convert habits → default goal (`migration/goodOnly-v1.ts`) behind `GOALS_V1` flag | new files only              | Unit-test hook              |
| **1 — Goals page skeleton**   | • `pages/Goals.tsx` (≤ 250 LoC) with empty-state + list<br>• Add "Goals" icon to bottom nav                                                                                                | `Navigation.tsx` + new page | Flag ON only in dev         |
| **2 — Goals CRUD**            | • Dialog: add / rename / delete goal (`components/GoalDialog.tsx`)                                                                                                                         | new component               | File < 150 LoC              |
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
