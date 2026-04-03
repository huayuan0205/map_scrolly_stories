# Style Presets Reference

Curated visual styles for Scrolly-Stories. Each preset defines the complete visual identity — colors, typography, hero treatment, card style, and animation character. Hero layout variant and image sourcing are determined by the [Layout Matrix](LAYOUT_MATRIX.md).

**Base Styles:** For mandatory shared styles, see [viewport-base.css](templates/viewport-base.css). Include in every output.

---

## 1. 冷静专业咨询风格 — Professional Consulting

**Vibe:** Authoritative, restrained, McKinsey/BCG-inspired. Data speaks; design serves.

**Layout:** Hero variant depends on purpose (see [Layout Matrix](LAYOUT_MATRIX.md)): `image-diagonal` (Pitch), `text-left` (Internal), `image-split` (Conference). Cards = frosted glass with backdrop blur, alternating left/right. Ending = `ending--cta` (summary + arrow action items).

**Ending Variant:** `ending--cta`

**Typography:**
- Display: `FZCuYaSongS-B-GB` / `方正粗雅宋简体` (400) — elegant CJK serif with built-in bold weight; use `font-weight: 400` for hero titles, `font-weight: 700` for card titles
- Body: System sans stack with `PingFang SC`, `Microsoft YaHei` for CJK support (400)

**Light Mode Colors:**
```css
:root {
    --font-display: 'Noto Serif SC', Georgia, serif;
    --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;

    /* ── Text ── */
    --color-text: #181818;
    --color-text-secondary: #555555;
    --color-emphasis: #3BBEF4;
    --color-label: #999999;

    /* ── Backgrounds ── */
    --color-bg: #FFFFFF;
    --color-hero-bg: linear-gradient(to right, #051F3C, #2251FF);
    --color-ending-bg: #F6F6F6;
    --color-footer-bg: #051F3C;

    /* ── Hero Text ── */
    --color-hero-overtitle: rgba(255,255,255,0.50);
    --color-hero-title: #FFFFFF;
    --color-hero-emphasis: #3BBEF4;
    --color-hero-subtitle: rgba(255,255,255,0.75);
    --color-hero-hint: rgba(255,255,255,0.30);

    /* ── Visualization Palette ── */
    --color-viz-1: #2352FF;
    --color-viz-2: #4CB7E5;
    --color-viz-3: #B92091;
    --color-viz-4: #051D2A;
    --color-viz-5: #1EE9DA;
    --color-viz-6: #567083;

    /* ── Map ── */
    --color-ocean: #FFFFFF;
    --color-province-default: #F7F7F7;
    --color-province-stroke: #EEEEEE;
    --color-province-hover-stroke: #D0D0D0;
    --color-dimmed: #F0F0F0;
    --color-highlight-stroke-1: #D4DDFF;
    --color-highlight-stroke-2: #C4DEF9;
    --color-highlight-stroke-3: #F0BEE3;
    --color-highlight-stroke-4: #D6D7DE;
    --color-highlight-stroke-5: #C7F6F2;
    --color-highlight-stroke-6: #B5C8D6;

    /* ── Cards ── */
    --color-card-bg: rgba(255,255,255,0.90);
    --color-card-border: rgba(0,0,0,0.06);
    --color-card-stats-border: #EEEEEE;
    --color-stat-value: var(--color-text);
    --color-stat-label: #999;

    /* ── UI ── */
    --color-rule: #181818;
    --color-divider: #D0D0D0;
    --color-footnote: #999;
    --color-footer-text: rgba(255,255,255,0.4);
    --color-tooltip-bg: rgba(255,255,255,0.96);
    --color-tooltip-border: #E0E0E0;
    --progress-bar-bg: #2352FF;
    --progress-bar-track: rgba(0,0,0,0.06);

    /* ── Legend ── */
    --color-legend-bg: rgba(255,255,255,0.9);
    --color-legend-text: #666;
    --color-legend-border: rgba(0,0,0,0.06);

    /* ── Backward Compat ── */
    --color-primary: var(--color-emphasis);
    --color-accent: var(--color-viz-2);
    --color-focus: var(--color-viz-1);
    --color-focus-stroke: var(--color-highlight-stroke-1);

    /* ── Card & Tooltip Geometry ── */
    --card-radius: 2px;
    --card-blur: 10px;
    --card-shadow: 0 2px 24px rgba(0,0,0,0.06);
    --card-enter-transform: translateY(40px) scale(0.97);
    --card-transition-duration: 0.9s;
    --card-transition-easing: cubic-bezier(0.25,0.46,0.45,0.94);
    --card-transition-delay: 0.3s;
    --tooltip-radius: 6px;
}
```

