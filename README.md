# AliveWeb — Observer Pattern
### Adaptive Behavioral Portfolio · Checkpoint 3 Complete

---

## What It Does

AliveWeb is a portfolio platform that **watches how you browse** and adapts in real-time. There is no login, no cookie consent, no profile form. The system infers your attention style from your interaction patterns and silently reconfigures the experience around you.

Every click, hover, and dwell time is a signal. The signals accumulate into a behavioral profile across four dimensions:

| Dimension | What It Tracks |
|---|---|
| **Visual** | Hover on imagery, click on visual projects, time on mood areas |
| **Technical** | Tab navigation to Technical/Process, hover on stack tags, use of Compare mode |
| **Narrative** | Time reading copy, scroll depth, narrative tab engagement |
| **Exploratory** | Non-linear navigation, keyboard shortcuts, Vault access |

The dominant dimension reshapes: project ordering, copy framing, nav weight, layout density, and hidden content access.

---

## Running Locally

```bash
npm install
npm run dev   # → http://localhost:5173
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Shift + T` | Open Session Trace panel |
| `Ctrl/Cmd + K` | Open Command Palette |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing — atmospheric entry with adaptive text on return visits |
| `/archive` | Project grid — adaptive ordering, copy variants, recommendations |
| `/project/:slug` | Project detail — tabbed content, metadata sidebar |
| `/trace` | Session Trace — slide-over panel with live score bars and signal log |
| `/compare` | Compare Mode — side-by-side technical analysis of two projects |
| `/vault` | The Vault — hidden; unlocks at Exploratory score > 60 |
| `/guided` | Guided View — stubbed for future development |

---

## Architecture

```
User Interactions
      ↓
BehaviorTracker       (emits typed Signals)
      ↓
ProfileScorer         (4 weighted dimensions → sessionStorage)
      ↓
AdaptationEngine      (Profile → AdaptationState)
      ↓
ObserverContext       (React Context, 2.5s throttled updates)
      ↓
All Components        (react, re-sort, crossfade, unlock)
```

---

## Stack

- **Vite + React + TypeScript** — fully static, no backend
- **Tailwind CSS v4** — CSS-first design tokens
- **Motion (framer-motion)** — layout animations, AnimatePresence crossfades
- **React Router v7** — nested routing
- **Lucide React** — icons
- **Space Grotesk + JetBrains Mono** — typography system

---

## Deploy to Vercel

```bash
npm run build   # outputs to /dist
```

Push to GitHub and connect the repo to Vercel. No environment variables required. Build command: `npm run build`. Output directory: `dist`.

---

## The Hidden Layer

The Vault (`/vault`) is unlocked automatically when `exploratory > 60`. The nav link fades in. The FinalReveal modal triggers after 3+ minutes **or** 3+ projects visited when profile confidence exceeds 25%.

*"This archive does not know who you are. Only how you look."*
