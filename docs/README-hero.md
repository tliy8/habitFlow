# HabitFlow Landing Hero - Developer Guide

## Overview

This document covers the interactive landing hero implementation with calendar preview, animations, and A/B testing support.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
components/
├── landing/
│   ├── Hero.tsx           # Main hero container
│   ├── HeatmapPreview.tsx # Interactive calendar
│   └── QuickPanel.tsx     # Demo habit panel

docs/
├── hero-design-spec.md    # UI design specification
├── animation-specs.md     # Animation timing/easing
├── accessibility-checklist.md
└── analytics-events.md

cypress/
└── e2e/
    └── hero.cy.ts         # E2E tests
```

## Features

### Interactive Calendar Preview
- Hover dates to see tooltips
- Click dates to simulate habit completion
- Updates heatmap color in real-time

### A/B Testing Support
```jsx
<Hero
  headlineVariant="A"  // A, B, or C
  ctaVariant="A"       // A or B
/>
```

### Reduced Motion Support
Automatically detects `prefers-reduced-motion` and:
- Disables scale/translate animations
- Keeps simple opacity fades
- Shows static icons instead of Lottie

## Toggle Reduced Motion (Testing)

### macOS
System Preferences → Accessibility → Display → Reduce motion

### Windows
Settings → Ease of Access → Display → Show animations in Windows

### Chrome DevTools
1. Open DevTools (F12)
2. Ctrl+Shift+P → "Render"
3. Check "Emulate CSS prefers-reduced-motion"

## Running Tests

```bash
# E2E tests
npm run cypress:open

# Accessibility audit
npm run lighthouse

# Unit tests
npm test
```

## Analytics Events

| Event | When | Properties |
|-------|------|------------|
| hero_cta_click | CTA clicked | variant, type |
| preview_hover_date | Date hovered | date |
| preview_simulate_complete | Habit toggled | habitId |
| signup_start | Signup initiated | source |

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Desktop | >90 | TBD |
| Lighthouse Mobile | >60 | TBD |
| Hero bundle size | <80KB | TBD |
| Time to Interactive | <3s | TBD |

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_EXPERIMENT_VARIANT=A
```

## Common Issues

### Animations not smooth
- Check for layout thrashing in DevTools Performance tab
- Ensure using `transform` and `opacity` only
- Reduce stagger delays on low-end devices

### Modal focus issues
- Verify `focus-trap` is working
- Check z-index hierarchy
- Test with keyboard-only navigation

### Analytics not firing
- Check gtag is loaded in `_document.tsx`
- Verify consent management isn't blocking
- Check browser console for errors

## Contributing

1. Follow accessibility checklist for all changes
2. Test with keyboard and screen reader
3. Add Cypress tests for new interactions
4. Update animation specs for motion changes

---

Built with ❤️ by HabitFlow Team
