# Scroll Modes Reference

Determines how insight cards/panels behave during the scrollytelling section based on the selected **Style**. Covers step structure, card animation, page snap, zoom offset, and HTML templates.

**Shared scroll infrastructure** (IntersectionObserver, progress bar, map reveal, resize, loading) is documented in [scroll-framework.js](templates/scroll-framework.js).

---

## Mode Decision (Style -> Scroll Mode)

| Style | Scroll Mode | HTML Class | Description |
|---|---|---|---|
| Professional Consulting | `card-reveal` | _(none, default)_ | Cards fade in at left/right positions, page snap enabled |
| Data Journalism | `center-scroll` | `scrolly--center-scroll` | Editorial panels scroll through naturally, free continuous scrolling |
| Innovative Modern | `card-reveal` | _(none, default)_ | Cards fade in at left/right positions, page snap enabled |

---

## 1. Card-Reveal Mode

The default scroll mode. Cards appear as floating UI elements on the left or right side of the viewport, fading in when their step activates and fading out when the next step takes over. Page snap ensures precise step-by-step navigation.

### Behavior

- **Step structure:** Each step is `100vh`. Cards are vertically centered within the step via flexbox.
- **Card animation:** Cards start at `opacity: 0` with `var(--card-enter-transform)`. When `.is-active` is added to the step, CSS transitions animate to `opacity: 1; transform: translateY(0) scale(1)`. Duration, easing, and delay are controlled by CSS variables from the style preset.
- **Page snap:** Enabled. Wheel events are intercepted to enforce step-by-step navigation (50px delta threshold, 900ms cooldown). See [scroll-framework.js Section 4](templates/scroll-framework.js).
- **IntersectionObserver:** rootMargin `-35% 0px -35% 0px` (center 30% trigger zone). Fires `stepHandlers[idx]()` and toggles `.is-active` class.

### Card Position Rules

1. **Never use `card--center` for focus/comparison zoom steps** — it occludes the zoomed map content.
2. Place the card on the **opposite side** from the target region's geographic position on the map. E.g., California (left on US map) -> `card--right`; Pennsylvania (right) -> `card--left`.
3. Pass the matching `cardPosition` to `zoomToProvince(name, duration, cardPosition)` so the map shifts opposite to the card by `width * 0.12`.
4. Overview/reset-zoom steps can use any card position.
5. Step 0 card is always `card--left` or `card--center`.

### Zoom Offset

`zoomToProvince()` applies horizontal offset based on card position:
- `cardPosition === 'left'` -> `offsetX = +width * 0.12` (map content shifts right)
- `cardPosition === 'right'` -> `offsetX = -width * 0.12` (map content shifts left)
- `cardPosition === 'center'` -> `offsetX = 0`

### HTML Template

```html
<section class="scrolly" id="scrolly">
    <div class="scroll__graphic" id="mapContainer">
        <div class="map-legend" id="mapLegend"></div>
        <div class="map-tooltip" id="mapTooltip"></div>
    </div>
    <div class="scroll__text">
        <div class="step" data-step="0">
            <div class="card card--left">
                <div class="card__label">SECTION LABEL</div>
                <h2 class="card__title">Headline</h2>
                <div class="card__divider"></div>
                <p class="card__text">Narrative paragraph...</p>
                <div class="card__stats">
                    <div class="stat">
                        <div class="stat__value">69,254</div>
                        <div class="stat__label">Total</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- More steps with card--left or card--right -->
    </div>
</section>
```

---

## 2. Center-Scroll Mode

Editorial scroll-through mode inspired by NYT/MTA/ABC data journalism. Compact bottom-anchored cards scroll upward through the viewport. The card starts at the page bottom, scrolls up, and the map state only changes when the card reaches the top of the viewport — giving the user a clear centered view of the current map before switching. No fade animation, no page snap — free continuous scrolling.

### Lede Page (DJ only)

A full-viewport context-setting page placed **between hero and scrolly**. It bridges the hero introduction to the data exploration with a single bold editorial statement. Only generated for Data Journalism style.

**Visual:** Warm off-white background (`#FAF9F6`), centered vertically. A thick 80px × 3px black horizontal rule above 1-2 sentences of bold serif text. Matches the editorial gravity of the MTA/NYT pattern.

**Content:** 1-2 sentences that set the context or framing for the data story — the "why should you care" moment before the data exploration begins. `<em>` uses **bold + emphasis color** (NOT italic) — `font-style: normal; font-weight: 900; color: var(--color-emphasis)`. Italic looks irregular with CJK text.

```html
<section class="lede">
    <div class="lede__inner">
        <div class="lede__rule"></div>
        <p class="lede__text">{Context-setting statement with <em>emphasis</em> on key terms.}</p>
    </div>
</section>
```

**Page structure with lede:** Hero → **Lede** → Scrolly → Ending → Footer

### Behavior

