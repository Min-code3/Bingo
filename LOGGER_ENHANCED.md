# 🎯 Enhanced Logger - Complete Tracking Implementation

## ✅ What's Now Being Tracked

### 1. 🎲 Bingo Cell Clicks
**Action Type:** `bingo_click`

- **Tracked**: Every click on bingo cells (main board or food board)
- **Data Captured**:
  - Cell ID (e.g., "osaka-1", "f-ramen")
  - Cell label text
  - Cell icon
  - Whether it's a food or main cell
- **Implementation**:
  - Added `data-cell-id` attributes to all bingo cells
  - GlobalLogger detects `.bingo-cell` class
  - Logs with specific action_type for analysis

**Example Log:**
```json
{
  "action_type": "bingo_click",
  "target": "div.bingo-cell",
  "element_type": "div",
  "metadata": {
    "cell_id": "osaka-1"
  }
}
```

---

### 2. 📸 Photo Uploads
**Action Types:** `photo_upload`, `photo_upload_success`, `photo_upload_failed`, `photo_upload_dummy`

- **Tracked**:
  - When user selects a photo file
  - Upload success to Supabase
  - Upload failures (with error info)
  - Dummy photo uploads (testing)
- **Data Captured**:
  - File size and type
  - Upload prefix (main/food)
  - Storage method (Supabase/base64)
  - Success/failure status
  - Error messages if failed

**Example Logs:**
```json
// Initial selection
{
  "action_type": "photo_upload",
  "target": "main",
  "metadata": {
    "file_size": 245678,
    "file_type": "image/jpeg",
    "upload_prefix": "main"
  }
}

// Successful upload
{
  "action_type": "photo_upload_success",
  "target": "main",
  "metadata": {
    "storage": "supabase",
    "upload_prefix": "main"
  }
}
```

---

### 3. 🗺️ Google Maps / External Links
**Action Types:** `external_link`, `google_maps_click`

- **Tracked**:
  - All clicks on external links (takes user away from site)
  - Google Maps links from restaurant cards
  - Uses `fetch` with `keepalive: true` for guaranteed delivery
- **Data Captured**:
  - Full URL of external site
  - Restaurant name (for Maps links)
  - Cell ID (context)
  - Link text
- **Implementation**:
  - Uses `fetch` with `keepalive` flag instead of regular logging
  - Ensures data is sent even if page unloads immediately
  - Explicit tracking on Google Maps buttons

**Example Log:**
```json
{
  "action_type": "google_maps_click",
  "target": "Ichiran Ramen Dotonbori",
  "element_type": "a",
  "metadata": {
    "restaurant_name": "Ichiran Ramen Dotonbori",
    "cell_id": "f-ramen",
    "map_url": "https://maps.google.com/..."
  }
}
```

---

### 4. ⬅️ Back Button / Navigation
**Action Type:** `navigation_back`

- **Tracked**: All clicks on back buttons
- **Data Captured**:
  - Button text (e.g., "← Back to Main", "뒤로 가기")
  - Current page URL
  - Navigation direction
- **Implementation**:
  - Detects `.back-btn` class
  - Detects arrow symbols (← ←)
  - Detects "Back" text in any language

**Example Log:**
```json
{
  "action_type": "navigation_back",
  "target": "a.back-btn [← Back to Food]",
  "page_url": "/place/f-ramen"
}
```

---

## 🎯 Improved Element Identification

### Fallback Strategy for Target Names

When logging clicks, the system now uses a priority-based fallback:

1. **ID** (`#button-id`) - Most specific
2. **aria-label** - Accessibility label
3. **alt text** - For images
4. **data-cell-id** / **data-index** - Custom data attributes
5. **First meaningful class** (`.upload-btn`) - Class names
6. **Text content** - Last resort (if short)

This means **even icon buttons without IDs** will be identifiable!

**Examples:**
```javascript
// Button with aria-label
<button aria-label="Upload photo">📷</button>
// Logged as: button["Upload photo"]

// Image with alt
<img alt="Osaka Castle" />
// Logged as: img["Osaka Castle"]

// Div with data attribute
<div data-cell-id="osaka-1" />
// Logged as: div[cell-osaka-1]

// Element with class
<div className="bingo-cell food-cell" />
// Logged as: div.bingo-cell
```

---

## 📊 All Action Types Being Logged

