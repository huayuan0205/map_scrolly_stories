# Scroll Framework Reference

This file documents the scroll interaction engine used in every scrolly-stories output. The LLM reads this as a **reference** during code generation to implement the correct scroll behavior.

The framework handles: step activation via IntersectionObserver, progress bar, map reveal animation, page-by-page snapping, resize handling, and loading state.

---

## 1. IntersectionObserver — Step Activation

Detects when scroll steps enter the trigger zone and fires the corresponding step handler.

**Card-reveal mode:** rootMargin `-35% 0px -35% 0px` — triggers in the center 30% of the viewport.

**Center-scroll mode:** rootMargin `0px 0px -85% 0px` — triggers only when the step reaches the top 15% of the viewport. This ensures the card scrolls from the bottom all the way to the top before the map switches to the next state.

```javascript
let currentStep = -1;
let prevActiveStepEl = null;
const steps = document.querySelectorAll('.step');

// Use different rootMargin for center-scroll vs card-reveal:
// center-scroll: '0px 0px -85% 0px' (top 15% trigger)
// card-reveal:   '-35% 0px -35% 0px' (center 30% trigger)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.step, 10);
            if (idx !== currentStep) {
                currentStep = idx;
                if (prevActiveStepEl) prevActiveStepEl.classList.remove('is-active');
                entry.target.classList.add('is-active');
                prevActiveStepEl = entry.target;
                if (stepHandlers[idx]) stepHandlers[idx]();
            }
        }
    });
}, {
    rootMargin: '-35% 0px -35% 0px', // or '0px 0px -85% 0px' for center-scroll
    threshold: 0
});

steps.forEach(s => observer.observe(s));
```

**Card-reveal mode:** `-35% 0px -35% 0px` creates a "trigger zone" in the middle 30% of the viewport. A step activates only when it crosses into this center band, preventing premature activation when elements are barely visible at edges.

**Center-scroll mode:** `0px 0px -85% 0px` means the step triggers when its top edge enters the top 15% of the viewport. This lets the card scroll up from the bottom, and the map only updates once the card reaches the top — giving the user a clear view of the current map state before switching.

**Card animation:** The `.is-active` class triggers the card CSS transition defined in `viewport-base.css` (opacity 0→1, transform reset). No JS animation needed — it's purely CSS-driven.

**Center-scroll mode:** In center-scroll mode (Data Journalism), the `.is-active` class is still toggled by the observer, but it only triggers `stepHandlers[idx]()` — it has no visual effect on panels (they are always visible, `opacity: 1`). See [SCROLL_MODES.md](../SCROLL_MODES.md) for details.

---

## 2. Progress Bar (Fill-Only)

Tracks overall scroll position with a simple fill indicator. Non-interactive — no clickable dots, no navigation. `pointer-events: none` on the bar ensures it never intercepts user interaction.

**HTML structure:**
```html
<nav class="progress-bar" id="progressBar">
    <div class="progress-bar__fill" id="progressFill"></div>
</nav>
```

**JavaScript:**
```javascript
const progressFill = document.getElementById('progressFill');
function setReadingProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const p = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
    progressFill.style.setProperty('--progress', String(p));
}
let readingProgressRaf = 0;
window.addEventListener('scroll', () => {
    if (readingProgressRaf) return;
    readingProgressRaf = requestAnimationFrame(() => {
        readingProgressRaf = 0;
        setReadingProgress();
    });
}, { passive: true });
setReadingProgress();
```

**Design decisions:**
- Fill-only — no dots, no click handler, no section tracking
- `{ passive: true }` on scroll listener for performance
- Bar is 4px tall with `pointer-events: none` (defined in CSS)

---

## 3. Map Reveal Animation

A separate IntersectionObserver watches the `.scrolly` section. When it enters the viewport (transitioning from hero to map), it adds `.is-revealed` which triggers the SVG opacity/scale CSS transition.

```javascript
const scrollyEl = document.getElementById('scrolly');
const mapRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            container.classList.add('is-revealed');
        } else {
            container.classList.remove('is-revealed');
        }
    });
}, { threshold: 0.05 });

mapRevealObserver.observe(scrollyEl);
```

The CSS transition is defined in `viewport-base.css`:
```css
.scroll__graphic svg {
    opacity: 0;
    transform: scale(0.92);
    transition: opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94),
                transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94);
}
.scroll__graphic.is-revealed svg {
    opacity: 1;
    transform: scale(1);
}
```

---

## 4. Page Snap (Wheel Event)

Intercepts trackpad/mouse wheel events to enforce precise page-by-page transitions. Prevents users from getting stuck between two pages.

**Center-scroll mode:** When `scrolly--center-scroll` is present on the `.scrolly` element, do NOT include this page snap IIFE in the generated output. Center-scroll requires free continuous scrolling. See [SCROLL_MODES.md](../SCROLL_MODES.md).

