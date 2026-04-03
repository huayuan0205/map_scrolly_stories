## Dark Mode Parameter Constraints (for Skill templates)

Apply these token constraints when generating Dark Mode `:root` blocks:

### A) Professional Consulting — Dark Mode fixed values
- `--color-ocean: #051C2C`
- `--color-province-default: #162B38`
- `--color-card-bg: #051C2C`

### B) All styles — Dark Mode stat value rule
- Insight-card numeric metrics use main text color:
  - `--color-stat-value: var(--color-text)`

### C) Highlight mapping rules (required)
- `--color-chart-primary`: chart-page highlight color (map/chart side).
- `--color-text-primary`: non-chart-page highlight color (hero/lede/ending/pure text).

Chart pages (`.scrolly` cards) must use `--color-chart-primary` for:
- `.card__label`
- `.card__label--accent`
- `.card__divider`
- `.card__divider--accent`
- `.card__text strong`

Non-chart pages must use `--color-text-primary` for emphasis roles.

`--color-chart-primary` must be runtime-synced to the active map/chart highlight in each step, not hardcoded to “palette color #1”.

# Layout Matrix Reference

Determines hero layout, image sourcing strategy, and ending layout based on user-selected **Purpose** and **Style**.

---

## Hero Decision Matrix (Purpose x Style)

| Purpose \ Style | Professional Consulting | Data Journalism | Innovative Modern |
|---|---|---|---|
| **Pitch deck** | `image-diagonal` / stock->ai | `image-top` / stock->ai | `image-overlap` / ai-gen |
| **Internal** | `text-left` / css-only | `image-top` / stock->ai | `text-center` / css-only |
| **Conference** | `image-split` / stock->ai | `image-top` / stock->ai | `image-bg` / ai-gen |

Each cell: `hero-variant` / `image-source`

**Rules:**
- All Data Journalism cells use `image-top` with centered text on white background (including Internal)
- `stock->ai` means: search stock photos first, auto-fallback to AI generation if no suitable result
- User-provided image always overrides any auto-sourcing strategy
- `css-only` means: no image, CSS gradient/color background only
- `ai-gen` means: always use ImageGen (no stock search)

---

## Ending Decision (Style only)

| Style | Ending Variant | Description |
|---|---|---|
| Professional Consulting | `ending--cta` | Summary paragraph + 3 action items with arrow markers |
| Data Journalism | `ending--summary` | Centered thick rule + single summary paragraph |
| Innovative Modern | `ending--cards` | 2x2 translucent glass cards on dark background |

Purpose only changes ending **content** (recommendations vs findings vs outlook), not layout structure.

---

## Hero Layout Variants

### 1. `hero--text-center` (existing default)

No image. Centered text on CSS gradient background.
**Used for:** Modern Internal.

```html
<section class="hero hero--text-center">
    <p class="hero__overtitle">{OVERTITLE}</p>
    <h1 class="hero__title">{TITLE}</h1>
    <p class="hero__subtitle">{SUBTITLE}</p>
    <div class="hero__scroll-hint">
        <span>Scroll down</span>
        <div class="arrow"></div>
    </div>
</section>
```

No additional CSS needed — uses base `.hero` styles.

### 2. `hero--text-left`

No image. Left-aligned text with accent bar divider.
**Used for:** Consulting Internal.

```html
<section class="hero hero--text-left">
    <p class="hero__overtitle">{OVERTITLE}</p>
    <h1 class="hero__title">{TITLE}</h1>
    <div class="hero__accent-bar"></div>
    <p class="hero__subtitle">{SUBTITLE}</p>
    <div class="hero__scroll-hint">
        <span>Scroll down</span>
        <div class="arrow"></div>
    </div>
</section>
```

### 3. `hero--image-top`

Image ~58vh top region, centered text below on white background.
**Used for:** ALL Data Journalism cells (Pitch, Internal, Conference).

```html
<section class="hero hero--image-top">
    <div class="hero__image-region">
        <img class="hero__image" src="data:image/jpeg;base64,{BASE64}" alt="{ALT}">
        <div class="hero__image-overlay"></div>
    </div>
    <div class="hero__text-region">
        <p class="hero__overtitle">{OVERTITLE}</p>
        <h1 class="hero__title">{TITLE}</h1>
        <p class="hero__subtitle">{SUBTITLE}</p>
    </div>
    <div class="hero__scroll-hint">
        <span>Scroll down</span>
        <div class="arrow"></div>
    </div>
</section>
```

Image dimension: `1792x1024` (landscape). Overlay fades to white at bottom. Text region has white background, centered alignment.

### 4. `hero--image-diagonal`

Diagonal clip-path: image left with angled edge, text right on dark background.
**Used for:** Consulting Pitch.