| Action Type | Description | When It Fires |
|-------------|-------------|---------------|
| `click` | Generic click | Any unspecified click |
| `bingo_click` | Bingo cell click | Click on any bingo board cell |
| `photo_upload` | Photo selected | User selects image file |
| `photo_upload_success` | Upload succeeded | Supabase upload completes |
| `photo_upload_failed` | Upload failed | Supabase upload errors |
| `photo_upload_dummy` | Dummy upload | Test/dummy photo used |
| `google_maps_click` | Maps link | Restaurant Google Maps link |
| `external_link` | External link | Any external URL click |
| `navigation_back` | Back button | Back/return navigation |
| `page_view` | Page loaded | Initial load or SPA navigation |

---

## 🔍 Example Queries for Analysis

### Most clicked bingo cells
```sql
SELECT
  target,
  COUNT(*) as clicks
FROM user_logs
WHERE action_type = 'bingo_click'
GROUP BY target
ORDER BY clicks DESC
LIMIT 10;
```

### Photo upload success rate
```sql
SELECT
  COUNT(CASE WHEN action_type = 'photo_upload_success' THEN 1 END) as successes,
  COUNT(CASE WHEN action_type = 'photo_upload_failed' THEN 1 END) as failures,
  ROUND(
    100.0 * COUNT(CASE WHEN action_type = 'photo_upload_success' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN action_type LIKE 'photo_upload_%' THEN 1 END), 0),
    2
  ) as success_rate_percent
FROM user_logs
WHERE action_type LIKE 'photo_upload_%';
```

### Most popular restaurants (by map clicks)
```sql
SELECT
  metadata->>'restaurant_name' as restaurant,
  COUNT(*) as map_clicks
FROM user_logs
WHERE action_type = 'google_maps_click'
GROUP BY metadata->>'restaurant_name'
ORDER BY map_clicks DESC;
```

### User journey (navigation flow)
```sql
SELECT
  timestamp,
  action_type,
  target,
  page_url
FROM user_logs
WHERE user_id = 'YOUR_USER_ID'
  AND action_type IN ('page_view', 'navigation_back', 'bingo_click')
ORDER BY timestamp ASC;
```

### Back button usage
```sql
SELECT
  page_url,
  COUNT(*) as back_clicks
FROM user_logs
WHERE action_type = 'navigation_back'
GROUP BY page_url
ORDER BY back_clicks DESC;
```

---

## 🧪 Testing Checklist

### Test Bingo Cell Tracking
- [ ] Click a cell on main board → See `bingo_click` in console
- [ ] Click a cell on food board → See `bingo_click` in console
- [ ] Check Supabase: `target` should include cell ID

### Test Photo Upload Tracking
- [ ] Click upload button → Select a photo
- [ ] Console shows: `photo_upload`, then `photo_upload_success`
- [ ] Click dummy upload → See `photo_upload_dummy`
- [ ] Check Supabase: Should have all three log entries

### Test Google Maps Tracking
- [ ] Click "구글맵" button on restaurant card
- [ ] Console shows: `🚀 External link logged: google_maps_click`
- [ ] Page opens Google Maps
- [ ] Check Supabase: Log should exist with restaurant name

### Test Back Button Tracking
- [ ] Click any back button (← 뒤로 가기)
- [ ] Console shows: `navigation_back`
- [ ] Check Supabase: Should have navigation log

### Test Fallback Names
- [ ] Click elements without IDs (icons, etc.)
- [ ] Check logs: Should have meaningful names (not just "div")

---

## 🚀 What You Can Learn From This Data

1. **User Flow**
   - Which cells do users visit first?
   - Where do they use the back button?
   - Navigation patterns

2. **Engagement**
   - Which restaurants get the most map clicks?
   - Which cells are most popular?
   - Upload success rates

3. **Pain Points**
   - Where do photo uploads fail?
   - Which pages have high back button usage?
   - Exit points (external links)

4. **Completion**
   - Which cells are clicked most?
   - Photo upload completion rates
   - User journey to bingo completion

---

## 🎉 You're All Set!

Your logger is now tracking:
- ✅ Every bingo cell click
- ✅ Every photo upload attempt
- ✅ Every Google Maps link click (guaranteed delivery)
- ✅ Every back button click
- ✅ Every page view
- ✅ Every generic click

**Just restart your dev server and start clicking!** 🚀

```bash
npm run dev
```

Open console (F12) and watch the logs flow in. 📊
