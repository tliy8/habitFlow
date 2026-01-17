# Accessibility Checklist - Landing Hero

## WCAG AA Compliance

### 1. Color Contrast
- [x] Primary text (#111827) on white: **15.8:1** ✅
- [x] Secondary text (#4B5563) on white: **7.4:1** ✅
- [x] CTA button text (white) on violet-600: **7.2:1** ✅
- [x] Heatmap legend visible against all backgrounds ✅

### 2. Keyboard Navigation
- [x] All interactive elements focusable via Tab
- [x] Focus order logical (nav → headline → CTA → calendar → panel)
- [x] Visible focus rings (violet-500 outline)
- [x] Escape key closes modal
- [x] Enter/Space activates buttons
- [x] Calendar cells keyboard accessible (Tab + Enter)

### 3. Screen Reader Support
- [x] Headline uses `<h1>` semantic element
- [x] CTA buttons have `aria-label`
- [x] Calendar cells have `role="gridcell"` with `aria-label`
- [x] Tooltips have `role="tooltip"`
- [x] Modal has `role="dialog"` and `aria-modal="true"`
- [x] Modal title linked via `aria-labelledby`
- [x] Habit toggles have `aria-pressed` state

### 4. Motion & Animation
- [x] `prefers-reduced-motion` media query respected
- [x] All animations disable on reduced motion
- [x] Simple fades (≤200ms) remain for feedback
- [x] No auto-playing animations that can't be paused
- [x] No rapid flashing (seizure safety)

### 5. Touch & Mobile
- [x] Touch targets ≥44px (48px used)
- [x] Sufficient spacing between interactive elements
- [x] Mobile layout stacks content properly
- [x] No horizontal scroll on mobile

### 6. Content & Language
- [x] Page has `<html lang="en">`
- [x] Headings follow hierarchy (h1 → h2 → h3)
- [x] Link text descriptive (not "click here")
- [x] Error messages clear and actionable
- [x] Instructional text provided for interactive elements

---

## Testing Procedures

### Manual Tests

1. **Keyboard-only navigation**
   - Navigate entire hero using only Tab, Enter, Escape
   - Verify focus never gets trapped (except in modal)
   - Verify all actions accessible without mouse

2. **Screen reader test (VoiceOver/NVDA)**
   - Announce headline correctly
   - Announce CTA button purpose
   - Announce calendar date context
   - Announce habit toggle state

3. **Reduced motion test**
   - Enable "Reduce motion" in OS settings
   - Verify no transform/scale animations
   - Verify simple fades still work

4. **Zoom test**
   - Zoom to 200%
   - Verify no horizontal scroll
   - Verify all text readable
   - Verify buttons still tappable

### Automated Tests

```bash
# Run axe accessibility scanner
npm run test:a11y

# Run Lighthouse accessibility audit
lighthouse http://localhost:3000 --only-categories=accessibility
```

---

## Known Limitations

1. **Lottie animations** - Static fallback provided for screen readers
2. **Complex calendar** - ARIA grid pattern used for navigation
3. **Color-only indicators** - All colors paired with text/icons

---

## Remediation Log

| Issue | Severity | Status | Fix |
|-------|----------|--------|-----|
| Calendar cells missing aria-label | High | Fixed | Added descriptive labels |
| Modal focus not trapped | Medium | Fixed | Added focus trap |
| CTA missing accessible name | Medium | Fixed | Added aria-label |
| Animations ignore reduced motion | High | Fixed | Added useReducedMotion hook |