```html
<section class="hero hero--image-diagonal">
    <div class="hero__diag-image">
        <img class="hero__image" src="data:image/jpeg;base64,{BASE64}" alt="{ALT}">
        <div class="hero__image-overlay"></div>
    </div>
    <div class="hero__diag-text">
        <p class="hero__overtitle">{OVERTITLE}</p>
        <h1 class="hero__title">{TITLE}</h1>
        <p class="hero__subtitle">{SUBTITLE}</p>
    </div>
    <div class="hero__scroll-hint">
        <span>Scroll down</span>
        <div class="arrow"></div>
    </div>
</section>
```

Image dimension: `1024x1536` (portrait). Mobile: stacks vertically.

**CSS overrides (append after base):** The base `viewport-base.css` defaults (`.hero__diag-image` width `55%`, clip `62%→42%`) produce a visible image area of only ~28% of the page — too narrow. Always override with the following to achieve the intended ~45% visible image width and visually centered text:

```css
/* Widen diagonal image to fill ~45% of viewport */
.hero__diag-image {
    width: 62%;
    clip-path: polygon(0 0, 78% 0, 60% 100%, 0 100%);
}
/* Pull text area left so content centers in the visual right zone.
   Rationale: image div ends at 62%, but visible diagonal ends at ~42–48%,
   so text div starts 14–20% too far right. Negative margin corrects this. */
.hero__diag-text {
    margin-left: -16%;
    padding: 4rem 7% 4rem 7%;
    align-items: flex-start;
    text-align: left;
    z-index: 1;
}
.hero--image-diagonal .hero__title  { text-align: left; max-width: 480px; }
.hero--image-diagonal .hero__subtitle { text-align: left; }
```

### 5. `hero--image-split`

Two-column grid: image 45% left, text 55% right.
**Used for:** Consulting Conference.

```html
<section class="hero hero--image-split">
    <div class="hero__split-image">
        <img class="hero__image" src="data:image/jpeg;base64,{BASE64}" alt="{ALT}">
        <div class="hero__image-overlay"></div>
    </div>
    <div class="hero__split-text">
        <p class="hero__overtitle">{OVERTITLE}</p>
        <h1 class="hero__title">{TITLE}</h1>
        <div class="hero__split-divider"></div>
        <p class="hero__subtitle">{SUBTITLE}</p>
    </div>
    <div class="hero__scroll-hint">
        <span>Scroll down</span>
        <div class="arrow"></div>
    </div>
</section>
```

Image dimension: `1024x1536` (portrait). Mobile: collapses to stacked layout.

### 6. `hero--image-overlap`

Dark background, rounded-corner image left ~48%, title overlaps image right edge, subtitle below-right.
**Used for:** Modern Pitch.

```html
<section class="hero hero--image-overlap">
    <div class="hero__overlap-image">
        <img class="hero__image" src="data:image/jpeg;base64,{BASE64}" alt="{ALT}">
    </div>
    <div class="hero__overlap-text">
        <h1 class="hero__title">{TITLE}</h1>
        <p class="hero__subtitle">{SUBTITLE}</p>
    </div>
    <div class="hero__scroll-hint">
        <span>Scroll down</span>
        <div class="arrow"></div>
    </div>
</section>
```

Image dimension: `1024x1536` (portrait). Rounded corners (10px), padding from edges. Title with negative margin overlapping image edge. Mobile: stacks vertically.

### 7. `hero--image-bg`

Full-bleed image background with dark overlay, centered text.
**Used for:** Modern Conference.

```html
<section class="hero hero--image-bg">
    <img class="hero__bg-image" src="data:image/jpeg;base64,{BASE64}" alt="{ALT}">
    <div class="hero__bg-overlay"></div>
    <div class="hero__bg-content">
        <p class="hero__overtitle">{OVERTITLE}</p>
        <h1 class="hero__title">{TITLE}</h1>
        <p class="hero__subtitle">{SUBTITLE}</p>
    </div>
    <div class="hero__scroll-hint">
        <span>Scroll down</span>
        <div class="arrow"></div>
    </div>
</section>
```

Image dimension: `1792x1024` (landscape). Overlay gradient uses preset background color at varying opacity.

---

## Ending Layout Variants

### 1. `ending--cta` (Professional Consulting)

Summary paragraph followed by 3 action items with arrow markers. Light background.