```javascript
(function setupPageSnap() {
    function getSnapTargets() {
        const targets = [];
        const hero = document.querySelector('.hero');
        if (hero) targets.push(hero);
        const lede = document.querySelector('.lede');
        if (lede) targets.push(lede);
        document.querySelectorAll('.step').forEach(s => targets.push(s));
        const ending = document.getElementById('ending');
        if (ending) targets.push(ending);
        return targets;
    }

    let isSnapping = false;
    let wheelAccum = 0;
    let wheelTimer = null;
    const WHEEL_THRESHOLD = 50;   // pixels of deltaY before snap triggers
    const SNAP_COOLDOWN = 900;    // ms lockout after snap to prevent double-trigger

    function snapTo(el) {
        isSnapping = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isSnapping = false; }, SNAP_COOLDOWN);
    }

    function findCurrentIndex(targets) {
        let best = 0;
        let bestDist = Infinity;
        targets.forEach((t, i) => {
            const dist = Math.abs(t.getBoundingClientRect().top);
            if (dist < bestDist) { bestDist = dist; best = i; }
        });
        return best;
    }

    window.addEventListener('wheel', (e) => {
        if (isSnapping) { e.preventDefault(); return; }

        const targets = getSnapTargets();
        if (targets.length === 0) return;

        wheelAccum += e.deltaY;
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);

        if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        const direction = wheelAccum > 0 ? 1 : -1;
        wheelAccum = 0;

        const idx = findCurrentIndex(targets);
        const next = Math.max(0, Math.min(targets.length - 1, idx + direction));
        if (next !== idx) {
            snapTo(targets[next]);
        }
    }, { passive: false });
})();
```

**Design decisions:**
- `WHEEL_THRESHOLD = 50` — prevents accidental scrolls from tiny trackpad movements
- `SNAP_COOLDOWN = 900` — enough time for `scrollIntoView` smooth animation to complete
- `wheelTimer` with 200ms reset — if user stops scrolling for 200ms, accumulator resets (handles continuous vs. discrete scrolling)
- `passive: false` is required because we call `e.preventDefault()` to block native scroll

---

## 5. Resize Handler

Updates SVG viewBox dimensions when the browser window is resized.

```javascript
window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
        width = container.clientWidth;
        height = container.clientHeight;
        svg.attr('viewBox', '0 0 ' + width + ' ' + height);
    });
});
```

**Note:** This only updates the viewBox. The map content scales automatically via SVG's intrinsic scaling. No need to re-render paths or re-compute projections.

---

## 6. Loading Dismissal

After the map initializes, dismiss the loading overlay with a brief delay:

```javascript
setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
}, 400);
```

The `.hidden` class triggers an opacity fade-out transition defined in `viewport-base.css`:
```css
.loading-overlay { transition: opacity 0.6s ease; }
.loading-overlay.hidden { opacity: 0; pointer-events: none; }
```

---

## 7. Initial State

After all setup is complete, trigger the first step handler to set the initial map state:

```javascript
stepHandlers[0]();
```

**Important:** Do NOT add `.is-active` to any step in the HTML markup. Let the IntersectionObserver handle it on first scroll. This ensures the card fade-in animation always plays in card-reveal mode. In center-scroll mode, panels are always visible regardless of `.is-active` state.

---

## 8. Section dot navigation (`.story-nav`)

Use compact right-edge dots for page wayfinding (hero/lede/steps/ending). No heading row, no keyboard-hint copy in UI.

```javascript
(function setupStoryNav() {
    const nav = document.getElementById('storyNav');
    if (!nav) return;

    function syncStoryNavScrollbarInset() {
        const root = document.documentElement;
        let sw = window.innerWidth - root.clientWidth;
        if (sw < 0) sw = 0;
        const hasVerticalScroll = root.scrollHeight > root.clientHeight + 2;
        if (hasVerticalScroll && sw < 14) sw = 17;
        root.style.setProperty('--story-nav-scrollbar-width', sw + 'px');
    }

    syncStoryNavScrollbarInset();
    requestAnimationFrame(() => requestAnimationFrame(syncStoryNavScrollbarInset));
    window.addEventListener('resize', () => requestAnimationFrame(syncStoryNavScrollbarInset));
    window.addEventListener('load', () => requestAnimationFrame(syncStoryNavScrollbarInset), { once: true });

    // Auto-tone dots/tooltip for light vs dark backgrounds based on --color-bg luminance.
    function syncStoryNavTone() {
        const root = document.documentElement;
        const bg = getComputedStyle(root).getPropertyValue('--color-bg').trim();
        const m = bg.match(/rgba?\(([^)]+)\)/i);
        let rgb = [255, 255, 255];
        if (m) {
            const p = m[1].split(',').map(v => parseFloat(v.trim()) || 0);
            rgb = [p[0], p[1], p[2]];
        }
        const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        const isLight = lum > 170;
        root.style.setProperty('--story-nav-dot-inactive', isLight ? 'rgba(18,18,18,0.35)' : 'rgba(255,255,255,0.4)');
        root.style.setProperty('--story-nav-dot-active', isLight ? 'rgba(18,18,18,0.78)' : 'rgba(255,255,255,0.8)');
        root.style.setProperty('--story-nav-tip-bg', isLight ? 'rgba(255,255,255,0.94)' : 'rgba(24,24,22,0.88)');
    }
    syncStoryNavTone();

    const links = Array.from(nav.querySelectorAll('a.story-nav__item'));
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if (sections.length === 0) return;

    function setActiveById(id) {
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
    }

    const io = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(e => e.isIntersecting && e.target.id)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActiveById(visible[0].target.id);
    }, { threshold: [0.08, 0.2, 0.35, 0.55], rootMargin: '-12% 0px -12% 0px' });

    sections.forEach(el => io.observe(el));
    setActiveById(sections[0].id);
})();
```
