# USA Map Configuration Reference

This file is read by the LLM during code generation. It defines all USA-specific mapping configuration — name mappings, FIPS codes, projection method, TopoJSON handling, and regional groupings.

---

## Name Map

State name ↔ abbreviation mapping. Used for matching user data (which may use either form) to GeoJSON features.

```javascript
const stateNames = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
};

// Reverse map for lookup by abbreviation
const abbrToName = Object.fromEntries(
    Object.entries(stateNames).map(([name, abbr]) => [abbr, name])
);

function displayName(feature) {
    // us-atlas features use FIPS id, resolve via fipsToName
    return fipsToName[feature.id] || feature.properties.name || feature.id;
}
```

When matching user data, accept: full name, abbreviation, case-insensitive.

---

## FIPS Code Mapping

The us-atlas TopoJSON uses FIPS codes as feature IDs.

**State FIPS** (2-digit string):

```javascript
const fipsToState = {
    '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
    '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
    '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
    '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
    '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
    '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
    '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
    '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
    '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
    '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
    '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
    '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
    '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
};
```

**County FIPS** (5-digit string): first 2 digits = state, last 3 = county within state. Example: `'06037'` = Los Angeles County, California.

---

## Projection Method

**Use `d3.geoAlbersUsa()`** — a composite projection that handles the contiguous US, Alaska (scaled and repositioned), and Hawaii (repositioned).

```javascript
// Standard projection approach (NOT pre-projection like China)
const projection = d3.geoAlbersUsa()
    .fitSize([width, height], geoData);
const path = d3.geoPath(projection);
```

**Why NOT pre-projection?** Unlike China's DataV GeoJSON (clockwise winding issue), the us-atlas data uses standard counter-clockwise winding that D3 handles correctly. `geoAlbersUsa()` also composites Alaska and Hawaii, which pre-projection can't handle.

---

## TopoJSON Handling

The bundled data files (`states.json`, `counties.json`) are in **TopoJSON** format. Convert to GeoJSON features using topojson-client:

```html
<!-- Include alongside D3.js -->
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3"></script>
```

**State-level rendering:**

```javascript
// Convert TopoJSON to GeoJSON features
const stateFeatures = topojson.feature(topoData, topoData.objects.states).features;

// Get state borders as a single mesh (for stroke lines between states)
const stateBorders = topojson.mesh(topoData, topoData.objects.states, (a, b) => a !== b);

// Draw filled states
g.selectAll('path.state')
    .data(stateFeatures)
    .join('path')
    .attr('class', 'state')
    .attr('d', path)
    .style('fill', C.default)
    .style('stroke', C.stroke);

// Draw border mesh (single path, better performance than per-state strokes)
g.append('path')
    .datum(stateBorders)
    .attr('class', 'state-borders')
    .attr('d', path)
    .style('fill', 'none')
    .style('stroke', C.stroke)
    .style('stroke-width', '0.6px');
```

**County-level rendering:**

```javascript
const countyFeatures = topojson.feature(topoData, topoData.objects.counties).features;
const countyBorders = topojson.mesh(topoData, topoData.objects.counties, (a, b) => a !== b);

// County FIPS → state: first 2 digits
function countyToState(countyFips) {
    return fipsToState[countyFips.slice(0, 2)];
}
```

---

## Regional Groupings

Used for auto-narrative analysis.

```javascript
const regions = {
    'Northeast': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire',
                  'Rhode Island', 'Vermont', 'New Jersey', 'New York', 'Pennsylvania'],
    'Southeast': ['Alabama', 'Arkansas', 'Florida', 'Georgia', 'Kentucky',
                  'Louisiana', 'Mississippi', 'North Carolina', 'South Carolina',
                  'Tennessee', 'Virginia', 'West Virginia'],
    'Midwest': ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan',
                'Minnesota', 'Missouri', 'Nebraska', 'North Dakota',
                'Ohio', 'South Dakota', 'Wisconsin'],
    'Southwest': ['Arizona', 'New Mexico', 'Oklahoma', 'Texas'],
    'West': ['Alaska', 'California', 'Colorado', 'Hawaii', 'Idaho',
             'Montana', 'Nevada', 'Oregon', 'Utah', 'Washington', 'Wyoming']
};
```

---

## Small State Handling

These states have very small geographic area on the AlbersUSA projection. When zooming to them, enforce a minimum bounding dimension:

```javascript
const smallStates = [
    'Connecticut', 'Rhode Island', 'Delaware', 'New Jersey',
    'Maryland', 'District of Columbia', 'Massachusetts',
    'New Hampshire', 'Vermont', 'Hawaii'
];
// When computing zoom: dx = Math.max(dx, minDim); dy = Math.max(dy, minDim);
// where minDim = Math.min(width, height) * 0.06
```

---

## Label Considerations

- State labels use the **abbreviation** form (CA, TX, NY) at low zoom to avoid overlap
- At high zoom (focused state), switch to full name
- Alaska and Hawaii labels must respect their repositioned placement in AlbersUSA