```html
<section class="ending ending--cta" id="ending">
    <div class="ending__inner">
        <p class="ending__label">{LABEL: RECOMMENDATIONS / STRATEGIC OUTLOOK / NEXT STEPS}</p>
        <h2 class="ending__title">{TITLE}</h2>
        <div class="ending__divider"></div>
        <p class="ending__cta-summary">{SUMMARY PARAGRAPH}</p>
        <div class="ending__actions">
            <div class="ending__action">
                <div class="ending__action-marker">&rarr;</div>
                <div class="ending__action-body">
                    <h3 class="ending__action-title">{ACTION TITLE}</h3>
                    <p class="ending__action-text">{ACTION DESCRIPTION}</p>
                </div>
            </div>
            <!-- Repeat for 3 action items -->
        </div>
        <div class="ending__footnote">{DATA SOURCE / DATE}</div>
    </div>
</section>
```

Style: Light background (#F7F7F7), serif title, navy accents, arrow markers aligned left.

### 2. `ending--summary` (Data Journalism)

Centered thick horizontal rule above a single summary paragraph. Minimal editorial style.

```html
<section class="ending ending--summary" id="ending">
    <div class="ending__inner ending__inner--centered">
        <div class="ending__rule"></div>
        <p class="ending__summary-text">
            {Single summary paragraph with <em>italic emphasis</em> for key phrases.}
        </p>
        <div class="ending__footnote">{DATA SOURCE / DATE}</div>
    </div>
</section>
```

Style: Warm off-white background (#FAF9F6), centered alignment, thick 3px black horizontal rule, single bold serif paragraph. No numbered items, no section label/title. NYT-editorial minimal.

### 3. `ending--cards` (Innovative Modern)

2x2 translucent glass cards on dark background with numbered items.

```html
<section class="ending ending--cards" id="ending">
    <div class="ending__inner">
        <p class="ending__label">{LABEL: NEXT STEPS / STRATEGY / WHAT'S NEXT}</p>
        <h2 class="ending__title">{TITLE}</h2>
        <div class="ending__divider"></div>
        <div class="ending__cards-grid">
            <div class="ending__card">
                <p class="ending__card-num">01</p>
                <h3 class="ending__card-title">{CARD TITLE}</h3>
                <p class="ending__card-text">{CARD DESCRIPTION}</p>
            </div>
            <div class="ending__card">
                <p class="ending__card-num">02</p>
                <h3 class="ending__card-title">{CARD TITLE}</h3>
                <p class="ending__card-text">{CARD DESCRIPTION}</p>
            </div>
            <div class="ending__card">
                <p class="ending__card-num">03</p>
                <h3 class="ending__card-title">{CARD TITLE}</h3>
                <p class="ending__card-text">{CARD DESCRIPTION}</p>
            </div>
            <div class="ending__card">
                <p class="ending__card-num">04</p>
                <h3 class="ending__card-title">{CARD TITLE}</h3>
                <p class="ending__card-text">{CARD DESCRIPTION}</p>
            </div>
        </div>
        <div class="ending__footnote">{DATA SOURCE / DATE}</div>
    </div>
</section>
```

Style: Dark background (#0F172A), white/light text. Cards use `rgba(255,255,255,0.06)` bg + `border: 1px solid rgba(255,255,255,0.08)` + `border-radius: 8px`. Numbers alternate indigo (#6366F1) / amber (#F59E0B). Gradient divider bar.

---

## Image Sourcing

### Priority Cascade

1. **User-provided image** — always takes priority over any auto-sourcing
2. **Matrix says `css-only`** — skip image sourcing entirely
3. **Matrix says `stock->ai`** — search stock photos via WebSearch (`site:unsplash.com {theme} {mood}`); if no suitable result found, auto-fallback to ImageGen
4. **Matrix says `ai-gen`** — use ImageGen directly (no stock search)

### ImageGen Dimensions per Variant

| Hero Variant | ImageGen Size | Orientation |
|---|---|---|
| `image-top` | `1792x1024` | landscape |
| `image-diagonal` | `1024x1536` | portrait |
| `image-split` | `1024x1536` | portrait |
| `image-overlap` | `1024x1536` | portrait |
| `image-bg` | `1792x1024` | landscape |

### Stock Photo Workflow

1. Search: `site:unsplash.com {theme_keyword} {mood_descriptor}` derived from the data narrative
2. Prefer atmospheric/abstract images over literal/obvious representations
3. Download at ~1200-1800px width, convert to base64, inline as `data:image/jpeg;base64,...`
4. If no suitable result after review — auto-fallback to AI generation

### AI Generation Workflow

1. Construct prompt: `"Abstract, atmospheric {theme}. {mood}. Clean composition, {color_palette}. Editorial photography style, no text, no UI elements."`
2. Use ImageGen with the dimension from the table above
3. Convert result to base64, inline as `data:image/jpeg;base64,...`

### Base64 Inlining

All images (stock, AI-generated, or user-provided) must be base64-encoded and inlined directly in the HTML `src` attribute. This preserves the zero-dependency, single-file principle. Format: `src="data:image/{format};base64,{data}"` where format is `jpeg` or `png`.
