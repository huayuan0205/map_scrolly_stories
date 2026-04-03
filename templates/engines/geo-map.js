# Geo Map Engine Reference

This is the core D3.js map visualization engine. The LLM reads this as a **reference cookbook** during code generation — it documents the exact algorithms, patterns, and logic to implement. This is NOT a literal include file.

The engine handles: SVG setup, geographic projection, feature rendering, interactive labels, smart tooltips, programmatic zoom, and province/state coloring.

---

## 1. SVG Setup & Zoom Behavior

Create the SVG and D3 zoom behavior. User interaction is **disabled** — all zoom/pan is controlled programmatically by step handlers.

```javascript
const container = document.getElementById('mapContainer');
let svg, g, width, height;

width = container.clientWidth;
height = container.clientHeight;

svg = d3.select('#mapContainer')
    .append('svg')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRatio', 'xMidYMid meet');
g = svg.append('g');

/* rAF throttle for label/color updates during zoom animation */
let _labelRafId = 0;
const zoomBehavior = d3.zoom()
    .scaleExtent([1, 20])
    .filter(() => false) // disable user interaction
    .on('zoom', (event) => {
        g.attr('transform', event.transform);
        if (!_labelRafId && typeof updateLabels === 'function') {
            _labelRafId = requestAnimationFrame(() => {
                updateLabels(event.transform.k);
                updateLabelColors();
                _labelRafId = 0;
            });
        }
    });
svg.call(zoomBehavior);
```

**Why rAF throttle?** Without it, `updateLabels()` fires on every zoom animation frame (~60fps), causing page crashes. The rAF pattern ensures at most one update per frame.

---

## 2. Projection — China Path (Pre-Projection)

**When to use:** China GeoJSON from DataV (clockwise winding order).

DataV GeoJSON uses clockwise winding which D3 v7's antimeridian clipping misinterprets as globe-covering polygons. The workaround: project all coordinates to screen space first, then render with a null projection.

```javascript
/* Step 1: Find geographic bounding box by walking all coordinates */
var minLon = Infinity, maxLon = -Infinity,
    minLat = Infinity, maxLat = -Infinity;

geoData.features.forEach(function(f) {
    (function walk(c) {
        if (typeof c[0] === 'number') {
            if (c[0] < minLon) minLon = c[0];
            if (c[0] > maxLon) maxLon = c[0];
            if (c[1] < minLat) minLat = c[1];
            if (c[1] > maxLat) maxLat = c[1];
            return;
        }
        for (var i = 0; i < c.length; i++) walk(c[i]);
    })(f.geometry.coordinates);
});

/* Step 2: Build Mercator projection fitted to geographic extent */
var tempProj = d3.geoMercator().scale(1).translate([0, 0]);
var tl = tempProj([minLon, maxLat]);
var br = tempProj([maxLon, minLat]);
var projW = br[0] - tl[0];
var projH = br[1] - tl[1];
var projCx = (tl[0] + br[0]) / 2;
var projCy = (tl[1] + br[1]) / 2;

/* 1.12 = slight overfill for edge-to-edge map feel */
var fitScale = Math.min(width / projW, height / projH) * 1.12;
tempProj.scale(fitScale).translate([
    width  / 2 - fitScale * projCx,
    height / 2 - fitScale * projCy
]);

/* Step 3: Project all coordinates in-place to screen space */
geoData.features.forEach(function(f) {
    var geom = f.geometry;
    function projectRing(ring) {
        return ring.map(function(pt) {
            return tempProj(pt) || [0, 0];
        });
    }
    if (geom.type === 'Polygon') {
        geom.coordinates = geom.coordinates.map(projectRing);
    } else if (geom.type === 'MultiPolygon') {
        geom.coordinates = geom.coordinates.map(function(poly) {
            return poly.map(projectRing);
        });
    }
});

/* Step 3.5: Visual-centering correction (area-weighted centroid)
 * BBox centering can look left/up on China due to western envelope bias.
 * Recenter by area-weighted centroid for better visual balance.
 */
const tempPath = d3.geoPath(null);
let areaSum = 0, centroidX = 0, centroidY = 0;
geoData.features.forEach(function(f) {
    const a = Math.max(1, tempPath.area(f));
    const c = tempPath.centroid(f);
    if (!isNaN(c[0]) && !isNaN(c[1])) {
        areaSum += a;
        centroidX += c[0] * a;
        centroidY += c[1] * a;
    }
});
if (areaSum > 0) {
    const dx = width / 2 - centroidX / areaSum;
    const dy = height / 2 - centroidY / areaSum;
    geoData.features.forEach(function(f) {
        (function shift(c) {
            if (typeof c[0] === 'number') {
                c[0] += dx; c[1] += dy;
                return;
            }
            for (let i = 0; i < c.length; i++) shift(c[i]);
        })(f.geometry.coordinates);
    });
}

/* Step 4: Null projection — coordinates are already screen space */
const path = d3.geoPath(null);
```