- **Step structure:** Each step is `100vh`. Cards anchored to the bottom of the step via `align-items: flex-end`. Cards are always visible (`opacity: 1`, `transform: none`) and scroll naturally with the document flow.
- **Card styling:** `max-width: 780px`, horizontally centered, solid-ish blended background (`color-mix(...)` from `viewport-base.css`), no `backdrop-filter`, no border/shadow/radius. No rule separator (`::before` is `display: none`). Compact: `min-height: 80px`, `max-height: 200px`, padding `1.1rem 1.8rem`.
- **Card structure:** Uses `card__header` (label on own line + title) and `card__body` (text + stats horizontal layout). Stats are positioned absolutely, vertically centered with the full card (`position: absolute; right: 1.8rem; top: 50%; transform: translateY(-50%)`).
- **Card typography:** Label `margin-bottom: 0.4rem`, title `1.2rem`, body text `0.92rem`, stat values `1.15rem`, stat labels `0.62rem`.
- **Animation:** None. Panels do not fade in/out. The `.is-active` class only triggers `stepHandlers[idx]()` for map state changes — it does not control panel visibility.
- **Page snap:** Disabled. Do NOT include the page snap IIFE (scroll-framework.js Section 4) when generating center-scroll output. Free continuous scrolling.
- **IntersectionObserver:** rootMargin `0px 0px -85% 0px` — triggers when the step's top edge enters the top 15% of the viewport. This ensures the card scrolls all the way to the top before the map switches state.
- **Scroll space:** `.scroll__text` has `padding-bottom: 85vh` to provide enough extra scroll space for the last step card to travel to the top of the viewport and trigger the transition to the ending section.

### Scroll Rhythm

```
MAP visible (step 0 state)
  | scroll |
Card 0 at bottom → scrolls upward → reaches top (step 1 fires) → exits at top
  |
MAP visible (step 1 state — new colors/zoom)
  | scroll |
Card 1 at bottom → scrolls upward → reaches top (step 2 fires) → exits at top
  ...
Last card → scrolls to top → exits → ending section scrolls in
```

### Card Position Rules

- ALL steps use centered panels (enforced by CSS — `margin: 0 auto`).
- `card--left` / `card--right` classes are ignored by CSS overrides.
- All step handlers pass `'center'` as `cardPosition` to `zoomToProvince()` / `zoomToMultiple()`, resulting in `offsetX = 0` (map centers normally).
- This works because the text panel scrolls away between steps, giving the user a clear centered view of the focused map region in the gaps between panels.

### Zoom Offset

All steps pass `cardPosition: 'center'` -> `offsetX = 0`. Map centers normally for all step types.

### HTML Template

```html
<!-- Lede (DJ only — placed between hero and scrolly) -->
<section class="lede">
    <div class="lede__inner">
        <div class="lede__rule"></div>
        <p class="lede__text">{Context-setting statement...}</p>
    </div>
</section>

<!-- Scrollytelling -->
<section class="scrolly scrolly--center-scroll" id="scrolly">
    <div class="scroll__graphic" id="mapContainer">
        <div class="map-legend" id="mapLegend"></div>
        <div class="map-tooltip" id="mapTooltip"></div>
    </div>
    <div class="scroll__text">
        <div class="step" data-step="0">
            <div class="card">
                <div class="card__header">
                    <div class="card__label">SECTION LABEL</div>
                    <h2 class="card__title">Headline</h2>
                </div>
                <div class="card__body">
                    <p class="card__text">Concise narrative (1-2 lines max)...</p>
                    <div class="card__stats">
                        <div class="stat">
                            <div class="stat__value">69,254</div>
                            <div class="stat__label">Total</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- More steps with card__header + card__body, no position class, no card__divider -->
    </div>
</section>
```

Key differences from card-reveal template:
- **Lede section** between hero and scrolly (DJ only)
- `scrolly--center-scroll` class on `.scrolly`
- No `card--left` / `card--right` position class
- No `.card__divider` element
- Card uses `card__header` (label + title) and `card__body` (text + stats) wrappers
- Card text should be concise (1-2 lines) — cards are compact (max 200px height)
- Stats render to the right of text, vertically centered with the full card via absolute positioning

---

## Shared Infrastructure

Both modes share the same underlying scroll infrastructure documented in [scroll-framework.js](templates/scroll-framework.js):

| Component | Section | Behavior |
|---|---|---|
| IntersectionObserver | Section 1 | Card-reveal: `-35% 0px -35% 0px` (center 30%); Center-scroll: `0px 0px -85% 0px` (top 15%) |
| Progress bar | Section 2 | Fill-only indicator (4px, non-interactive, no dots) |
| Map reveal | Section 3 | SVG fade-in + scale on `.scrolly` entry |
| Page snap | Section 4 | **Card-reveal only.** Skip for center-scroll. Includes lede in snap targets if present. |
| Resize handler | Section 5 | Updates SVG viewBox on resize |
| Loading dismissal | Section 6 | Fades out loading overlay |
| Initial state | Section 7 | Calls `stepHandlers[0]()` after setup |
