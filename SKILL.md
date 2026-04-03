---
name: scrolly-stories
description: Generate scrollytelling data story web pages with interactive map visualizations from geographic data. Creates professional data narratives with D3.js maps, scroll-driven animations, and smart tooltips. Supports China and USA maps with multiple visual styles. Use when the user wants to create a data story, scrollytelling page, map visualization, geographic data narrative, or interactive data report.
---

# Scrolly-Stories

Generate zero-dependency, scrollytelling data story web pages with interactive map visualizations. Transforms geographic data into professional, scroll-driven data narratives that non-analysts can produce and share.

## Core Principles

1. **Zero Dependencies** — Single HTML files with inline CSS/JS. Only external CDN: D3.js (and topojson-client for USA maps). No npm, no build tools.
2. **Distinctive Design** — No generic "AI slop." Every page must feel custom-crafted with purposeful color, typography, and animation choices.
3. **Data-Driven Storytelling** — Every visual decision (zoom target, color scheme, narrative flow) is traced back to the data. The story emerges from the numbers.
4. **Programmatic Camera** — The narrative controls the map camera. No user zoom/pan — the scroll position drives all map state changes.
5. **Viewport-Locked Steps** — Each scroll step = 100vh. For Professional Consulting and Innovative Modern: page snapping with fade-in cards (card-reveal mode). For Data Journalism: free continuous scrolling with scroll-through editorial panels (center-scroll mode). See [SCROLL_MODES.md](SCROLL_MODES.md).

## Supported Maps

| Country | Levels | Data Source | Projection |
|---------|--------|-------------|------------|
| China | Province, City, County | Province: bundled GeoJSON. City/County: DataV API at generation time | Pre-projected Mercator (clockwise winding workaround) |
| USA | State, County | Bundled TopoJSON (us-atlas) | `d3.geoAlbersUsa()` |

Other countries are not currently supported for map visualization. If the user's data is from an unsupported country, offer a charts-only fallback (no map).

---

## Phase 1: Requirement Collection

### Step 1.1: Read User Data

Accept data in these formats:
- **CSV file** — read with appropriate parsing
- **Excel file (.xlsx)** — read with a Python script or instruct user to export as CSV
- **JSON file** — read directly
- **Manual input** — user provides data inline in conversation

After reading data, identify:
- Column names / data fields
- Row count (number of geographic regions)
- Numeric fields (candidates for visualization metrics)
- Geographic name field (province/state/county names)

### Step 1.2: Auto-Detect Country

Match the geographic names in user data against the name maps in the geo-config files:

1. Read [templates/engines/geo-configs/china.js](templates/engines/geo-configs/china.js) — extract `nameMap` values (short names like 北京, 上海, 广东)
2. Read [templates/engines/geo-configs/usa.js](templates/engines/geo-configs/usa.js) — extract `stateNames` keys and values (California/CA, Texas/TX, etc.)
3. Count matches against each country's name list
4. The country with more matches wins. If ambiguous (< 50% match rate for both), ask the user.

**If neither country matches (unsupported country):**

Use AskUserQuestion:
```
Question 0 — Out of Scope (header: "Country"):
"检测到的地理数据暂不支持地图可视化，是否去除地图继续生成数据报告？"
Options:
  - "好的，继续生成数据报告" → Proceed without map, use basic chart visualizations
  - "不了，退出" → End the skill
```

### Step 1.3: User Preferences

Ask all preference questions in a **single AskUserQuestion call**:

```
Question 1 — Purpose (header: "Purpose"):
"这份数据故事的应用场景是？"
Options:
  - "Pitch deck — 外部提案演示"
  - "Internal presentation — 内部汇报"
  - "Conference talk — 会议演讲"

Question 2 — Vibe (header: "Vibe"):
"你希望报告采用哪种视觉风格？"
Options:
  - "冷静专业咨询风格 — Professional, Trustworthy"
  - "数据新闻风格 — Clear, 强对比"
  - "活力创新现代风格 — Innovative, Bold"

Question 3 — Color Mode (header: "Color"):
"配色模式偏好？"
Options:
  - "浅色模式 (Light)"
  - "深色模式 (Dark)"
```

After collecting Purpose + Style + Color Mode, consult [LAYOUT_MATRIX.md](LAYOUT_MATRIX.md) to determine:
- The **hero layout variant** (e.g. `image-top`, `image-diagonal`, `text-center`)
- The **image sourcing strategy** (e.g. `stock->ai`, `ai-gen`, `css-only`)
- The **ending layout variant** (determined by style only)

Then consult [STYLE_PRESETS.md](STYLE_PRESETS.md) to select the correct `:root` block (Light Mode Colors or Dark Mode Colors) and any mode-specific Hero CSS or overrides.

**If the hero variant requires an image** (any variant except `text-center` and `text-left`), ask an additional question:

```
Question 4 — Hero Image (header: "Hero Image"):
"首页需要配图，是否有想使用的图片？"
Options:
  - "没有，自动生成/搜索" → Use the matrix's image sourcing strategy
  - "有，我提供图片" → Wait for user to provide image path
```

### Step 1.4: Narrative Input (Optional)

If the user provides a narrative strategy document (text file, notes, or inline description), read it and use it as the basis for Phase 3. If no narrative is provided, auto-generate in Phase 3.

---

## Phase 2: Data Parsing & Geo-Matching

### Step 2.1: Read Geo-Config

Based on the detected country, read the appropriate geo-config file:
- China: [templates/engines/geo-configs/china.js](templates/engines/geo-configs/china.js)
- USA: [templates/engines/geo-configs/usa.js](templates/engines/geo-configs/usa.js)

### Step 2.2: Match Data to GeoJSON

For each row in the user's data:
1. Extract the geographic name field
2. Attempt exact match against the geo-config's `nameMap` (both keys and values)
3. If no exact match: try case-insensitive, try common variants (with/without suffix like 省/市/State), try abbreviations
4. Record: matched names, unmatched names

