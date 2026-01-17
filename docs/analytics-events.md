# Analytics Events - Landing Hero

## Event Catalog

### 1. hero_cta_click
Fired when user clicks either CTA button.

```javascript
trackEvent("hero_cta_click", {
  variant: "A" | "B",    // A/B test variant
  type: "primary" | "secondary",
  timestamp: Date.now()
});
```

### 2. signup_start
Fired when user initiates signup flow (after primary CTA).

```javascript
trackEvent("signup_start", {
  source: "hero_cta",
  variant: "A" | "B"
});
```

### 3. preview_hover_date
Fired when user hovers over a calendar date (debounced 100ms).

```javascript
trackEvent("preview_hover_date", {
  date: "2026-01-15",
  fromMobile: boolean
});
```

### 4. preview_simulate_complete
Fired when user toggles a habit in demo mode.

```javascript
trackEvent("preview_simulate_complete", {
  habitId: "1",
  action: "complete" | "uncomplete",
  totalCompleted: 3,
  perfectDay: false
});
```

---

## A/B Test Proposal

### Test: Headline Variant A vs B

**Hypothesis**: Headline B ("Win the day. Every day.") will have a higher CTA click-through rate than Headline A ("Build momentum. Keep the streak.") because it focuses on immediate, achievable victory rather than long-term consistency.

**Variants**:
- Control (A): "Build momentum. Keep the streak."
- Treatment (B): "Win the day. Every day."

**Success Metrics**:
| Metric | Definition | Target |
|--------|------------|--------|
| Primary: CTR | CTA clicks / page views | +10% improvement |
| Secondary: Signup completion | Registrations / CTA clicks | No regression |
| Guardrail: Bounce rate | Single page sessions / total | No increase >5% |

**Sample Size Calculation**:
- Baseline CTR: 5%
- Minimum detectable effect: 10% relative lift
- Statistical significance: 95%
- Power: 80%
- Required sample: ~15,000 visitors per variant

**Implementation**:
```javascript
// In Hero.tsx
const variant = useExperiment("hero_headline_test"); // Returns "A" or "B"

<Hero
  headlineVariant={variant}
  ...
/>
```

**Duration**: 2 weeks or until statistical significance reached.

**Analysis Plan**:
1. Segment by device (mobile vs desktop)
2. Segment by referral source
3. Analyze time-to-click distribution
4. Monitor for novelty effects in week 2

---

## Implementation Guide

### Google Analytics 4

```javascript
// lib/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, properties);
  }
};
```

### Amplitude (Alternative)

```javascript
// lib/analytics.ts
import amplitude from "@amplitude/analytics-browser";

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  amplitude.track(event, properties);
};
```

### PostHog (Alternative)

```javascript
// lib/analytics.ts
import posthog from "posthog-js";

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  posthog.capture(event, properties);
};
```

---

## Dashboard Requirements

### Key Metrics to Track

1. **Hero Performance**
   - CTA click-through rate
   - Secondary CTA usage rate
   - Time on hero section

2. **Demo Engagement**
   - Preview interaction rate
   - Average habits simulated
   - Perfect day simulation rate

3. **Conversion Funnel**
   - Hero → Signup start
   - Signup start → Registration complete
   - Demo interaction → Signup (correlation)