---

## 3. Projection — USA Path (Standard)

**When to use:** US TopoJSON from us-atlas.

```javascript
/* Convert TopoJSON to GeoJSON */
const stateFeatures = topojson.feature(topoData, topoData.objects.states).features;
const stateBorders = topojson.mesh(topoData, topoData.objects.states, (a, b) => a !== b);

/* Standard AlbersUSA projection — use fitExtent with symmetric padding so the map
   centers at (width/2, height/2) and resetZoom(d3.zoomIdentity) produces a centered view.
   fitSize([w*0.95, h*0.95], ...) would instead anchor the bbox at (0,0), offsetting the map. */
const projection = d3.geoAlbersUsa()
    .fitExtent([[width * 0.025, height * 0.025], [width * 0.975, height * 0.975]],
               topojson.feature(topoData, topoData.objects.states));
const path = d3.geoPath(projection);
```

**Important:** Always use `fitExtent` with symmetric padding (e.g. 2.5% on each side) rather than `fitSize`. `fitSize([w*0.95, h*0.95])` anchors the feature bbox from (0,0), so the projected map starts at the top-left and appears offset. `fitExtent([[w*0.025,h*0.025],[w*0.975,h*0.975]])` centers the map within the viewport, matching the behavior of `resetZoom(d3.zoomIdentity)`.

Do NOT chain `.translate()` after `.fitExtent()`. The fit methods compute and set both `scale` and `translate` automatically.

**Note:** `geoAlbersUsa()` is a composite projection — Alaska and Hawaii are automatically scaled and repositioned. No special handling needed.

---

## 4. Feature Drawing

```javascript
const provinces = g.selectAll('path.province')
    .data(geoData.features)
    .join('path')
    .attr('class', 'province')
    .attr('d', path)
    .style('fill', C.default)
    .style('stroke', C.stroke)
    .style('stroke-width', '0.6px')
    .attr('cursor', 'default');
```

For USA, also draw border mesh as a single path for better performance:

```javascript
g.append('path')
    .datum(stateBorders)
    .attr('class', 'state-borders')
    .attr('d', path)
    .style('fill', 'none')
    .style('stroke', C.stroke)
    .style('stroke-width', '0.6px');
```

---

## 5. Metadata Cache

Compute and cache bounds and centroids for all features:

```javascript
const provinceMeta = {};
geoData.features.forEach(f => {
    const sn = shortName(f.properties.name);
    provinceMeta[sn] = {
        feature: f,
        bounds: path.bounds(f),
        centroid: path.centroid(f)
    };
});
```

---

## 6. Label System