**Report to user:**
- "已匹配 X/Y 个地区" (Matched X of Y regions)
- List any unmatched names with suggested corrections
- If >20% unmatched: AskUserQuestion to clarify the mapping

### Step 2.3: Compute Statistics

Calculate key metrics from the matched data:
- Total, mean, median, min, max for each numeric field
- Rank ordering (top N, bottom N)
- Regional aggregations (using the geo-config's `regions` groupings)
- Percentage breakdowns (top 3 share, above/below threshold counts)
- Outliers (values > 2 standard deviations from mean)

These statistics feed into the narrative generation in Phase 3.

---

## Phase 3: Narrative Structure Design

The output always follows this structure: **Hero → [Lede (DJ only)] → Data Story Steps → Ending**

### Step 3.0: Design Hero Title & Overtitle

#### Hero Title
The page title (`.hero__title`) must reflect the **core insight or tension in the data**, not describe the document format. The tone adapts to purpose:

| Purpose | Tone | Examples |
|---------|------|---------|
| **Conference talk** | Official, broad, authoritative — sets the stage for a room-sized audience | "中国零售行业：东强西弱格局下的机遇与挑战" / "The Geography of Growth: America's Retail Divide" |
| **Pitch deck** | Punchy, provocative, investor-facing — creates urgency or frames a clear opportunity | "珠三角吃掉三成市场，剩余版图怎么抢？" / "One Region, 30% of Revenue — and It's Just Getting Started" |
| **Internal presentation** | Analytical, precise, can use insider language — addresses the team or leadership directly | "2024 零售版图：规模洼地与利润高地的结构性背离" / "Where We Win and Why: A Data-Driven Territory Review" |

**Hard rules:**
- Never default to generic labels like "数据交互报告"、"数据分析报告"、"Interactive Data Story" — these describe the medium, not the message
- Title should name a finding, a tension, or a strategic frame; not the topic category
- Length: 12–28 characters (Chinese) or 6–12 words (English)
- If user provides a title verbatim, use it unchanged

#### Hero Overtitle (label badge above the title)
The `.hero__overtitle` label is a short, capsule-style tag that anchors the story in **time and domain**, not in the presentation format or purpose.

**Rules:**
- Include a year or time range when available in the data (e.g. `2024`, `Q1–Q3 2024`, `FY2023`)
- Include the industry or domain (e.g. `RETAIL ANALYTICS`, `SUPPLY CHAIN`, `REGIONAL SALES`)
- Keep it concise — typically 2–5 words, ALL CAPS
- Do NOT name the purpose/format: `CONFERENCE PRESENTATION`, `PITCH DECK`, `INTERNAL REPORT` are all wrong
- Good examples: `2024 RETAIL ANALYTICS` · `FY2023 · SALES INTELLIGENCE` · `Q4 REGIONAL REVIEW` · `2024零售行业洞察`

### Step 3.1: Design Narrative

**If user provided a narrative strategy:** Follow their structure, mapping each story beat to a scroll step. Fill in data details and suggest enhancements.

**If auto-generating:** Apply this analysis framework (select 4-8 from these patterns, max 10 story pages total):

| Pattern | Description | Map Action |
|---------|-------------|------------|
| **Overview** | Show overall distribution with choropleth (preferred) or threshold highlight | Reset zoom, `colorOverviewChoropleth()` / `colorOverview()` |
| **Top Performer** | Highlight the #1 region, explain why | `zoomToProvince()`, `colorFocus()` |
| **Regional Cluster** | Identify geographic clusters of high/low values | Zoom to cluster center, highlight group |
| **Anomaly** | Spotlight unexpected outliers (high or low) | Zoom to outlier, `colorFocus()` |
| **Comparison** | Compare two regions or two metrics | Zoom to show both, dual coloring |
| **Trend Context** | If temporal data exists, show change over time | Overview with gradient coloring |
| **Summary** | Recap key findings, different threshold | Reset zoom, `colorOverview()` with accent color |
| **Outlook** | Forward-looking strategic recommendations | Reset zoom, overview coloring |

**Fallback narrative arc** (when no clear pattern emerges):
1. Overview: national/total landscape (always first)
2. Focus: top 1-3 performers
3. Focus: notable outlier or underperformer
4. Summary: key takeaways and thresholds (always last before ending)

### Step 3.1.5: Design Lede (Data Journalism only)

For Data Journalism style, write a **lede statement** — 1-2 bold sentences that set the context or framing for the data story. This page appears between the hero and the scrollytelling section. It answers "why should you care" before the data exploration begins.

- Derive the statement from the data's most significant finding or the broader context it exists within
- Use `<em>` for italic emphasis on key terms
- Keep it concise — one impactful paragraph, not a full article introduction
- See [SCROLL_MODES.md](SCROLL_MODES.md) for the lede HTML template and visual spec

### Step 3.2: Define Step Configurations

For each story step, define:

```javascript
{
    stepIndex: 0,                        // 0-based index
    type: 'overview' | 'focus',          // map behavior
    zoomTarget: null | 'Shanghai',       // null = reset zoom, string = zoom to region
    zoomTargets: null | ['CA','TX'],     // for multi-region comparison zoom
    colorScheme: 'overview-choropleth' | 'overview-threshold' | 'focus-single',
    thresholdField: 'sales',             // threshold field (for threshold overview only)
    thresholdValue: 2000,                // threshold value (for threshold overview only)
    choroplethField: 'sales',            // continuous choropleth metric
    choroplethMode: 'sequential' | 'diverging',
    choroplethMidpoint: null | 0,        // required when diverging
    highlightColor: 'primary' | 'accent',// which color to use
    legendItems: [{ color, text }],      // legend entries
    cardPosition: 'left' | 'right' | 'center',
    cardLabel: 'National Overview',      // section label
    cardTitle: '全国销售格局一览',         // headline
    cardContent: '...',                  // narrative paragraph (HTML with <strong>)
    // Card data display — mutually exclusive, both optional:
    stats: [{ value: '69,254', label: '全国总销售量' }],  // 2–3 KPI boxes
    chart: {                              // inline micro-chart (replaces stats when present)
        type: 'bar-rank',                 // see chart type table below
        field: 'sales',                   // which userData field to visualize
        regions: 'highlighted' | [...],   // 'highlighted' = step's focus regions; or explicit list
        maxItems: 5,                      // bar-rank / bar-column only — how many items to show
        highlightKey: 'San Diego',        // optional — marks the focus item; used by activateStepCharts to set highlight:true on that row (drives text color only, not bar color)
        timeField: 'month',               // sparkline only — x-axis field name
    }
    // Omit both stats and chart when the insight is purely qualitative
}
```

**Card data display — decision rules (stats vs chart vs neither):**

Apply exactly one of the three options per card. Default to none — only add when data genuinely clarifies the insight:

| Situation | Use |
|---|---|
| 2–3 isolated KPIs summarise the insight at a glance | `stats` |
| Insight involves ranking, comparison, trend, or distribution across ≥ 3 items | `chart` |
| Insight is qualitative / directional ("华东领跑全国") — numbers would add noise | neither |

**Chart type selection:**

| Type | When to use | Data shape |
|---|---|---|
| `bar-rank` | Ranking N regions/categories by a metric | `{ name, value }[]` sorted desc |
| `bar-column` | Distribution over time periods or categories (≤ 12 items) | `{ label, value }[]` |
| `sparkline` | Trend over time — direction matters more than exact values | `{ time, value }[]` |
| `donut-arc` | Single ratio or percentage (one number vs its complement) | `{ value, total }` |

**Card position rules for zoom steps (IMPORTANT):**
1. **Never use `card--center` for focus/comparison zoom steps** — it occludes the zoomed map content.
2. Place the card on the **opposite side** from the target region's geographic location on the map. E.g., California (left on US map) → `card--right`; Pennsylvania (right on US map) → `card--left`.
3. When zooming, the step handler must pass the matching `cardPosition` to `zoomToProvince(name, duration, cardPosition)` so the map content shifts to the side opposite the card, maximizing visible map area and maintaining visual balance.
4. Overview/reset-zoom steps can use any card position since the full map is visible.

**Exception — Data Journalism center-scroll mode:** Rules 1-4 above apply only to card-reveal mode (Professional Consulting, Innovative Modern). In center-scroll mode (Data Journalism), ALL steps use centered panels (enforced by CSS). Set `cardPosition: 'center'` for all step configs. The zoom functions receive `'center'`, resulting in zero horizontal offset — the map centers normally. This works because the text panel scrolls away between steps, giving a clear view of the focused region. See [SCROLL_MODES.md](SCROLL_MODES.md).
```

### Step 3.3: Design Ending Section

The ending layout variant is determined by **style only** (see [LAYOUT_MATRIX.md](LAYOUT_MATRIX.md)):

| Style | Ending Variant | Structure |
|---|---|---|
| Professional Consulting | `ending--cta` | Summary paragraph + 3 action items with arrow markers + footnote |
| Data Journalism | `ending--summary` | Centered thick rule + single summary paragraph + footnote |
| Innovative Modern | `ending--cards` | 2x2 translucent glass cards (numbered 01-04) + footnote |

Purpose only changes the **content** of the ending (e.g. recommendations for Pitch, findings for Internal, outlook for Conference), not the layout structure. Always include a footnote with data source and date.

### Step 3.4: Confirm with User

Present the narrative outline to the user. If auto-generated, use AskUserQuestion:
```
"Narrative" (header: "Story"):
"以下是自动生成的叙事结构，共 N 页。是否满意？"
Options:
  - "满意，开始生成"
  - "需要调整" → Ask for specific changes
  - "重新生成" → Re-run Phase 3
```

---

## Phase 4: Code Generation

### Step 4.1: Read Reference Files

Read these files in this order (last = freshest in context for generation):

| Order | File | Purpose |
|-------|------|---------|
| 1 | [LAYOUT_MATRIX.md](LAYOUT_MATRIX.md) | Determine hero variant, ending variant, and image sourcing strategy from Purpose x Style |
| 2 | [SCROLL_MODES.md](SCROLL_MODES.md) | Determine scroll mode (card-reveal vs center-scroll) and step HTML template |
| 3 | [STYLE_PRESETS.md](STYLE_PRESETS.md) | Extract chosen preset's CSS variables, typography, hero CSS, card CSS, signature elements |
| 4 | [templates/viewport-base.css](templates/viewport-base.css) | **Copy verbatim** into `<style>` block |
| 5 | [templates/scroll-framework.js](templates/scroll-framework.js) | Understand scroll interaction patterns to implement |
| 6 | [templates/engines/geo-map.js](templates/engines/geo-map.js) | Understand D3 map engine patterns to implement |
| 7 | [templates/engines/geo-configs/{country}.js](templates/engines/geo-configs/) | Get country-specific config (nameMap, projection, filters) |
| 8 | GeoJSON asset (see below) | **Read and inline** as JavaScript variable |

### Step 4.2: Read GeoJSON Asset

#### Supported geographic levels

| Country | Level | Source | Strategy |
|---------|-------|--------|----------|
| China | Province (省) | `assets/geojson/china/provinces.json` | Read file, inline |
| China | City (市) | DataV API `{adcode}_full.json` | **Fetch at generation time**, inline |
| China | County/District (区县) | DataV API with city adcode | **Fetch at generation time**, inline |
| USA | State | `assets/geojson/usa/states.json` | Read file, inline |
| USA | County | `assets/geojson/usa/counties.json` | Read file, inline |
| USA | City | Not supported | Aggregate to county/state, or charts-only |

#### ⚠️ Never use runtime `fetch()` for geo data

All geo assets — including sub-region data fetched from DataV API — **must be inlined at generation time** as JavaScript constants. Never emit a `fetch(datavApiUrl)` call in the generated HTML.

**Why:** The HTML is opened as a local `file://` URL. Browsers block all cross-origin `fetch()` from `file://` context. Runtime fetches will silently fail, producing a blank map with no error.

**How:** Use Python's `requests` (or `urllib`) during HTML generation to fetch and embed the data:
```python
import requests, json
url = f"https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json"
city_geojson = requests.get(url, timeout=10).json()
city_geojson_str = json.dumps(city_geojson, ensure_ascii=False)
# Embed as: const __inlineCityGeoJSON = <city_geojson_str>;
```

If the fetch fails at generation time, warn the user and fall back to province-level visualization for that region.

#### Sub-region projection alignment (critical)

Sub-region features (cities, counties) **must reuse the projection parameters computed from the parent province/state features**. Do NOT re-run `fitSize` or re-compute `tempProj` from sub-region features — that produces a different scale/translate, causing coordinates to misalign with the parent map.

The correct pattern in generated JS:
```javascript
// tempProj, projDx, projDy are computed once from province features (see geo-map.js Section 2)
// City features: apply the SAME projection parameters
function projectSubregionFeatures(features) {
    features.forEach(f => {
        projectCoordsInPlace(f.geometry, tempProj); // same tempProj as provinces
        shiftCoordsInPlace(f.geometry, projDx, projDy); // same centroid shift
    });
}
// Call immediately after inlining city data:
const cityGeoData = __inlineCityGeoJSON; // already embedded at gen time
projectSubregionFeatures(cityGeoData.features);
```

#### Multi-province city data

If the user's data contains cities from multiple provinces (e.g., a national city-level dataset), fetch ALL required province city GeoJSONs at generation time and merge the feature arrays:
```python
all_city_features = []
for province_name, adcode in needed_provinces.items():
    resp = requests.get(f"https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json", timeout=10)
    all_city_features.extend(resp.json()["features"])
merged = {"type": "FeatureCollection", "features": all_city_features}
```

#### Inline variable naming conventions

```javascript
const __inlineGeoJSON        = {...};  // China provinces (always present)
const __inlineCityGeoJSON    = {...};  // China cities for 1 province
const __inlineCityGeoJSONAll = {...};  // China cities merged across provinces
const __inlineTopoJSON       = {...};  // USA states or counties
```

**Important:** Always inline the **complete** boundary set for the base country level. Even if user data covers only 10 of 30 provinces, all province boundaries must be present to render a complete country outline.

#### Sub-region drill-down animation pattern

This pattern applies universally: China 省→市, 市→区, USA 州→县, etc. The geographic level determines the **variable naming** (use the target level's name as prefix), but the mechanics are identical at every depth.

**Naming convention by level:**

| Drill-down | Layer variable | Active flag | Hide helper | Label function | CSS class |
|---|---|---|---|---|---|
| Province → City | `cityLayer` | `cityLayerActive` | `hideCityLayer` | `updateCityLabels` | `.city-layer` / `.city-label` |
| City → District | `districtLayer` | `districtLayerActive` | `hideDistrictLayer` | `updateDistrictLabels` | `.district-layer` / `.district-label` |
| State → County (USA) | `countyLayer` | `countyLayerActive` | `hideCountyLayer` | `updateCountyLabels` | `.county-layer` / `.county-label` |

In code examples below, substitute the appropriate prefix for your drill-down level. The structure is identical.

---

**1. `zoomToRegion` / `zoomToProvince` — fillFactor param:**
The zoom function must accept an optional `fillFactor` param (default `0.45`). Drill-down steps pass `0.60–0.65` so the target region fills more viewport while the parent layer remains visible as gray context:
```javascript
function zoomToProvince(name, duration, cardPosition, fillFactor) {
    fillFactor = fillFactor || 0.45;
    const scale = Math.min(10, fillFactor / Math.max(dx/width, dy/height));
    ...
}
// Drill-down step: zoomToProvince('广东', 1800, 'left', 0.62);
// Normal focus step: zoomToProvince('广东', 1800, 'left'); // uses default 0.45
```

**2. `hide[Level]Layer(callback)` helper:**
Every step handler that leaves the drill-down step MUST call this before applying new map state. Pattern:
```javascript
function hideSubregionLayer(callback) {      // rename: hideCityLayer / hideCountyLayer / etc.
    if (!subregionLayerActive) { if (callback) callback(); return; }
    subregionLayer.transition().duration(400).ease(d3.easeCubicIn)
        .style('opacity', 0)
        .on('end', function() {
            subregionLayer.style('display', 'none');
            subregionLayerActive = false;
            if (callback) callback();
        });
}
// Every adjacent step handler wraps its logic in the callback:
stepHandlers[N] = function() {
    hideSubregionLayer(function() {
        parentLayer.style('display', 'block');
        // ... apply step N colors normally
    });
};
```

**3. Parent layer stays visible underneath:**
In the drill-down coloring function, do NOT hide the parent layer. Keep it visible as gray context — the sub-region layer renders on top. Give the focused parent region a near-invisible wash to show its boundary without competing with sub-region fills:
```javascript
parentLayer.style('display', 'block');
parentFeatures.transition().duration(500)
    .style('fill', d => isTargetRegion(d) ? 'rgba(35,82,255,0.04)' : C.default)
    .style('stroke', C.stroke).style('stroke-width', '0.4px').style('opacity', 1);
```

**4. Sub-region layer CSS + fade-in:**
```css
/* Replace .city-layer with .county-layer / .district-layer as appropriate */
.city-layer { display: none; opacity: 0; transition: opacity 0.6s ease; }
.city-label { pointer-events: none; dominant-baseline: middle; text-anchor: middle; }
```
```javascript
// Activate: set display:block first, then RAF so the transition fires
subregionLayer.style('display', 'block').style('opacity', 0);
requestAnimationFrame(function() {
    subregionLayer.transition().duration(600).ease(d3.easeCubicOut).style('opacity', 1);
});
```

#### Sub-region label system

Sub-region labels follow the **same rules as parent-level labels** but scoped to only highlighted features (those with user data). Implement as `update[Level]Labels(k)` and hook it into the parent `updateLabels(k)` function.

**Module-level storage** (required — cannot be scoped inside the init function):
```javascript
const subregionLabelData = [];  // mutable array, populated by initSubregionLayer
let subregionLabels = null;     // D3 text selection
```

**In `initSubregionLayer`:** populate `subregionLabelData` with `{ name, x, y, polyW, polyH }` (centroid + `path.bounds`). Sort descending by area — largest regions win in greedy overlap suppression. Create the D3 text selection with `style('display', 'none')`; visibility is driven entirely by `updateSubregionLabels`.

**`updateSubregionLabels(k)` rules (same as province, tighter range):**
- **Only show labels for highlighted regions** — those with a user data entry; hide all others
- **Font size anchored in screen px:** `const screenPx = Math.max(10, Math.min(15, d.polyH * k * 0.22)); d.fontSize = screenPx / k;`
- **Halo:** `stroke-width = Math.max(0.4, 1.5/k)` — stays ~1px on screen regardless of zoom
- **Greedy bbox overlap suppression** — identical algorithm to province labels
- **Label color:** white fill + dark halo for high-value (dark fill) regions; dark fill + light halo for light regions — derive from data value percentile
- **Hook into `updateLabels(k)`:** when `subregionLayerActive === true`, hide all parent-level labels and call `updateSubregionLabels(k)` — this runs automatically on every zoom event via the existing zoom handler

### Step 4.2.5: Source Hero Image (if needed)

If the hero variant requires an image (any variant except `text-center` and `text-left`), source the image now using the priority cascade from [LAYOUT_MATRIX.md](LAYOUT_MATRIX.md):

1. **User-provided** — If the user provided an image path in Step 1.3 Q3, read that file
2. **`stock->ai`** — Use WebSearch to find a suitable stock photo (`site:unsplash.com {theme} {mood}`). If no suitable result, fall back to ImageGen
3. **`ai-gen`** — Use ImageGen directly with an atmospheric/abstract prompt derived from the data narrative

**Important guardrails:**
- If user chooses “自动生成/搜索”, do NOT reuse any previously uploaded/local test image by default.
- Reuse a user-provided local image only when the user explicitly confirms reuse in this generation run.
- If image quality is poor, regenerate/fallback once; do not silently keep stale placeholders.

**Image dimensions** depend on the hero variant (see LAYOUT_MATRIX.md dimensions table). After obtaining the image, convert to base64 and prepare as an inline `data:image/jpeg;base64,...` string for embedding in the HTML.

### Step 4.3: Generate HTML

Generate a single self-contained HTML file with this structure:

```html
<!DOCTYPE html>
<html lang="{zh-CN or en}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{Story Title}</title>
    {Google Fonts link if preset requires it}
    <style>
        /* === Style Preset Variables === */
        :root { ... } /* From chosen STYLE_PRESETS.md preset — use Light or Dark Mode block based on user's color mode choice */

        /* === Viewport Base Styles === */
        {Full contents of viewport-base.css}

        /* === Preset-Specific Overrides === */
        {Hero CSS (mode-matched), Card CSS from preset's "append after base" sections}
        {If dark mode: include "Dark Mode Overrides" CSS block if preset defines one}
    </style>
</head>
<body>
    <!-- Loading -->
    <div class="loading-overlay" id="loading">...</div>

    <!-- Progress Bar (non-interactive reading indicator) -->
    <nav class="progress-bar" id="progressBar">
        <div class="progress-bar__fill" id="progressFill"></div>
    </nav>

    <!-- Hero Section — use variant-specific template from LAYOUT_MATRIX.md -->
    <!-- Example: hero--text-center (default, no image) -->
    <section class="hero hero--{variant}">
        {Variant-specific inner HTML — see LAYOUT_MATRIX.md for each variant's template}
        <div class="hero__scroll-hint" role="img" aria-label="{SCROLL_HINT_ARIA}">
            <div class="arrow" aria-hidden="true"></div>
        </div>
    </section>

    <!-- Lede (Data Journalism only) — context-setting intro before data exploration -->
    {If DJ: <section class="lede"><div class="lede__inner"><div class="lede__rule"></div><p class="lede__text">...</p></div></section>}

    <!-- Scrollytelling — add scrolly--center-scroll class for Data Journalism -->
    <section class="scrolly{' scrolly--center-scroll' if DJ}" id="scrolly">
        <div class="scroll__graphic" id="mapContainer">
            <div class="map-legend" id="mapLegend"></div>
            <div class="map-tooltip" id="mapTooltip"></div>
        </div>
        <div class="scroll__text">
            {For each step: <div class="step" data-step="N">...card...</div>}
            {Card-reveal: use card--left/card--right. Center-scroll: no position class.}
            {See SCROLL_MODES.md for step HTML templates per mode.}
        </div>
    </section>

    <!-- Ending Section — use variant-specific template from LAYOUT_MATRIX.md -->
    <section class="ending ending--{variant}" id="ending">
        {Variant-specific inner HTML — see LAYOUT_MATRIX.md for ending--cta / ending--summary / ending--cards}
    </section>

    <!-- Footer -->
    <footer class="footer">...</footer>

    <!-- Scripts -->
    <script src="https://d3js.org/d3.v7.min.js"></script>
    {If USA: <script src="https://cdn.jsdelivr.net/npm/topojson-client@3"></script>}
    <script>
    (function() {
        'use strict';

        /* === Inline Data === */
        const userData = { ... };       // User's data
        const __inlineGeoJSON = { ... }; // or __inlineTopoJSON for USA

        /* === Name Mapping === */
        const nameMap = { ... };         // From geo-config

        /* === Colors === */
        const C = { ... };              // Color references

        /* === Statistics (pre-computed) === */
        ...

        /* === Map Setup === */
        // SVG, zoom behavior, projection, drawing, labels, tooltip
        // (following patterns from geo-map.js)

        /* === Step Handlers === */
        const stepHandlers = { ... };    // Generated from Phase 3 step configs

        /* === Scroll Framework === */
        // IntersectionObserver, progress bar with section navigation, reveal, page snap (card-reveal only)
        // (following patterns from scroll-framework.js and SCROLL_MODES.md)
    })();
    </script>
</body>
</html>
```

### Step 4.4: Code Quality Rules

- Every section gets a clear `/* === SECTION NAME === */` comment
- **Do NOT** add `.is-active` to any step in HTML — let IntersectionObserver handle it
- All colors reference the `C` object (which uses CSS custom properties)
- Card positions alternate left/right unless the narrative specifies otherwise
- Step 0 card is always `card--left` or `card--center`
- **Never use `card--center` for focus/comparison zoom steps** — it occludes zoomed map content
- **For zoom steps, place the card on the opposite side from the target region's geographic position.** Pass the matching `cardPosition` string to `zoomToProvince(name, duration, cardPosition)` or `zoomToMultiple(names, duration, cardPosition)` so the map shifts away from the card.
- **Data Journalism center-scroll:** Add `scrolly--center-scroll` class to `.scrolly`. Do NOT include the page snap IIFE from scroll-framework.js Section 4. All step handlers use `'center'` for `cardPosition`. Step cards have no position class (no `card--left`/`card--right`). See [SCROLL_MODES.md](SCROLL_MODES.md).
- **Data Journalism lede page:** Include a `<section class="lede">` between hero and scrolly. Write 1-2 bold serif sentences that set context for the data story. See [SCROLL_MODES.md](SCROLL_MODES.md) for template.
- **Progress bar navigation:** Top progress bar is fill-only (non-interactive). Section wayfinding uses separate right-edge `.story-nav` dots (scroll-framework.js Section 8).
- **Step IDs + per-step nav dots:** Every step div must carry both `data-step="N"` and `id="step-N"`. The `.story-nav` must generate one `<a href="#step-N">` dot per step plus hero and ending — never just 3 section-level anchors. This lets IntersectionObserver track each step independently and gives users precise page wayfinding.
- **Scroll-down indicator:** Hero uses arrow-only hint (`.hero__scroll-hint` with `.arrow`), no visible text copy.
- **No unsolicited side panels:** Do NOT inject extra floating overlays (e.g., right-top ranking/related charts, mini bar panels) unless user explicitly requests them.
- Summary/outlook steps use `card__label--accent` and `card__divider--accent`
- **Labels must use text halo** — `viewport-base.css` provides `paint-order: stroke` on `.province-label`. The JS `updateLabelColors()` must set both `fill` and `stroke` (halo) colors adaptively. See geo-map.js Section 6 for the pattern.
- **USA map projection — always use `fitExtent`, never `fitSize`:** `fitSize([w*0.95, h*0.95])` anchors the bbox from (0,0), so the projected map starts at top-left and appears offset to the left in the viewport. Always use `fitExtent([[w*0.025, h*0.025], [w*0.975, h*0.975]])` — this centers the map within the viewport and ensures `resetZoom(d3.zoomIdentity)` restores the correct centered view. Do NOT chain `.translate()` after either fit method.
- **Light/Dark mode:** Each preset in STYLE_PRESETS.md defines two `:root` blocks (Light Mode Colors, Dark Mode Colors). Use the one matching the user's color mode choice from Step 1.3 Q3. Also select the matching Hero CSS block (Light vs Dark) and, where the preset defines separate Card CSS per mode (Innovative Modern does — card border color differs significantly), include the matching Card CSS block too. If the preset defines a "Dark Mode Overrides" block (e.g. Professional Consulting's ending text color revert), include it only when dark mode is selected.
- **Color architecture:** Text emphasis uses `--color-emphasis` (not `--color-primary` directly). Visualization fills use `--color-viz-1` through `--color-viz-N` — Innovative Modern defines 7 palette entries (`--color-viz-7`), others define 6 or fewer. Map highlight strokes use `--color-highlight-stroke-N` matching each viz color. The `C` object in JS should reference these variables. Backward compat aliases (`--color-primary`, `--color-focus`) are defined in presets for viewport-base.css compatibility.
- **image-split hero overtitle color:** For `hero--image-split`, the `.hero__split-text .hero__overtitle` override MUST use `color: var(--color-hero-emphasis)`. Do NOT use `var(--color-hero-overtitle)` — that is the dim semi-transparent white intended for secondary elements, not the label badge.
- **image-bg hero text rules:** For `hero--image-bg`, the overlay gradient must be strong enough to ensure readability: top 0.62, mid 0.72, bottom 0.85 opacity. The `.hero__overtitle` MUST use the theme highlight color as a solid pill background (`background: var(--color-text-primary, var(--color-emphasis))`) with white text (`color: #ffffff`) and `border-radius: 999px` — this keeps brand color visible while ensuring legibility on any photo. `.hero__title` needs `text-shadow: 0 2px 16px rgba(0,0,0,0.5)`. `.hero__subtitle` needs `text-shadow` + `line-height: 1.9` and `max-width: min(640px, 50vw)` to prevent the description from spanning the full viewport width. These overrides must be placed under `.hero--image-bg .hero__overtitle` etc., since the base `.hero__overtitle` uses `var(--color-text-primary)` which renders as the theme color (e.g. blue) and is invisible on dark photo backgrounds.
- **Hero title max-width:** Always use `max-width: min(880px, 65vw)` on `.hero__title` (not a fixed `px` value) so the title renders in ~2 lines on large screens without wrapping to 3+ lines. The `min()` function ensures it also contracts proportionally on smaller screens.
- **Hero subtitle max-width:** Always set `max-width: min(640px, 50vw)` on `.hero__subtitle` to prevent the description line from stretching full-width on widescreen displays.
- **Choropleth default:** For overview pages, prefer choropleth over binary threshold fills. Use sequential palette (low=light, high=dark) unless data is centered around a meaningful midpoint (then use diverging).
- **Choropleth legend — gradient ramp:** Use `setChoroplethLegend(label, loColor, hiColor, loVal, hiVal)` for all choropleth steps. The `loColor` MUST be computed via `choroplethLo(hiColor)` — the same opaque light tint used by `colorOverviewChoropleth()` — so the legend gradient matches the map fills exactly. Never pass a raw `rgba(r,g,b,0.15)` transparent value as `loColor`; transparent colors render differently on different backgrounds and will mismatch the map. Implement `choroplethLo` as: `d3.interpolateRgb('#ffffff', hiColor)(0.12)`.
- **Choropleth overview — full map with card:** For steps that show the entire map (no zoom) alongside a side card, use `resetZoomOverview(duration, cardPosition)` instead of `resetZoom()`. This scales the map to ~82% and offsets it away from the card side (10% of viewport width), so the card does not cover significant map content. `cardPosition='left'` → map shifts right; `cardPosition='right'` → map shifts left. See geo-map.js for the implementation pattern.
- **Normalization check:** If the metric is a raw count likely dominated by population/size, prefer normalized rates (per-capita, %, index) before choropleth rendering.
- **Card inline charts — implementation rules:**
  - **Library:** Use D3.js only — already loaded, zero extra weight, shares the `C` color object with the map.
  - **Container:** Add a `<div class="card__chart"></div>` after `.card__body` when a step config has `chart`. Never render both `.card__chart` and `.card__stats` in the same card. For **center-scroll (Data Journalism)** mode, also add class `card--has-chart` or `card--has-stats` to the card div, and wrap `card__label` + `card__title` + `card__body` in `<div class="card__text">` — this activates the two-column flex layout defined in the preset (text left, data right, both vertically centered).
  - **CSS:** `.card__chart { width: 100%; margin-top: 12px; } .card__chart svg { width: 100%; display: block; overflow: visible; }` — height set by chart type (bar-rank ≈ 20px × itemCount; sparkline ≈ 60px; donut-arc ≈ 80px).
  - **Colors:** All bars/lines use `var(--color-chart-primary)` — never `C.viz1` directly. This token is set by `setChartPrimary()` at each step activation, so charts automatically match the map's current highlight color. Background track uses `rgba(0,0,0,0.07)`. Never use opacity to distinguish rows — color encodes quantity, not interaction state.
  - **Labels:** Name left-aligned, value right-aligned. Name: `0.7rem`, `var(--color-text-secondary)`, `font-weight: 400` always. Value: `0.68rem`, `font-weight: 600` always, `var(--color-text)` always. The `highlight` field on a row only marks the top/focus item for the `activateStepCharts` caller — it no longer drives any visual difference in the rendered chart.
  - **Column widths (`bar-rank`):** Name column width = `maxNameLength × 14px` (fits longest CJK name tightly). Value column = fixed 58px. Column gap = 20px on each side of the bar area. Bar area = `totalWidth − nameW − valueW − 2 × 20px`. This eliminates large gaps when names are short.
  - **Animation:** Charts animate on card entrance with a staggered delay — bars grow from `width: 0` with `.delay((d,i) => enterDelay + i * 70).duration(520).ease(d3.easeCubicOut)`. Default `enterDelay = 300ms` so animation starts after the card has faded in. Trigger via `activateStepCharts(stepEl)` called from the IntersectionObserver step activation callback, same place as `fitStatValues`.
  - **Data binding:** Pull directly from `userData` (province/state level) or the relevant subregion data object — whichever is in scope for that step. Never hardcode chart values.
  - **`bar-rank` spec:** Horizontal bars, sorted descending. Row height 22px, row gap 6px, bar height 7px vertically centered. Cap at `maxItems` (default 5; **max 4 in center-scroll mode** to keep chart height ≤ 110px). SVG `width` set to `el.offsetWidth` at render time (not RAF) — geometry computed synchronously before appending elements.
  - **Center-scroll (Data Journalism) chart constraints:** All chart types must fit within the right column of the two-column card. `bar-rank` ≤ 4 items. `sparkline` height ≤ 70px. `donut-arc` height ≤ 90px. `bar-column` height ≤ 70px. The right column is `flex: 1 1 0` so width is available — height must be self-contained. Do not add `margin-top` to `.card__chart` in this mode (the CSS rule `margin-top: 0` overrides the base).
  - **`bar-column` spec:** Vertical bars, uniform width, x-axis labels below. All bars use `var(--color-chart-primary)`. No gridlines — only a baseline stroke.
  - **`sparkline` spec:** Single path, no axes. Start and end dots (3px radius). Highlight dot at peak/trough in `C.accent`. Area fill optional (`C.viz1` at 8% opacity below the line).
  - **`donut-arc` spec:** 180° arc (half-donut). Track in `rgba(0,0,0,0.06)`, fill in `C.viz1`. Large value label centered below arc. No legend needed.

- **Hover stroke — never hardcode:** Province and sub-region `mouseenter` handlers MUST use `C.hoverStroke` (→ `--color-province-hover-stroke`) for the hover border color, with `stroke-width: '0.8px'`. Never hardcode `'#333'` or `'1.5px'`. The `C` object must include `hoverStroke: 'var(--color-province-hover-stroke)'`. `mouseleave` restores `C.stroke` + default width (`0.6px` province / `0.5px` city). Hover is a subtle interaction hint — tooltip and fill carry the emphasis weight. Using `0.8px` (not `1px`) avoids zoom-multiplied thick borders at high k values.
- **Focus mode province opacity:** In `colorFocus()` and any inline multi-region focus coloring, non-highlighted provinces MUST use `opacity: 1`. Never apply `opacity: 0.45` — on light backgrounds (`--color-province-default: #F7F7F7`) this makes provinces nearly invisible against the white ocean. Use `C.default` fill at full opacity; the focused region distinguishes itself via its accent color and stroke weight alone.
- **Pan-then-color pattern for cross-region zoom transitions:** When a step handler transitions between two geographically distant focus regions (map must pan significantly), call `zoomToProvince/zoomToMultiple` immediately to start the pan, then wrap the province color transition inside `setTimeout(fn, 800–1000)` so the map arrives at the destination before highlights are applied. This prevents a "re-render" visual artefact where colors change mid-pan. Same-region transitions (e.g. province → city drill-down) and overview resets do not need this delay.
- **fitStatValues() — required utility:** Implement `fitStatValues(stepEl)` and call it from the IntersectionObserver step activation callback. Logic: (1) reset all `.stat__value` font-size to `''`, (2) in a `requestAnimationFrame`, for each `.card` find `.card__stats clientWidth`, compute `totalNatural = Σ scrollWidth of all stat values`, `totalNeeded = totalNatural + gap × (count−1)` — if `totalNeeded > availWidth`, compute `ratio = (availW − totalGap) / totalNatural` and apply the **same** scaled `font-size` to every stat value in that card (uniform shrink, clamp ≥ 11px). `white-space: nowrap` on `.stat__value` (now in viewport-base.css) ensures `scrollWidth` reflects single-line width correctly.
- **Nav dot dynamic theme — heroThemeObserver:** Inside `setupStoryNav()`, add an `IntersectionObserver` on `#hero` (threshold 0.05). When hero intersects: set `--story-nav-dot-inactive rgba(255,255,255,0.45)`, `--story-nav-dot-active rgba(255,255,255,0.9)`, `--story-nav-tip-bg rgba(0,0,0,0.15)`, `--story-nav-tip-color rgba(255,255,255,0.75)`. When hero exits: set `--story-nav-dot-inactive rgba(0,0,0,0.25)`, `--story-nav-dot-active rgba(0,0,0,0.75)`, `--story-nav-tip-bg rgba(255,255,255,0.15)`, `--story-nav-tip-color rgba(0,0,0,0.65)`. Initialise to dark-hero state (hero is in first viewport). Remove any hardcoded `.story-nav { --story-nav-dot-inactive: ... }` CSS override — all theming is JS-driven.
- Language: match the user's data language. Chinese data → Chinese UI. English data → English UI.
- Single-language UI rule: labels/titles/descriptions/insight text/data labels must be fully one language per page (all Chinese or all English).
- Color role rule: chart pages use `--color-chart-primary`; non-chart pages use `--color-text-primary`. Runtime map highlight must sync `--color-chart-primary`.
- **`setChartPrimary()` must always set TWO variables together:** `--color-chart-primary` (the full active color) AND `--color-chart-primary-bg` (a light opaque tint for card label pill backgrounds, computed as `choroplethLo(color)`). Never set only `--color-chart-primary` — the card label pill background will then stay frozen at the initial color. The `:root` default for `--color-chart-primary-bg` is a neutral fallback; it must be live-updated at each step. Pattern: `function setChartPrimary(color) { document.documentElement.style.setProperty('--color-chart-primary', color); document.documentElement.style.setProperty('--color-chart-primary-bg', choroplethLo(color)); }`. The `STYLE_PRESETS.md` Innovative Modern Light card CSS uses `background: var(--color-chart-primary-bg, ...)` for `.card__label` — this is intentional and requires the JS side to keep it updated.
- Data Journalism Chinese typography rule: for `lang="zh-CN"`, use CJK-first stacks (`Noto Serif SC`/`Noto Sans SC`) and include matching Google Fonts link.

---

## Phase 5: Preview & Export

### Step 5.1: Preview

Use `run_preview` to start a local HTTP server and open the generated HTML in the browser. Let the user scroll through the entire story.

### Step 5.2: Iterate (if needed)

If the user requests changes after preview, determine what to adjust:
- **Narrative changes** → Go back to Phase 3, regenerate step configs
- **Style changes** → Re-read STYLE_PRESETS.md with different preset, regenerate CSS
- **Data changes** → Go back to Phase 2, re-parse

### Step 5.3: Export

Use AskUserQuestion:
```
Question 3 — Export Path (header: "Save to"):
"文件保存到哪里？"
Options:
  - "Desktop" → Save to ~/Desktop/{StoryTitle}.html
  - "当前项目目录" → Save to current working directory
  - "选择其他目录" → Ask user for path
```

After saving, report:
- File path
- File size
- Number of story pages
- Style
- Features
- Open the file with the system default browser (`open` on macOS, `xdg-open` on Linux)

---

## Supporting Files Reference

| File | Type | Purpose | When to Read |
|------|------|---------|--------------|
| [LAYOUT_MATRIX.md](LAYOUT_MATRIX.md) | Design reference | Hero/ending variant matrix, image sourcing rules, HTML templates | Phase 1.3 (lookup) + Phase 4, Step 4.1 (first) |
| [SCROLL_MODES.md](SCROLL_MODES.md) | Design reference | Scroll mode rules (card-reveal vs center-scroll), step HTML templates | Phase 3.2 + Phase 4, Step 4.1 |
| [STYLE_PRESETS.md](STYLE_PRESETS.md) | Design reference | 3 visual style presets with CSS variables | Phase 4, Step 4.1 |
| [templates/viewport-base.css](templates/viewport-base.css) | Literal include | Base CSS for all outputs (includes all hero/ending variant styles) | Phase 4, Step 4.1 (include verbatim) |
| [templates/scroll-framework.js](templates/scroll-framework.js) | Code reference | Scroll interaction patterns | Phase 4, Step 4.1 |
| [templates/engines/geo-map.js](templates/engines/geo-map.js) | Code reference | D3 map engine (projection, labels, tooltip, zoom, coloring) | Phase 4, Step 4.1 |
| [templates/engines/geo-configs/china.js](templates/engines/geo-configs/china.js) | Config reference | China nameMap, projection, DataV API, regions | Phase 2 + Phase 4 |
| [templates/engines/geo-configs/usa.js](templates/engines/geo-configs/usa.js) | Config reference | USA nameMap, FIPS, AlbersUSA, TopoJSON handling | Phase 2 + Phase 4 |
| [assets/geojson/china/provinces.json](assets/geojson/china/provinces.json) | Data asset | China province boundaries (~570KB GeoJSON) | Phase 4, Step 4.2 (read & inline) |
| [assets/geojson/usa/states.json](assets/geojson/usa/states.json) | Data asset | USA state boundaries (~115KB TopoJSON) | Phase 4, Step 4.2 (read & inline) |
| [assets/geojson/usa/counties.json](assets/geojson/usa/counties.json) | Data asset | USA county boundaries (~842KB TopoJSON) | Phase 4, Step 4.2 (read & inline) |
