# China Map Configuration Reference

This file is read by the LLM during code generation. It defines all China-specific mapping configuration — name mappings, projection method, feature filters, data sources, and regional groupings.

---

## Name Map

GeoJSON formal names → short display names. Used for matching user data to GeoJSON features and for label display.

```javascript
const nameMap = {
    '北京市': '北京',
    '天津市': '天津',
    '河北省': '河北',
    '山西省': '山西',
    '内蒙古自治区': '内蒙古',
    '辽宁省': '辽宁',
    '吉林省': '吉林',
    '黑龙江省': '黑龙江',
    '上海市': '上海',
    '江苏省': '江苏',
    '浙江省': '浙江',
    '安徽省': '安徽',
    '福建省': '福建',
    '江西省': '江西',
    '山东省': '山东',
    '河南省': '河南',
    '湖北省': '湖北',
    '湖南省': '湖南',
    '广东省': '广东',
    '广西壮族自治区': '广西',
    '海南省': '海南',
    '重庆市': '重庆',
    '四川省': '四川',
    '贵州省': '贵州',
    '云南省': '云南',
    '西藏自治区': '西藏',
    '陕西省': '陕西',
    '甘肃省': '甘肃',
    '青海省': '青海',
    '宁夏回族自治区': '宁夏',
    '新疆维吾尔自治区': '新疆',
    '台湾省': '台湾',
    '香港特别行政区': '香港',
    '澳门特别行政区': '澳门'
};

function shortName(geoName) {
    return nameMap[geoName] || geoName;
}
```

When matching user data, also accept these common variants:
- Pinyin: `'beijing'` → `'北京'`, `'shanghai'` → `'上海'`
- With/without suffixes: `'广东'` and `'广东省'` both match

---

## Projection Method

**Use pre-projection via Mercator.** This is required because DataV GeoJSON uses clockwise winding order, which D3 v7's antimeridian clipping misinterprets as globe-covering polygons.

Algorithm:
1. Walk all coordinates to find geographic bounding box (min/max lon/lat)
2. Build temporary `d3.geoMercator()` at scale=1, compute projected bbox
3. Fit to viewport: `fitScale = Math.min(width / projW, height / projH) * 1.12` (1.12 = slight overfill for edge-to-edge feel)
4. Apply projection in-place to all coordinates (Polygon and MultiPolygon)
5. Use `d3.geoPath(null)` — null projection since coordinates are already in screen space

See `geo-map.js` Section 2 for the full algorithm.

---

## Feature Filters

Apply these filters after loading `provinces.json`:

```javascript
geoData.features = geoData.features.filter(f =>
    f.properties.adcode !== '100000_JD' && f.properties.name
);
```

- `adcode !== '100000_JD'` — removes the nine-dash-line feature
- `f.properties.name` — removes any unnamed features

---

## GeoJSON Data Sources

| Level | Source | Size | When to fetch |
|-------|--------|------|---------------|
| Province (省) | `assets/geojson/china/provinces.json` | ~570KB | Read local file at generation time |
| City (市) | DataV API `https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json` | ~50–200KB per province | **Python `requests` at generation time — inline result** |
| County/District (区县) | DataV API with city adcode | ~10–50KB per city | **Python `requests` at generation time — inline result** |

⚠️ **Never emit runtime `fetch()` calls for geo data.** The HTML is opened via `file://` — browsers block cross-origin fetch from local files. Always fetch DataV data in Python during generation and embed it as an inline JS constant (`const __inlineCityGeoJSON = {...};`).

**Province adcode reference** (use in Python to build the DataV URL):

```python
PROVINCE_ADCODES = {
    '北京': 110000, '天津': 120000, '河北': 130000, '山西': 140000,
    '内蒙古': 150000, '辽宁': 210000, '吉林': 220000, '黑龙江': 230000,
    '上海': 310000, '江苏': 320000, '浙江': 330000, '安徽': 340000,
    '福建': 350000, '江西': 360000, '山东': 370000, '河南': 410000,
    '湖北': 420000, '湖南': 430000, '广东': 440000, '广西': 450000,
    '海南': 460000, '重庆': 500000, '四川': 510000, '贵州': 520000,
    '云南': 530000, '西藏': 540000, '陕西': 610000, '甘肃': 620000,
    '青海': 630000, '宁夏': 640000, '新疆': 650000, '台湾': 710000,
    '香港': 810000, '澳门': 820000,
}

# Example: fetch Guangdong city-level GeoJSON at generation time
import requests, json
adcode = PROVINCE_ADCODES['广东']  # 440000
resp = requests.get(
    f"https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json",
    timeout=10
)
city_geojson_str = json.dumps(resp.json(), ensure_ascii=False)
# Embed in HTML: const __inlineCityGeoJSON = {city_geojson_str};
```

**Projection note:** City features fetched from DataV use the same coordinate system as province features. After inlining, apply the **same** `tempProj` + `projDx`/`projDy` shift computed from province features. Do NOT recompute projection parameters from city features. See SKILL.md Step 4.2 for the full pattern.

---

## Regional Groupings

Used for auto-narrative analysis (identifying regional patterns and clusters).

```javascript
const regions = {
    '华东地区': ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'],
    '华北地区': ['北京', '天津', '河北', '山西', '内蒙古'],
    '中南地区': ['河南', '湖北', '湖南', '广东', '广西', '海南'],
    '西南地区': ['重庆', '四川', '贵州', '云南', '西藏'],
    '西北地区': ['陕西', '甘肃', '青海', '宁夏', '新疆'],
    '东北地区': ['辽宁', '吉林', '黑龙江']
};
```

---

## Small Province Handling

These provinces/cities have very small geographic area. When zooming to them, enforce a minimum bounding dimension to ensure they're visually prominent:

```javascript
const smallProvinces = ['北京', '天津', '上海', '香港', '澳门', '海南', '宁夏'];
// When computing zoom: dx = Math.max(dx, minDim); dy = Math.max(dy, minDim);
// where minDim = Math.min(width, height) * 0.06
```