The label system handles two modes: **overview** (all labels with overlap detection) and **focus** (only the focused region's label). Labels always use a **text halo** (SVG `paint-order: stroke`) for readability — this is the cartographic standard used by Mapbox, QGIS, and all professional mapping tools. The halo ensures text remains readable when labels extend beyond region boundaries or overlap mixed-color backgrounds.

### Label Data Preparation

```javascript
const labelData = geoData.features.map(f => {
    const sn = shortName(f.properties.name);
    const c = path.centroid(f);
    const meta = provinceMeta[sn];
    const [[bx0, by0], [bx1, by1]] = meta ? meta.bounds : [[0,0],[0,0]];
    return {
        name: sn,
        x: c[0], y: c[1],
        polyW: bx1 - bx0,
        polyH: by1 - by0,
        polyArea: (bx1 - bx0) * (by1 - by0)
    };
}).filter(d => !isNaN(d.x) && !isNaN(d.y));

/* Sort by area — larger regions get label priority */
labelData.sort((a, b) => b.polyArea - a.polyArea);

const labels = g.selectAll('text.province-label')
    .data(labelData)
    .join('text')
    .attr('class', 'province-label')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .text(d => d.name);
```

### Update Labels Function

```javascript
let darkProvinces = new Set();
let currentZoomK = 1;
let focusedProvince = null;

function updateLabels(k) {
    k = k || 1;
    currentZoomK = k;
    const CW = 0.65; // approximate character width ratio

    /* FOCUS MODE: only show focused region label */
    if (focusedProvince) {
        labelData.forEach(d => {
            d.visible = (d.name === focusedProvince);
            if (d.visible) {
                /* Scale to ~18% of polygon height on screen, clamped 12-20px */
                const polyScreenH = d.polyH * k;
                const screenPx = Math.max(12, Math.min(20, polyScreenH * 0.18));
                d.fontSize = screenPx / k;
            } else {
                d.fontSize = 0;
            }
        });
        labels
            .style('font-size', d => d.fontSize + 'px')
            .style('display', d => d.visible ? null : 'none');
        return;
    }

    /* OVERVIEW MODE: all labels with overlap detection */
    const baseSvg = 12 / k;
    labelData.forEach(d => {
        const maxW = d.polyW / (d.name.length * CW) * 0.8;
        const maxH = d.polyH * 0.32;
        d.fontSize = Math.max(0, Math.min(baseSvg, maxW, maxH));
    });

    /* Bounding boxes for overlap detection */
    labelData.forEach(d => {
        const tw = d.name.length * d.fontSize * CW;
        const th = d.fontSize * 1.3;
        d.bbox = {
            x0: d.x - tw / 2, x1: d.x + tw / 2,
            y0: d.y - th / 2, y1: d.y + th / 2
        };
    });

    /* Greedy overlap removal (larger provinces first) */
    const placed = [];
    labelData.forEach(d => {
        if (d.fontSize < 0.5) { d.visible = false; return; }
        const overlaps = placed.some(p =>
            d.bbox.x0 < p.bbox.x1 && d.bbox.x1 > p.bbox.x0 &&
            d.bbox.y0 < p.bbox.y1 && d.bbox.y1 > p.bbox.y0
        );
        d.visible = !overlaps;
        if (!overlaps) placed.push(d);
    });

    labels
        .style('font-size', d => d.fontSize + 'px')
        .style('display', d => d.visible ? null : 'none');
}
```

### Label Color & Halo System

The halo (text outline) is achieved via CSS `paint-order: stroke` set in `viewport-base.css`. The JS controls fill/stroke colors adaptively:

- **Dark region** (highlighted/focused): white text + dark semi-transparent halo
- **Light region** (default/dimmed): dark gray text + light semi-transparent halo
- **Halo width** scales inversely with zoom level so it stays visually constant on screen

```javascript
function updateLabelColors() {
    const haloW = Math.max(1, 2 / currentZoomK); // constant ~2px on screen

    labels
        .style('fill', d =>
            darkProvinces.has(d.name) ? '#FFFFFF' : '#555555'
        )
        .style('stroke', d =>
            darkProvinces.has(d.name)
                ? 'rgba(0,0,0,0.55)'      /* dark halo behind white text */
                : 'rgba(255,255,255,0.85)' /* light halo behind dark text */
        )
        .style('stroke-width', haloW + 'px');
}
```

**Why this works in all scenarios:**
- When a label (e.g., "District of Columbia") extends beyond its small highlighted polygon onto the light background: the dark halo creates a readable buffer around white text on both the dark polygon AND the light surrounding area.
- When labels sit on default/dimmed regions: the light halo creates contrast against the pale fill.
- The halo is symmetric around the text, so it works regardless of where the text extends.

**Key design decisions:**
- Focus mode: proportional sizing (18% of polygon height) prevents labels from being too small on large regions (Xinjiang) or too large on small regions (Shanghai)
- Overview mode: greedy overlap detection sorted by polygon area ensures the most important labels survive
- Character width ratio 0.65 is approximate but works well for both Chinese and English text
- Halo width inversely scales with zoom to maintain constant visual thickness (~3px on screen)

---

## 7. Tooltip System

8-direction smart positioning that avoids viewport edges and insight cards.

```javascript
const tooltip = document.getElementById('mapTooltip');

function positionTooltip(event) {
    const tw = tooltip.offsetWidth || 200;
    const th = tooltip.offsetHeight || 80;
    const GAP = 14;
    const mx = event.clientX;
    const my = event.clientY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* Get active card rect to avoid overlap */
    const activeCard = document.querySelector('.step.is-active .card');
    const cardRect = activeCard ? activeCard.getBoundingClientRect() : null;

    /* 8 candidates — top-right has default preference */
    const candidates = [
        { x: mx + GAP,      y: my - th - GAP, pref: 100 },  /* top-right (default) */
        { x: mx + GAP,      y: my + GAP,       pref: 0 },    /* bottom-right */
        { x: mx - tw - GAP, y: my - th - GAP, pref: 0 },    /* top-left */
        { x: mx - tw - GAP, y: my + GAP,       pref: 0 },    /* bottom-left */
        { x: mx + GAP,      y: my - th / 2,   pref: 0 },    /* right */
        { x: mx - tw - GAP, y: my - th / 2,   pref: 0 },    /* left */
        { x: mx - tw / 2,   y: my - th - GAP, pref: 0 },    /* top */
        { x: mx - tw / 2,   y: my + GAP,       pref: 0 }     /* bottom */
    ];

    let best = candidates[0];
    let bestScore = -Infinity;

    candidates.forEach(c => {
        let score = c.pref || 0;
        /* -1000 penalty for viewport overflow */
        if (c.x < 4 || c.x + tw > vw - 4 || c.y < 4 || c.y + th > vh - 4) {
            score -= 1000;
        }
        /* -500 penalty for overlapping the insight card */
        if (cardRect) {
            const hit = !(c.x + tw < cardRect.left - 8 || c.x > cardRect.right + 8 ||
                          c.y + th < cardRect.top - 8  || c.y > cardRect.bottom + 8);
            if (hit) score -= 500;
        }
        /* Minor penalty for distance from cursor */
        score -= (Math.abs(c.x + tw / 2 - mx) + Math.abs(c.y + th / 2 - my)) * 0.05;
        if (score > bestScore) { bestScore = score; best = c; }
    });

    tooltip.style.left = Math.max(0, Math.min(best.x, vw - tw)) + 'px';
    tooltip.style.top  = Math.max(0, Math.min(best.y, vh - th)) + 'px';
}
```

### Tooltip Event Handlers

```javascript
provinces
    .attr('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
        const sn = shortName(d.properties.name);
        const data = userData[sn]; // user's data object
        let html = '<div class="map-tooltip__name">' + sn + '</div>';
        if (data) {
            // Build rows from user's data fields
            Object.entries(data).forEach(([key, val]) => {
                if (key === 'region') return; // skip grouping field
                html += '<div class="map-tooltip__row"><span>' + metricLabels[key] +
                    '</span><span class="map-tooltip__val">' +
                    (typeof val === 'number' ? val.toLocaleString() : val) +
                    '</span></div>';
            });
        } else {
            html += '<div style="color:#999">No data</div>';
        }
        tooltip.innerHTML = html;
        tooltip.classList.add('is-visible');
        d3.select(this).style('stroke', '#333').style('stroke-width', '1.5px');
        positionTooltip(event);
    })
    .on('mousemove', positionTooltip)
    .on('mouseleave', function() {
        tooltip.classList.remove('is-visible');
        d3.select(this)
            .style('stroke', C.stroke)
            .style('stroke-width', '0.6px');
    });
```

---

## 8. Zoom Functions (Card-Aware)

Zoom functions accept an optional `cardPosition` parameter (`'left'`, `'right'`, or `'center'`) that offsets the zoom target away from the card to maximize visible map area and maintain visual balance.

**How the offset works:** When a card sits on one side, it occludes part of the viewport. The zoom target should be centered in the **remaining visible area**, not the full viewport. For a card occupying ~400px on one side, the effective center of the visible map area shifts by approximately `width * 0.12` in the opposite direction.

**Center-scroll mode (Data Journalism):** All step handlers pass `'center'` as `cardPosition`, resulting in `offsetX = 0` — the map centers normally. This works because center-scroll panels scroll away between steps, giving the user a clear centered view of the focused region. See [SCROLL_MODES.md](../../SCROLL_MODES.md).

```javascript
function zoomToProvince(name, duration, cardPosition) {
    duration = duration || 1800;
    cardPosition = cardPosition || 'left';
    const meta = provinceMeta[name];
    if (!meta) return;

    const [[x0, y0], [x1, y1]] = meta.bounds;
    let dx = x1 - x0;
    let dy = y1 - y0;

    /* Minimum visual size for small provinces */
    const minDim = Math.min(width, height) * 0.06;
    dx = Math.max(dx, minDim);
    dy = Math.max(dy, minDim);

    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const scale = Math.min(10, 0.45 / Math.max(dx / width, dy / height));

    /* Card-aware offset: shift zoom center to the side opposite the card */
    let offsetX = 0;
    const cardShift = width * 0.12; // ~12% of viewport width
    if (cardPosition === 'left')  offsetX =  cardShift;  // map content shifts right
    if (cardPosition === 'right') offsetX = -cardShift;  // map content shifts left

    const transform = d3.zoomIdentity
        .translate(width / 2 + offsetX, height / 2)
        .scale(scale)
        .translate(-cx, -cy);

    svg.transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, transform);
}
```

**Multi-region zoom** (for comparison steps showing two regions):

```javascript
function zoomToMultiple(names, duration, cardPosition) {
    duration = duration || 1800;
    cardPosition = cardPosition || 'left';

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    names.forEach(name => {
        const meta = provinceMeta[name];
        if (!meta) return;
        const [[x0, y0], [x1, y1]] = meta.bounds;
        if (x0 < minX) minX = x0;
        if (y0 < minY) minY = y0;
        if (x1 > maxX) maxX = x1;
        if (y1 > maxY) maxY = y1;
    });

    const dx = maxX - minX;
    const dy = maxY - minY;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const scale = Math.min(6, 0.55 / Math.max(dx / width, dy / height));

    let offsetX = 0;
    const cardShift = width * 0.12;
    if (cardPosition === 'left')  offsetX =  cardShift;
    if (cardPosition === 'right') offsetX = -cardShift;

    const transform = d3.zoomIdentity
        .translate(width / 2 + offsetX, height / 2)
        .scale(scale)
        .translate(-cx, -cy);

    svg.transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, transform);
}
```

**Card position choice rule for zoom steps:** When a step zooms to a specific region, the card should be on the **opposite side** from where the region appears on the map. If the region is on the left side of the map (e.g., California), the card should be `card--right`. If the region is in the center or spans both sides, use `card--left` or `card--right` (never `card--center` for zoom steps, as center cards block the map content).

```javascript
function resetZoom(duration) {
    duration = duration || 1800;
    svg.transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, d3.zoomIdentity);
}

// Overview reset: map is scaled slightly smaller (~82%) and nudged away from the card
// so it doesn't sit behind the insight card. Use this instead of resetZoom for any
// step that shows the full map (no zoom) while a side card is visible.
// cardPosition='left' → card is on left → map shifts right; 'right' → map shifts left.
function resetZoomOverview(duration, cardPosition) {
    duration = duration || 1800;
    cardPosition = cardPosition || 'left';
    const scale = 0.82;
    const shift = width * 0.10;
    const offsetX = cardPosition === 'left' ? shift : -shift;
    const tx = width  / 2 * (1 - scale) + offsetX;
    const ty = height / 2 * (1 - scale);
    svg.transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}
}
```

---

## 9. Coloring Functions

Two coloring modes: **overview** (threshold-based binary) and **focus** (single region highlighted).

```javascript
function setChartPrimary(color) {
    document.documentElement.style.setProperty('--color-chart-primary', color);
    // Sync the pill-background tint used by .card__label so it always matches the active chart color.
    // choroplethLo() must be defined before this function is called (it's a pure function, so order is fine).
    document.documentElement.style.setProperty('--color-chart-primary-bg', choroplethLo(color));
}

function colorOverview(thresholdField, thresholdValue, highlightColor) {
    setChartPrimary(highlightColor);
    focusedProvince = null;
    darkProvinces = new Set();

    Object.entries(userData).forEach(([name, d]) => {
        if (d[thresholdField] > thresholdValue) darkProvinces.add(name);
    });

    provinces.transition().duration(900).ease(d3.easeCubicOut)
        .style('fill', d => {
            const sn = shortName(d.properties.name);
            const data = userData[sn];
            return (data && data[thresholdField] > thresholdValue)
                ? highlightColor : C.default;
        })
        .style('stroke', C.stroke)
        .style('stroke-width', '0.6px')
        .style('opacity', 1);

    updateLabels(currentZoomK);
    updateLabelColors();
}

// Compute an opaque light tint so the choropleth start color
// matches the legend gradient exactly (no transparency mismatch).
function choroplethLo(hiColor) {
    return d3.interpolateRgb('#ffffff', hiColor)(0.12);
}

function colorOverviewChoropleth(metricField, highColor) {
    highColor = highColor || C.primary;
    setChartPrimary(highColor);
    focusedProvince = null;

    const loColor = choroplethLo(highColor);  // opaque light tint, consistent with legend
    const rows = Object.entries(userData);
    const values = rows
        .map(([, d]) => +d[metricField] || 0)
        .filter(v => !Number.isNaN(v));
    const lo = d3.min(values) ?? 0;
    const hi = d3.max(values) ?? 1;
    const t = d3.scaleLinear().domain([lo, hi]).range([0, 1]);

    // Mark visually strong regions for label contrast only.
    darkProvinces = new Set(
        rows
            .sort((a, b) => (+b[1][metricField] || 0) - (+a[1][metricField] || 0))
            .slice(0, Math.min(8, rows.length))
            .map(([name]) => shortName(name))
    );

    provinces.transition().duration(900).ease(d3.easeCubicOut)
        .style('fill', d => {
            const sn = shortName(d.properties.name);
            const hit = rows.find(([name]) => shortName(name) === sn);
            if (!hit) return C.default;
            const val = +hit[1][metricField] || 0;
            return d3.interpolateRgb(loColor, highColor)(Math.max(0, Math.min(1, t(val))));
        })
        .style('stroke', C.stroke)
        .style('stroke-width', '0.6px')
        .style('opacity', 1);

    updateLabels(currentZoomK);
    updateLabelColors();
}

function colorFocus(focusName) {
    setChartPrimary(C.focus);
    focusedProvince = focusName;
    darkProvinces = new Set([focusName]);

    provinces.transition().duration(700).ease(d3.easeCubicOut)
        .style('fill', d => {
            const sn = shortName(d.properties.name);
            return sn === focusName ? C.focus : C.default;
        })
        .style('stroke', d => {
            const sn = shortName(d.properties.name);
            return sn === focusName ? C.focusStroke : C.stroke;
        })
        .style('stroke-width', d => {
            const sn = shortName(d.properties.name);
            return sn === focusName ? '1.5px' : '0.4px';
        })
        .style('opacity', d => {
            const sn = shortName(d.properties.name);
            return sn === focusName ? 1 : 0.45;
        });

    updateLabels(currentZoomK);
    updateLabelColors();
}
```

---

## 10. Legend Helper

```javascript
function setLegend(items) {
    const legend = document.getElementById('mapLegend');
    legend.innerHTML = items.map(it =>
        '<div class="map-legend__item">' +
        '<div class="map-legend__swatch" style="background:' + it.color + '"></div>' +
        '<span>' + it.text + '</span></div>'
    ).join('');
}
```

---

## 11. Step Handler Pattern

Each step handler is a function that combines zoom, coloring, and legend updates. **Zoom steps must pass `cardPosition`** to align the map content with the available viewport space.

```javascript
const stepHandlers = {
    0: function() {
        /* Overview step — no zoom, card position doesn't affect map */
        resetZoom(1800);
        // Prefer choropleth for overview unless binary threshold is explicitly required.
        colorOverviewChoropleth('sales', C.primary);
        setLegend([
            { color: C.primary, text: 'Sales > 2,000' },
            { color: C.default, text: 'Sales <= 2,000' }
        ]);
    },
    1: function() {
        /* Focus step — pass card position so map shifts to the opposite side */
        zoomToProvince('Shanghai', 1800, 'right');  // card is on the right → map shifts left
        colorFocus('Shanghai');
        setLegend([{ color: C.focus, text: 'Shanghai' }]);
    },
    // ... more steps
};
```

**Card position rules for zoom steps:**
1. **Never use `card--center` for focus/comparison zoom steps** — it occludes the zoomed content.
2. Place the card on the **opposite side** from the target region's geographic location on the map. E.g., California (left on US map) → `card--right`; Pennsylvania (right on US map) → `card--left`.
3. Overview/reset-zoom steps can use any card position since the full map is visible.
4. Always pass the matching `cardPosition` string to `zoomToProvince()` or `zoomToMultiple()`.

---

## 12. Color Object Pattern

All colors are defined in a single object for consistency:

```javascript
const C = {
    default:     'var(--color-province-default)',
    stroke:      'var(--color-province-stroke)',
    primary:     'var(--color-primary)',
    accent:      'var(--color-accent)',
    focus:       'var(--color-focus)',
    focusStroke: 'var(--color-focus-stroke)',
    dimmed:      'var(--color-dimmed)',
    bg:          'var(--color-ocean)'
};
```

**Note:** When used in D3 `.style()` calls, CSS custom properties work correctly. The actual values come from the `:root` block set by the chosen style preset.
