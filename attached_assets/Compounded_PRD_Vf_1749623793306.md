# Product Requirements Document (PRD)

## 1. Project Overview

**App Name:** **Compounded**\
**Platform:** Responsive web app (desktop + mobile browsers)\
**Elevator Pitch:** Track bad‑to‑good habit swaps and watch your "Momentum Index" snowball through compound growth visualised with gradient charts.

---

## 2. Problem Statement

Streak‑based habit apps reset progress and shame lapses. Users want a kinder, insight‑driven way to *feel* how tiny daily choices add up — without installing a native app or signing up for yet another service.

---

## 3. Goals & Success Metrics

| Goal                   | KPI                                                      |
| ---------------------- | -------------------------------------------------------- |
| Drive consistency      | ≥ 40 % of new users log ≥ 3 pairs after 30 days          |
| Reduce negative habits | ≥ 25 % drop in average negative daily rate after 60 days |
| Delight                | Net Promoter Score ≥ 40                                  |

---

## 4. Target Users & Personas

1. **Quant‑Self Alex** – loves data, uses GitHub contribution graphs as life dashboard.
2. **Busy Professional Jordan** – wants quick web access, no installs.
3. **Wellness Sam** – numbers‑averse, needs encouraging visuals.

---

## 5. Feature Set (MVP)

- **Habit Pairing** – create *bad → good* pairs; weight each with 4‑tier slider (*Small–Transformative*).
- **Daily Check‑In Grid** – default "today" column; expandable 7‑day view per pair.
- **Momentum Index Chart** – gradient area chart of compound value; 30‑day projection line based on trailing‑7‑day average.
- **Insights Toggle** – Day | Week heat grid | Month calendar heat‑map.
- **Themes** – Teal→Lilac gradient aesthetic with Coral accents; dark/light toggle.
- **Mock Data** – seed ≥ 4 habit pairs & 90 days of logs for instant demo.
- **Weekly Digest** – auto‑generated push/email summary every Sunday evening.

---

## 6. Compounding Logic

```
A_today = A_yesterday × (1 + Σ weights_checked_today)
```

- 4 weight tiers map to +/‑% values (0.05 %, 0.10 %, 0.25 %, 0.40 %).
- 30‑day projection uses trailing‑7‑day average rate.
- Clamp Momentum Index ≥ 0.

---

## 7. UX Flow

1. **Onboarding** – mini compounding lesson → create first pair → enable reminders (browser notifications).
2. **Home** – Momentum chart, today grid (collapsed rows), Quick Progress banner after first check‑in.
3. **Insights** – Day | Week | Month toggle.
4. **Habits** – add/edit/delete pairs, weight slider.
5. **Settings** – theme toggle, nerd mode copy switch, export JSON.

---

## 8. UI / Style Guide (Headspace × Robinhood)

- **Gradient background**: top `#3ABAB4` → bottom `#B4A7FF`.
- **Cards**: white\@98 %, radius 24 px, shadow xl (Tailwind).
- **Accent**: Coral `#FF8C7A`.
- **Typography**: Inter, 700/28 px headings, 400/16 px body.
- **Animations**: Framer Motion spring for card expand & chart line update.
- **Icons**: Lucide React (Home, BarChart2, Repeat, Settings).

---

## 9. Technical Stack (Replit‑Optimised)

| Layer       | Choice                             | Reason                                                   |
| ----------- | ---------------------------------- | -------------------------------------------------------- |
| Framework   | **React 18 + TypeScript + Vite**   | Fast dev‑server, type safety, Replit build‑time friendly |
| Charts      | **Recharts**                       | Gradient fills, responsive, TS typings                   |
| Styling     | **Tailwind CSS**                   | Utility classes, dark‑mode variants                      |
| Animation   | **Framer Motion**                  | Declarative springs │                                    |
| Icons       | **Lucide React**                   | Lightweight, consistent style                            |
| Testing     | **Vitest + Testing-Library/react** | Unit & component testing in Vite                         |
| Persistence | **Window\.localStorage**           | No backend needed for MVP                                |

---

## 10. Deliverables

```
compounded-web/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ src/
│  ├─ main.tsx          # React/Vite entry
│  ├─ App.tsx           # Layout + Router
│  ├─ components/
│  │   ├─ MomentumChart.tsx
│  │   ├─ HabitRow.tsx
│  │   └─ WeightSlider.tsx
│  ├─ pages/
│  │   ├─ Home.tsx
│  │   ├─ Insights.tsx
│  │   ├─ Habits.tsx
│  │   └─ Settings.tsx
│  ├─ hooks/
│  │   ├─ useHabits.ts
│  │   └─ useMomentum.ts
│  ├─ data/
│  │   └─ mockData.ts   # 4 pairs, 90 days
│  ├─ utils/
│  │   └─ compound.ts
│  └─ types.ts
├─ tests/
│  ├─ compound.test.ts
│  └─ rendering.test.ts
└─ README.md
```

- **npm **`` runs vitest with compound math unit test (`1.001^365 ≈ 1.440194`).
- CI via GitHub Workflow: install, lint, test.

---

*Last updated: 2025‑06‑11*

