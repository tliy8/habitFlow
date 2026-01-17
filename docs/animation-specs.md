# Animation Specification Sheet

## Overview
All animations use Framer Motion with fallbacks for reduced motion preference.

## Global Settings
```javascript
const ANIMATION_CONFIG = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    celebration: 1.2,
  },
  easing: {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: { type: "spring", damping: 20, stiffness: 300 },
  },
};
```

## Component Animations

### 1. Hero Text Entrance
| Property | From | To | Duration | Easing | Delay |
|----------|------|-----|----------|--------|-------|
| opacity | 0 | 1 | 600ms | ease-out | 0ms |
| y | 20px | 0 | 600ms | ease-out | 0ms |

### 2. CTA Button
| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Load | fade up + scale(0.95→1) | 500ms | spring |
| Hover | scale(1→1.05) + shadow | 200ms | ease |
| Click | scale(1→0.98) | 100ms | ease |

### 3. Heatmap Calendar Grid
| Property | From | To | Duration | Delay |
|----------|------|-----|----------|-------|
| opacity | 0 | 1 | 200ms | index * 20ms |
| scale | 0.8 | 1 | 200ms | index * 20ms |

### 4. Heatmap Cell Hover
| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| scale | 1.15 | 150ms | ease |
| z-index | 10 | instant | - |

### 5. Tooltip
| Property | From | To | Duration |
|----------|------|-----|----------|
| opacity | 0 | 1 | 150ms |
| y | 5px | 0 | 150ms |

### 6. Quick Panel Slide
| Property | From | To | Duration | Easing |
|----------|------|-----|----------|--------|
| x | 100% | 0 | 300ms | spring |
| opacity | 0 | 1 | 200ms | ease |

### 7. Checkbox Completion
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Background | color fill | 200ms | ease |
| Check icon | scale(0→1) + rotate(-45→0) | 300ms | spring |

### 8. Progress Bar Fill
| Property | From | To | Duration | Easing |
|----------|------|-----|----------|--------|
| width | 0% | target% | 500ms | ease-out |

### 9. Perfect Day Celebration
| Element | Animation | Duration | Delay |
|---------|-----------|----------|-------|
| Background | pulse glow | 1000ms | 0ms |
| Emoji | scale bounce | 400ms | 200ms |

## Reduced Motion Behavior

When `prefers-reduced-motion: reduce` is set:

```javascript
const reducedMotionVariants = {
  // Replace all transforms with simple fades
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  
  // Disable hover animations
  hover: {},
  
  // Disable stagger delays
  staggerChildren: 0,
  delayChildren: 0,
};
```

### What Gets Disabled
- ❌ Scale transforms
- ❌ Translate animations
- ❌ Rotation animations
- ❌ Stagger delays
- ❌ Spring physics
- ❌ Confetti animations

### What Remains
- ✅ Opacity fades (max 200ms)
- ✅ Color transitions
- ✅ Static checkmark icons

## Performance Guidelines

1. **GPU Acceleration**: Use `transform` and `opacity` only for animations
2. **Will-change**: Apply `will-change: transform` on hover elements
3. **Lazy Loading**: Load Lottie assets on interaction, not page load
4. **Debounce**: Hover events debounced at 50ms
5. **Exit Animations**: Keep exit animations under 200ms

## Lottie Assets (Placeholders)

### checkmark.json
- Trigger: Habit completion
- Duration: 400ms
- Size: 32x32px
- Fallback: Static Check icon

### confetti.json
- Trigger: All habits completed
- Duration: 1200ms
- Size: Full container
- Fallback: Emoji + pulse glow

## Testing Checklist

- [ ] Animations smooth at 60fps
- [ ] Reduced motion preference respected
- [ ] No layout shifts during animation
- [ ] All animations complete before next interaction
- [ ] Memory released after animation complete
