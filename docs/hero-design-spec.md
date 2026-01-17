# HabitFlow Landing Hero - Design Specification

## Phase 1: UI Design & Microcopy

---

## 1. Layout Structure

### Desktop (≥1024px)
```
┌────────────────────────────────────────────────────────┐
│ NAV: Logo ─────────────────────────── Login | Sign Up  │
├──────────────────────┬─────────────────────────────────┤
│                      │                                 │
│   INTERACTIVE        │   HEADLINE                      │
│   CALENDAR           │   "Build momentum.              │
│   HEATMAP            │    Keep the streak."            │
│   PREVIEW            │                                 │
│                      │   SUBHEADLINE                   │
│   [Hover/Click       │   "A calendar-first habit       │
│    to demo]          │    system that helps you win    │
│                      │    every day — without guilt."  │
│                      │                                 │
│                      │   ┌─────────────────────────┐   │
│                      │   │ Start my streak — Free  │   │
│                      │   └─────────────────────────┘   │
│                      │   [ See it in 30s → ]          │
│                      │                                 │
└──────────────────────┴─────────────────────────────────┘
```

### Mobile (<1024px)
```
┌──────────────────────────┐
│ HEADLINE                 │
│ "Build momentum.         │
│  Keep the streak."       │
│                          │
│ SUBHEADLINE              │
│ "A calendar-first..."    │
│                          │
│ ┌──────────────────────┐ │
│ │ Start my streak      │ │
│ └──────────────────────┘ │
│ [ See it in 30s → ]      │
│                          │
│ ┌──────────────────────┐ │
│ │  COMPACT CALENDAR    │ │
│ │  PREVIEW (scroll)    │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

---

## 2. Design Tokens

### Colors
```css
/* Primary - Purple Brand */
--color-primary-50: #faf5ff;
--color-primary-100: #f3e8ff;
--color-primary-200: #e9d5ff;
--color-primary-300: #d8b4fe;
--color-primary-400: #c084fc;
--color-primary-500: #a855f7;
--color-primary-600: #9333ea;
--color-primary-700: #7c3aed;
--color-primary-800: #6b21a8;
--color-primary-900: #581c87;

/* Semantic */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;

/* Neutral */
--color-gray-50: #f9fafb;
--color-gray-900: #111827;

/* Heatmap Intensity */
--heatmap-0: #f3f4f6;
--heatmap-25: #e9d5ff;
--heatmap-50: #c084fc;
--heatmap-75: #9333ea;
--heatmap-100: #10b981;
```

### Typography Scale
```css
/* Font: Inter (fallback: system-ui) */
--text-hero: 3.5rem / 1.1;    /* 56px - main headline */
--text-h1: 2.5rem / 1.2;      /* 40px - mobile headline */
--text-body-lg: 1.25rem / 1.6; /* 20px - subheadline */
--text-body: 1rem / 1.5;       /* 16px - body */
--text-sm: 0.875rem / 1.5;     /* 14px - labels */
--text-xs: 0.75rem / 1.4;      /* 12px - tooltips */
```

### Spacing System (8px base)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-24: 6rem;    /* 96px */
```

---

## 3. Microcopy Variants

### Headlines (A/B testing)
| Option | Copy | Emotion |
|--------|------|---------|
| **A** | "Build momentum. Keep the streak." | Achievement, consistency |
| **B** | "Win the day. Every day." | Victory, daily wins |
| **C** | "Your habits, visualized." | Clarity, data-driven |

### Subheadline
> "A calendar-first habit system that helps you win every day — without the guilt."

### CTA Options
| Option | Primary CTA | Secondary CTA |
|--------|-------------|---------------|
| **A** | "Start my streak — Free" | "See it in 30s" |
| **B** | "Try free for 14 days" | "Watch demo" |

### Interactive State Copy
| State | Copy |
|-------|------|
| Perfect day | "Perfect day — nice work 🎉" |
| Partial progress | "Great progress! Keep going 💪" |
| Missed day | "Slipped? Tomorrow is a clean page." |
| Hover tooltip | "Mon Jan 13 • 3/4 habits done" |

---

## 4. Icon Set (Lucide React)
- `Zap` - Logo/brand
- `Check` - Completed habit
- `Calendar` - Calendar icon
- `Flame` - Streak indicator
- `Play` - Demo CTA
- `ArrowRight` - Navigation

---

## 5. Animation Spec Sheet

| Element | Trigger | Animation | Duration | Easing | Delay |
|---------|---------|-----------|----------|--------|-------|
| Headline | Page load | Fade up | 600ms | ease-out | 0ms |
| Subheadline | Page load | Fade up | 600ms | ease-out | 100ms |
| CTA Primary | Page load | Fade up + scale | 500ms | spring | 200ms |
| CTA Secondary | Page load | Fade in | 400ms | ease | 300ms |
| Calendar grid | Page load | Stagger reveal | 40ms each | ease-out | 400ms |
| Heatmap cell hover | Hover | Scale 1.15 | 150ms | ease | 0ms |
| Tooltip | Hover | Fade up | 200ms | ease-out | 0ms |
| Checkbox (Lottie) | Click | Draw check | 400ms | ease-in-out | 0ms |
| Confetti (Lottie) | Perfect day | Burst | 1200ms | linear | 0ms |

### Reduced Motion Fallback
When `prefers-reduced-motion: reduce`:
- Disable all transforms (scale, translate)
- Keep opacity fades (200ms max)
- Disable Lottie animations (show static state)

---

## ✅ Phase 1 Complete

Next: Phase 2 - React Components Implementation