**Dark Mode Colors:**
```css
:root {
    --font-display: 'Noto Serif SC', Georgia, serif;
    --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;

    /* ── Text ── */
    --color-text: #FFFFFF;
    --color-text-secondary: rgba(255,255,255,0.75);
    --color-emphasis: #0452FF;
    --color-label: rgba(255,255,255,0.45);

    /* ── Backgrounds ── */
    --color-bg: #0A3B5D;
    --color-hero-bg: linear-gradient(to right, #051C2C, #0A3B5D);
    --color-ending-bg: #F0F0F0;
    --color-footer-bg: #041520;

    /* ── Hero Text ── */
    --color-hero-overtitle: rgba(255,255,255,0.40);
    --color-hero-title: #FFFFFF;
    --color-hero-emphasis: #4CB7E5;
    --color-hero-subtitle: rgba(255,255,255,0.65);
    --color-hero-hint: rgba(255,255,255,0.25);

    /* ── Visualization Palette ── */
    --color-viz-1: #2351FF;
    --color-viz-2: #4CB7E5;
    --color-viz-3: #1EE9DA;
    --color-viz-4: #E7E7E7;
    --color-viz-5: #9D227D;
    --color-viz-6: #062079;

    /* ── Map ── */
    --color-ocean: #0C2537;
    --color-province-default: #1A3343;
    --color-province-stroke: #354457;
    --color-province-hover-stroke: #667383;
    --color-dimmed: #122D3F;
    --color-highlight-stroke-1: #456DFF;
    --color-highlight-stroke-2: #8FD5F3;
    --color-highlight-stroke-3: #B1F9F4;
    --color-highlight-stroke-4: #FFFFFF;
    --color-highlight-stroke-5: #BC6BA7;
    --color-highlight-stroke-6: #45517C;

    /* ── Cards ── */
    --color-card-bg: rgba(12,37,55,0.90);
    --color-card-border: rgba(255,255,255,0.10);
    --color-card-stats-border: rgba(255,255,255,0.10);
    --color-stat-value: var(--color-text);
    --color-stat-label: rgba(255,255,255,0.45);

    /* ── UI ── */
    --color-rule: #FFFFFF;
    --color-divider: rgba(255,255,255,0.10);
    --color-footnote: rgba(255,255,255,0.4);
    --color-footer-text: rgba(255,255,255,0.3);
    --color-tooltip-bg: rgba(12,37,55,0.95);
    --color-tooltip-border: #354457;
    --progress-bar-bg: #0452FF;
    --progress-bar-track: rgba(255,255,255,0.06);

    /* ── Legend ── */
    --color-legend-bg: rgba(12,37,55,0.9);
    --color-legend-text: rgba(255,255,255,0.6);
    --color-legend-border: rgba(255,255,255,0.08);

    /* ── Backward Compat ── */
    --color-primary: var(--color-emphasis);
    --color-accent: var(--color-viz-2);
    --color-focus: var(--color-viz-1);
    --color-focus-stroke: var(--color-highlight-stroke-1);

    /* ── Card & Tooltip Geometry ── */
    --card-radius: 2px;
    --card-blur: 10px;
    --card-shadow: 0 2px 24px rgba(0,0,0,0.15);
    --card-enter-transform: translateY(40px) scale(0.97);
    --card-transition-duration: 0.9s;
    --card-transition-easing: cubic-bezier(0.25,0.46,0.45,0.94);
    --card-transition-delay: 0.3s;
    --tooltip-radius: 6px;
}
```

**Hero CSS — Light Mode (append after base):**
```css
.hero {
    background: linear-gradient(to right, #051F3C, #2251FF);
}
```

**Hero CSS — Dark Mode (append after base):**
```css
.hero {
    background: linear-gradient(to right, #051C2C, #0A3B5D);
}
```

**Dark Mode Ending Override (append after base, dark mode only):**
```css
/* Dark mode ending uses LIGHT background — text must revert to dark colors */
.ending {
    --color-text: #181818;
    --color-text-secondary: #555555;
    --color-divider: #D0D0D0;
    --color-footnote: #999;
}
.ending__label {
    color: #0452FF;
}
.ending__action-marker {
    color: #0452FF;
}
```

