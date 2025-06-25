## General Mobile Optimization Guidelines

- **File Size Rule**: When editing a file >300 lines, split into sub-components.

## Phase Overview

| Phase | Tasks to complete | Key tools / tactics |
|-------|------------------|---------------------|
| **1 — Audit** *(done)* | ✓ Audit performed and findings captured below ― no fixes in this phase. | — |
| **2 — Layout foundation** | - [x] **Container Padding** (global) – switch to mobile-first paddings<br>- [x] **KPI Strip** – stack vertically on < 640 px<br>- [x] **Momentum Chart controls** – pills wrap correctly on mobile<br>- [x] **Quick Stats (Insights)** – change 4-col grid to 2 × 2<br>- [x] **Progress Banner** – fix text overlap with responsive padding<br>- [x] **Mobile Header** – give theme toggle breathing room<br>- [x] **Sidebar** – add mobile breakpoint handling<br>- [x] **Page transitions** – tone down motion on low-width viewports | Tailwind responsive utilities |
| **3 — Interactive elements** | - [x] **Button sizing (global)** – 44px minimum touch targets<br>- [x] **Add Habit / Add Pair buttons** – bigger touch area, better placement<br>- [x] **Edit/Delete icons** – 44px tap zones with IconButton component<br>- [x] **Mobile Bottom Nav** – add labels, enlarge tap areas<br>- [x] **Weight Slider** – bigger touch handles, improved mobile UX<br>- [x] **Switch controls** – enlarge tap zones in Settings | Button redesign, `IconButton` shared component, shadcn/ui popover; `ontouchstart` detection |
| **4 — Spacing & grids** | - [ ] **HeatMapGrid** – larger cells, `gap-1`; remove hover-only cues<br>- [ ] **Calendar heat-map** – ensure day cells are tappable<br>- [ ] **HabitRow** – checkbox hit-box expansion<br>- [ ] **Chart legend overlap (MomentumChart)** – responsive margin<br>- [ ] **DayDetailModal** – account for mobile keyboard & viewport<br>- [ ] **Scroll behaviour** – add `overflow-y-auto max-h-[calc(100svh-4rem)]` where needed | Tailwind `gap-*`, CSS `svh` units |
| **5 — Testing & polish** | - [ ] Lighthouse mobile ≥ 90<br>- [ ] Tap-test all pages on iOS & Android (360 × 640)<br>- [ ] Verify every tap target ≥ 44 px<br>- [ ] Replace hover tooltips with touch-friendly popovers<br>- [ ] Add `.safe-pad` insets for iPhone notch<br>- [ ] Confirm text-overflow ellipsis on long habit names | Chrome Lighthouse, physical phones |

### Phase 3: Touch & Gesture Optimization ⚡
- [x] Enhanced Add Habit/Add Pair buttons with 44px+ touch targets
- [x] **WeightSlider mobile optimizations**
  - [x] Enhanced thumb size (40px) with haptic-style feedback
  - [x] Mobile-specific touch controls (+/- buttons)
  - [x] Improved keyboard navigation with larger steps
  - [x] Value tooltip display during interaction
  - [x] Body scroll prevention during drag
  - [x] Better focus indicators and accessibility