**Signature Elements:**
- Progress bar: solid viz-1 blue (4px), non-interactive (`pointer-events: none`), fill-only — no clickable dots
- Cards: frosted glass (`backdrop-filter: blur(10px)`), 2px radius, 90% opacity
- Card entrance: translateY(40px) + scale(0.97) → reset, 0.9s with 0.3s delay
- Title divider bars: 36px x 3px, emphasis color
- Stat values: tabular-nums, emphasis color
- Card labels: 0.7rem, uppercase, 2.5px letter-spacing
- Ending (`ending--cta`): summary paragraph + 3 arrow action items, light bg (even in dark mode)
- Loading spinner: emphasis color border-top
- Light/dark mode: generator picks one `:root` block + matching Hero CSS based on user preference. Dark mode requires the ending override CSS block.

**Font import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap">
```

---

## 2. 数据新闻风格 — Data Journalism

**Vibe:** NYT/WSJ/Reuters data journalism. Maximum data-ink ratio. Serious, trustworthy, no decoration for decoration's sake.

**Layout:** Hero = `image-top` for ALL purposes (image on top, centered text below, see [Layout Matrix](LAYOUT_MATRIX.md)). Cards = center-scroll editorial panels, semi-transparent with backdrop blur, no left border. Ending = `ending--summary` (centered rule + single paragraph).

**Ending Variant:** `ending--summary`

**Scroll Mode:** `center-scroll` — Editorial panels scroll through naturally, free continuous scrolling. See [SCROLL_MODES.md](SCROLL_MODES.md).

**Typography:**
- Display: `Playfair Display`, `Noto Serif SC` (700/900) — bold editorial serif
- Body: `Noto Sans SC`, `Source Sans 3`, system sans (400/600)

**Light Mode Colors:**
```css
:root {
    --font-display: 'Noto Serif SC', 'Playfair Display', Georgia, serif;
    --font-body: 'Noto Sans SC', 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;

    /* ── Text ── */
    --color-text: #121212;
    --color-text-secondary: #555555;
    --color-emphasis: #DE2D26;
    --color-label: #888888;

    /* ── Backgrounds ── */
    --color-bg: #FFFFFF;
    --color-hero-bg: #1B1B1B;
    --color-lede-bg: #FAF9F6;
    --color-ending-bg: #FAFAFA;
    --color-footer-bg: #121212;

    /* ── Hero Text ── */
    --color-hero-overtitle: rgba(255,255,255,0.45);
    --color-hero-title: #FFFFFF;
    --color-hero-subtitle: rgba(255,255,255,0.5);
    --color-hero-hint: rgba(255,255,255,0.3);

    /* ── Visualization Palette ── */
    --color-viz-1: #3182BD;
    --color-viz-2: #9BA2A7;
    --color-viz-3: #CDE4F6;
    --color-viz-4: #567083;
    --color-viz-5: #D4504B;
    --color-viz-6: #E7E7E7;

    /* ── Map ── */
    --color-ocean: #D4DADC;
    --color-province-default: #EFF1F1;
    --color-province-stroke: #CCCCCC;
    --color-province-hover-stroke: #CCCCCC;
    --color-dimmed: #EEEEEA;
    --color-highlight-stroke-1: #7DAFD3;
    --color-highlight-stroke-2: #7D858C;

    /* ── Cards ── */
    --color-card-bg: rgba(250,249,246,0.82);
    --color-card-border: transparent;
    --color-card-stats-border: #E0E0E0;
    --color-stat-value: var(--color-text);
    --color-stat-label: #888888;

    /* ── UI ── */
    --color-rule: #121212;
    --color-divider: rgba(0,0,0,0.1);
    --color-footnote: #999;
    --color-footer-text: #777;
    --color-tooltip-bg: #FFFFFF;
    --color-tooltip-border: #D0D0D0;
    --progress-bar-bg: #3182BD;
    --progress-bar-track: rgba(0,0,0,0.06);

    /* ── Legend ── */
    --color-legend-bg: rgba(255,255,255,0.9);
    --color-legend-text: #666;
    --color-legend-border: rgba(0,0,0,0.06);

    /* ── Backward Compat ── */
    --color-primary: var(--color-emphasis);
    --color-accent: var(--color-viz-2);
    --color-focus: var(--color-viz-1);
    --color-focus-stroke: var(--color-highlight-stroke-1);

    /* ── Card & Tooltip Geometry ── */
    --card-radius: 6px;
    --card-blur: 10px;
    --card-shadow: none;
    --card-enter-transform: translateY(0);
    --card-transition-duration: 0.6s;
    --card-transition-easing: ease-out;
    --card-transition-delay: 0.15s;
    --tooltip-radius: 2px;
}
```

**Dark Mode Colors:**
```css
:root {
    --font-display: 'Noto Serif SC', 'Playfair Display', Georgia, serif;
    --font-body: 'Noto Sans SC', 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;

    /* ── Text ── */
    --color-text: #E8E6E1;
    --color-text-secondary: #A8A8A0;
    --color-emphasis: #F05A53;
    --color-label: #787870;

    /* ── Backgrounds ── */
    --color-bg: #181816;
    --color-hero-bg: #0E0E0C;
    --color-lede-bg: #222220;
    --color-ending-bg: #1E1E1C;
    --color-footer-bg: #0A0A08;

    /* ── Hero Text ── */
    --color-hero-overtitle: rgba(255,255,255,0.40);
    --color-hero-title: #FFFFFF;
    --color-hero-subtitle: rgba(255,255,255,0.45);
    --color-hero-hint: rgba(255,255,255,0.25);

    /* ── Visualization Palette ── */
    --color-viz-1: #4A9AD0;
    --color-viz-2: #B0B7BC;
    --color-viz-3: #7FBCE0;
    --color-viz-4: #7E97A6;
    --color-viz-5: #E06862;
    --color-viz-6: #3A3A38;

    /* ── Map ── */
    --color-ocean: #2F2F2F;
    --color-province-default: #2A2A25;
    --color-province-stroke: #3D3D36;
    --color-province-hover-stroke: #5D5B5B;
    --color-dimmed: #222220;
    --color-highlight-stroke-1: #5AADDB;
    --color-highlight-stroke-2: #9BA2A7;

    /* ── Cards ── */
    --color-card-bg: rgba(34,34,32,0.82);
    --color-card-border: rgba(255,255,255,0.06);
    --color-card-stats-border: rgba(255,255,255,0.08);
    --color-stat-value: var(--color-text);
    --color-stat-label: #787870;

    /* ── UI ── */
    --color-rule: #E8E6E1;
    --color-divider: rgba(255,255,255,0.08);
    --color-footnote: #787870;
    --color-footer-text: #555;
    --color-tooltip-bg: rgba(34,34,32,0.95);
    --color-tooltip-border: #3D3D36;
    --progress-bar-bg: #F05A53;
    --progress-bar-track: rgba(255,255,255,0.06);

    /* ── Legend ── */
    --color-legend-bg: rgba(34,34,32,0.9);
    --color-legend-text: #A8A8A0;
    --color-legend-border: rgba(255,255,255,0.06);

    /* ── Backward Compat ── */
    --color-primary: var(--color-emphasis);
    --color-accent: var(--color-viz-2);
    --color-focus: var(--color-viz-1);
    --color-focus-stroke: var(--color-highlight-stroke-1);

    /* ── Card & Tooltip Geometry ── */
    --card-radius: 6px;
    --card-blur: 10px;
    --card-shadow: none;
    --card-enter-transform: translateY(0);
    --card-transition-duration: 0.6s;
    --card-transition-easing: ease-out;
    --card-transition-delay: 0.15s;
    --tooltip-radius: 2px;
}
```

**Hero CSS — Light Mode (append after base):**
```css
/* Data Journalism uses hero--image-top variant; these override its text region */
.hero--image-top .hero__text-region {
    background: #FAF9F6;
}
.hero--image-top .hero__title {
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    max-width: 720px;
}
.hero--image-top .hero__subtitle {
    border-top: 1px solid rgba(0,0,0,0.1);
    padding-top: 1rem;
    margin-top: 2rem;
}
.hero__image-region .hero__image-overlay {
    background: linear-gradient(to top, #FAF9F6, transparent);
}
```

**Hero CSS — Dark Mode (append after base):**
```css
.hero--image-top .hero__text-region {
    background: #181816;
}
.hero--image-top .hero__title {
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    max-width: 720px;
}
.hero--image-top .hero__subtitle {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 1rem;
    margin-top: 2rem;
}
.hero__image-region .hero__image-overlay {
    background: linear-gradient(to top, #181816, transparent);
}
```

**Card CSS (append after base):**
```css
.card__divider { display: none; }
.card__label {
    font-size: 0.65rem;
    letter-spacing: 1.5px;
    color: var(--color-chart-primary, var(--color-primary));
}
/* Two-column layout when chart or stats are present */
.scrolly--center-scroll .card--has-chart,
.scrolly--center-scroll .card--has-stats {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    max-height: 280px;
}
.scrolly--center-scroll .card--has-chart .card__text,
.scrolly--center-scroll .card--has-stats .card__text {
    flex: 0 0 40%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.scrolly--center-scroll .card--has-chart .card__chart,
.scrolly--center-scroll .card--has-stats .card__stats {
    flex: 1 1 0;
    min-width: 0;
    align-self: center;
    margin-top: 0;
}
```

**Signature Elements:**
- Lede page: full-viewport context-setting page between hero and scrolly, 80px rule + bold serif statement. Lede `em` uses `font-style: normal; font-weight: 900; color: var(--color-emphasis)` — no italic for CJK text.
- Scroll mode: center-scroll — compact cards anchored to viewport bottom, scroll upward naturally. Cards use `card__header` (label + title) and `card__body` (text + stats horizontal layout). Stats positioned absolutely, vertically centered with the full card. Use blended solid panel (`color-mix(...)`) and keep `backdrop-filter: none`; no rule separator, no border/shadow.
- Card typography: label `0.4rem` margin-bottom, title `1.2rem`, body text `0.92rem`. Card max-height `200px`, min-height `80px`. When chart or stats are present (`card--has-chart` / `card--has-stats`): switches to two-column flex layout (text left 40%, data right), both columns vertically centered, max-height expands to `280px`.
- Panel entrance: continuous scroll-through (no fade animation), panels always visible
- No page snap — free continuous scrolling
- No divider bars, no left border — minimal ornamentation
- Hero (`image-top`): image on top, text region below, byline-style subtitle with top border
- Data emphasis: stat values larger (1.8rem), use main text color via `--color-stat-value`
- Ending (`ending--summary`): centered thick rule + single serif paragraph, no numbered items. Ending `em` uses `font-style: normal; font-weight: 700; color: var(--color-emphasis)` — no italic for CJK text.
- Source citations prominent in ending footnote
- Progress bar: solid viz-1 blue (4px), non-interactive (`pointer-events: none`), fill-only — no clickable dots
- Loading spinner: emphasis color border-top
- Light/dark mode: generator picks one `:root` block + matching Hero CSS based on user preference
- Map default province color: `#EFF1F1` for light mode. When zooming in to focus regions, unhighlighted provinces also use `#EFF1F1` (or `--color-province-default`) in legend entries.

**Font import:**
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Noto+Sans+SC:wght@400;600&family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@400;600&display=swap">
```

---

## 3. 活力创新现代风格 — Innovative Modern

**Vibe:** Warm, energetic, brand-forward. Rich earthy tones in light mode; deep teal-dark with neon accents in dark mode. Feels like a premium product launch — confident but not cold.

**Layout:** Hero variant depends on purpose (see [Layout Matrix](LAYOUT_MATRIX.md)): `image-overlap` (Pitch), `text-center` (Internal), `image-bg` (Conference). Cards = lightly rounded, warm shadow, slight glassmorphism. Ending = `ending--cards` (2x2 translucent glass cards on dark bg).

**Ending Variant:** `ending--cards`

**Typography:**
- Display: `Plus Jakarta Sans` (700/800) — geometric modern sans
- Body: `DM Sans` (400/500)

**Light Mode Colors:**
```css
:root {
    --font-display: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --font-body: 'DM Sans', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;

    /* ── Text ── */
    --color-text: #181818;
    --color-text-secondary: #555555;
    --color-emphasis: #3560E5;
    --color-label: #888888;

    /* ── Backgrounds ── */
    --color-bg: #F9F0E8;
    --color-hero-bg: #1A1008;
    --color-ending-bg: #434343;
    --color-footer-bg: #1A1008;

    /* ── Hero Text ── */
    --color-hero-overtitle: rgba(255,255,255,0.45);
    --color-hero-title: #FFFFFF;
    --color-hero-emphasis: #FDA923;
    --color-hero-subtitle: rgba(255,255,255,0.65);
    --color-hero-hint: rgba(255,255,255,0.30);

    /* ── Visualization Palette ── */
    --color-viz-1: #3560E5;
    --color-viz-2: #FDA923;
    --color-viz-3: #B7A598;
    --color-viz-4: #19130D;
    --color-viz-5: #8FB7A4;
    --color-viz-6: #324E88;
    --color-viz-7: #BF623E;

    /* ── Map ── */
    --color-ocean: #F9F0E8;
    --color-province-default: #F7E3D1;
    --color-province-stroke: #B7A598;
    --color-province-hover-stroke: #C8783D;
    --color-dimmed: #F0DDD0;
    --color-highlight-stroke-1: #7DAFD3;
    --color-highlight-stroke-2: #E1961E;
    --color-highlight-stroke-3: #E8B48F;
    --color-highlight-stroke-4: #D6D7DE;
    --color-highlight-stroke-5: #BED9CC;
    --color-highlight-stroke-6: #B5C8D6;
    --color-highlight-stroke-7: #E8B29D;

    /* ── Cards ── */
    --color-card-bg: rgba(252,249,246,0.90);
    --color-card-border: #433830;
    --color-card-stats-border: #E8DDD6;
    --color-stat-value: var(--color-text);
    --color-stat-label: #888888;

    /* ── UI ── */
    --color-rule: #181818;
    --color-divider: rgba(0,0,0,0.10);
    --color-footnote: #888;
    --color-footer-text: rgba(255,255,255,0.4);
    --color-tooltip-bg: rgba(252,249,246,0.97);
    --color-tooltip-border: #D4C5BA;
    --progress-bar-bg: linear-gradient(90deg, #3560E5, #FDA923);
    --progress-bar-track: rgba(0,0,0,0.06);

    /* ── Legend ── */
    --color-legend-bg: rgba(252,249,246,0.92);
    --color-legend-text: #666;
    --color-legend-border: rgba(0,0,0,0.06);

    /* ── Backward Compat ── */
    --color-primary: var(--color-emphasis);
    --color-accent: var(--color-viz-2);
    --color-focus: var(--color-viz-1);
    --color-focus-stroke: var(--color-highlight-stroke-1);

    /* ── Card & Tooltip Geometry ── */
    --card-radius: 2px;
    --card-blur: 12px;
    --card-shadow: 0 2px 20px rgba(67,56,48,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --card-enter-transform: translateY(30px) scale(0.97);
    --card-transition-duration: 0.8s;
    --card-transition-easing: cubic-bezier(0.16, 1, 0.3, 1);
    --card-transition-delay: 0.2s;
    --tooltip-radius: 4px;
}
```

**Dark Mode Colors:**
```css
:root {
    --font-display: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --font-body: 'DM Sans', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;

    /* ── Text ── */
    --color-text: #FFFFFF;
    --color-text-secondary: rgba(255,255,255,0.85);
    --color-emphasis: #02FFC2;
    --color-label: rgba(255,255,255,0.45);

    /* ── Backgrounds ── */
    --color-bg: #1E282D;
    --color-hero-bg: #111C20;
    --color-ending-bg: #2C383E;
    --color-footer-bg: #111C20;

    /* ── Hero Text ── */
    --color-hero-overtitle: rgba(255,255,255,0.40);
    --color-hero-title: #FFFFFF;
    --color-hero-emphasis: #02FFC2;
    --color-hero-subtitle: rgba(255,255,255,0.60);
    --color-hero-hint: rgba(255,255,255,0.25);

    /* ── Visualization Palette ── */
    --color-viz-1: #02FFC2;
    --color-viz-2: #F8D588;
    --color-viz-3: #E95C86;
    --color-viz-4: #2C383E;
    --color-viz-5: #FF9C15;
    --color-viz-6: #016946;
    --color-viz-7: #FFA29B;

    /* ── Map ── */
    --color-ocean: #1E282D;
    --color-province-default: #2C383E;
    --color-province-stroke: #354457;
    --color-province-hover-stroke: #657487;
    --color-dimmed: #253038;
    --color-highlight-stroke-1: #B6FCEB;
    --color-highlight-stroke-2: #FDEECC;
    --color-highlight-stroke-3: #E5A7BA;
    --color-highlight-stroke-4: #343F44;
    --color-highlight-stroke-5: #F1C992;
    --color-highlight-stroke-6: #268363;
    --color-highlight-stroke-7: #EEC9C6;

    /* ── Cards ── */
    --color-card-bg: rgba(30,40,45,0.90);
    --color-card-border: rgba(255,255,255,0.20);
    --color-card-stats-border: rgba(255,255,255,0.12);
    --color-stat-value: var(--color-text);
    --color-stat-label: rgba(255,255,255,0.45);

    /* ── UI ── */
    --color-rule: #FFFFFF;
    --color-divider: rgba(255,255,255,0.10);
    --color-footnote: rgba(255,255,255,0.4);
    --color-footer-text: rgba(255,255,255,0.3);
    --color-tooltip-bg: rgba(28,38,43,0.96);
    --color-tooltip-border: #3A4A52;
    --progress-bar-bg: linear-gradient(90deg, #02FFC2, #F8D588);
    --progress-bar-track: rgba(255,255,255,0.06);

    /* ── Legend ── */
    --color-legend-bg: rgba(28,38,43,0.92);
    --color-legend-text: rgba(255,255,255,0.6);
    --color-legend-border: rgba(255,255,255,0.08);

    /* ── Backward Compat ── */
    --color-primary: var(--color-emphasis);
    --color-accent: var(--color-viz-2);
    --color-focus: var(--color-viz-1);
    --color-focus-stroke: var(--color-highlight-stroke-1);

    /* ── Card & Tooltip Geometry ── */
    --card-radius: 2px;
    --card-blur: 12px;
    --card-shadow: 0 2px 24px rgba(0,0,0,0.30);
    --card-enter-transform: translateY(30px) scale(0.97);
    --card-transition-duration: 0.8s;
    --card-transition-easing: cubic-bezier(0.16, 1, 0.3, 1);
    --card-transition-delay: 0.2s;
    --tooltip-radius: 4px;
}
```

**Hero CSS — Light Mode (append after base):**
```css
.hero {
    background: linear-gradient(135deg, #1A1008 0%, #3D2510 50%, #1A1008 100%);
}
.hero::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(53,96,229,0.18) 0%, transparent 70%);
    top: -200px; right: -100px;
    animation: glowFloat 8s ease-in-out infinite;
}
.hero::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(253,169,35,0.14) 0%, transparent 70%);
    bottom: -100px; left: -50px;
    animation: glowFloat 10s ease-in-out infinite reverse;
}
@keyframes glowFloat {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(30px, -20px); }
}
```

**Hero CSS — Dark Mode (append after base):**
```css
.hero {
    background: linear-gradient(135deg, #111C20 0%, #1E3038 50%, #111C20 100%);
}
.hero::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(2,255,194,0.12) 0%, transparent 70%);
    top: -200px; right: -100px;
    animation: glowFloat 8s ease-in-out infinite;
}
.hero::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(248,213,136,0.10) 0%, transparent 70%);
    bottom: -100px; left: -50px;
    animation: glowFloat 10s ease-in-out infinite reverse;
}
@keyframes glowFloat {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(30px, -20px); }
}
```

**Card CSS — Light Mode (append after base):**
```css
.card {
    border-width: 1px;
    border-style: solid;
}
/* Label pill background syncs to active chart highlight via --color-chart-primary-bg.
   setChartPrimary() must set both --color-chart-primary AND --color-chart-primary-bg together. */
.card__label {
    background: var(--color-chart-primary-bg, rgba(53,96,229,0.08));
    padding: 0.3rem 0.8rem;
    border-radius: 100px;
    display: inline-block;
    letter-spacing: 1.5px;
    font-size: 0.65rem;
    color: var(--color-chart-primary, var(--color-emphasis));
}
.card__label--accent {
    background: var(--color-chart-primary-bg, rgba(253,169,35,0.12));
    color: var(--color-chart-primary, var(--color-accent));
}
.card__divider {
    width: 48px;
    height: 3px;
    border-radius: 2px;
    background: var(--color-chart-primary, var(--color-emphasis));
}
```

**Card CSS — Dark Mode (append after base):**
```css
.card {
    border-width: 1px;
    border-style: solid;
    /* No blur or shadow — clean solid panel */
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
}
/* Label pill — color synced to active map highlight */
.card__label {
    background: rgba(255,255,255,0.06);
    padding: 0.3rem 0.8rem;
    border-radius: 100px;
    display: inline-block;
    letter-spacing: 1.5px;
    font-size: 0.65rem;
    color: var(--color-chart-primary, var(--color-emphasis));
}
.card__label--accent {
    color: var(--color-chart-primary, var(--color-accent));
}
/* Divider bar — color synced to active map highlight */
.card__divider {
    width: 48px;
    height: 3px;
    border-radius: 2px;
    background: var(--color-chart-primary, var(--color-emphasis));
}
```

**Signature Elements:**
- Hero: warm dark gradient background with animated radial glow spots — blue/amber in light mode, teal/gold in dark mode
- Cards: `2px` radius, `1px` solid border (`#433830` light / `rgba(255,255,255,0.20)` dark), no blur, no shadow in dark mode
- Card entrance: translateY(30px) + scale(0.97) → reset, snappy 0.8s with custom cubic-bezier
- Pill-shaped labels (rounded background): label color and divider bar both use `--color-chart-primary` (synced to current map highlight color per step)
- Gradient progress bar (4px, non-interactive, fill-only — no clickable dots): blue→amber in light, teal→gold in dark
- Ending (`ending--cards`): 2x2 translucent glass cards on dark `#434343` (light) / `#2C383E` (dark) bg
- Loading spinner: emphasis color border-top
- Light/dark mode: generator picks one `:root` block + matching Hero CSS + matching Card CSS. Both are required since card border color differs significantly between modes.

**Font import:**
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=DM+Sans:wght@400;500&display=swap">
```

---

## Color Usage Guide

### New Color Architecture

Presets use a split color system separating **text**, **visualization**, and **map highlight** concerns:

| Category | Variables | Purpose |
|---|---|---|
| **Text** | `--color-text`, `--color-text-secondary`, `--color-emphasis` | Body text, secondary text, inline emphasis (replaces old `--color-primary` for text) |
| **Visualization** | `--color-viz-1` through `--color-viz-6` | Map fill colors, chart colors — independent palette applied in order |
| **Highlight Strokes** | `--color-highlight-stroke-1` through `--color-highlight-stroke-N` | Map border highlights corresponding to each viz palette color |

**Backward compatibility:** Each preset also defines `--color-primary`, `--color-accent`, `--color-focus`, `--color-focus-stroke` as aliases so viewport-base.css references continue to work (especially for the not-yet-updated Innovative Modern preset).

### Map Visualization Mapping

| CSS Variable | Usage |
|---|---|
| `--color-viz-1` | Primary data fill (overview threshold, single-focus highlight) |
| `--color-viz-2` through `--color-viz-6` | Additional data categories, comparison fills |
| `--color-highlight-stroke-N` | Border stroke for regions filled with `--color-viz-N` |
| `--color-province-default` | Unhighlighted province/state fill |
| `--color-province-stroke` | Default province/state border |
| `--color-dimmed` | Non-focused provinces in focus mode |
| `--color-ocean` | Map background (water/empty space) |

**Step type → color mapping:**
- Overview steps (threshold coloring) → `--color-viz-1` (via `--color-focus` alias)
- Focus steps (single region zoom) → `--color-viz-1` (via `--color-focus` alias)
- Summary/outlook steps → `--color-viz-2` (via `--color-accent` alias)
- Text emphasis / stat values / card labels → `--color-emphasis` (via `--color-primary` alias)

### Light/Dark Mode

Each preset defines two complete `:root` blocks (Light Mode Colors, Dark Mode Colors). The generator selects one based on user preference in Phase 1.3. Presets with mode-specific Hero CSS or section overrides (e.g. Professional dark ending) include separate CSS blocks labeled by mode.

---

## Font Pairing Quick Reference

| Preset | Display Font | Body Font | Source |
|---|---|---|---|
| Professional Consulting | Georgia / Noto Serif SC | System sans + PingFang SC | System / Google |
| Data Journalism | Noto Serif SC / Playfair Display | Noto Sans SC / Source Sans 3 | Google Fonts |
| Innovative Modern | Plus Jakarta Sans | DM Sans | Google Fonts |

---

## DO NOT USE (Generic AI Patterns)

**Fonts:** Inter as the sole font, Roboto, Arial, or system-only stacks for display text

**Colors:** `#6366F1` as the only accent in the consulting preset (it belongs to the modern preset), rainbow gradients, neon on white

**Layouts:** Everything centered with no variation, identical card positions throughout, symmetrical grids that feel robotic

**Decorations:** Gratuitous glassmorphism on every element, drop shadows without purpose, decorative SVG illustrations (CSS-only shapes and gradients are preferred)

**Animations:** Bounce effects on data cards (feels unserious), simultaneous entrance of all elements (stagger is better), excessive parallax

---

## Runtime Color Mapping Rules (Added)

Use two semantic highlight roles:

- `--color-chart-primary`: chart/map narrative highlight color (for `.scrolly` cards).
- `--color-text-primary`: non-chart-page highlight color (hero/lede/ending/pure text).

Required:

1. Insight-card metrics use main text color (light + dark):
   - `--color-stat-value: var(--color-text)`
2. `--color-chart-primary` is runtime-synced with the active map/chart highlight in each step.
   - It is not a hardcoded first palette color.
3. Chart-side label/divider/strong text should consume `--color-chart-primary`.
4. Non-chart emphasis should consume `--color-text-primary`.

### Professional Consulting dark fixed tokens
- `--color-ocean: #051C2C`
- `--color-province-default: #162B38`
- `--color-card-bg: #051C2C`
