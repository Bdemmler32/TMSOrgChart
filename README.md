# TMS Staff Organization Chart
**Interactive org chart with headshots, contact info, search, and PDF export.**

---

## Package Structure

```
tms-org-chart/
├── index.html          ← Entry point (drop into your server/CMS)
├── styles.css          ← All visual styles & print/PDF layout
├── main.js             ← Rendering engine, search, modal, PDF export
├── data.js             ← Staff data — THIS is what you edit when staff changes
├── assets/
│   └── headshots/      ← Staff headshot photos (JPG)
└── README.md           ← This file
```

---

## Updating Staff Data

All staff info lives in **`data.js`**. No other file needs to change for routine staff updates.

### To update a person's info:
Find their entry in `data.js` and edit the fields:
```js
{
  id: "kelly-markel",          // Unique identifier — do NOT change
  name: "Kelly Markel",
  title: "Publications Managing Editor",
  ext: "281",
  direct: "724-814-3108",
  email: "kmarkel@tms.org",
  photo: "Markel_Kelly_2026.jpg"   // Filename in assets/headshots/
}
```

### To add a new person:
1. Add their headshot to `assets/headshots/`
2. Copy any existing staff entry block in `data.js`
3. Give it a new unique `id` (e.g. `"jane-smith"`)
4. Add it to the correct department's `members` array

### To add a new department:
Copy an existing department block in `data.js` and add it to the `departments` array.
Then add its color to `styles.css` under the `/* Department palette */` section.

### To update the directory date:
Change `directoryDate` in the `meta` block at the bottom of `data.js`.

---

## Adding a New Headshot

- Drop the photo file in `assets/headshots/`
- Reference the exact filename in the person's `photo` field in `data.js`
- Recommended: Square or portrait crop, face centered, 400×400px minimum

---

## PDF Export

Click **Export PDF** in the top-right header. The page will print in landscape orientation at 11×8.5 inches. For best results:
- Use Chrome or Edge browser
- In the print dialog, set paper size to **Letter**, orientation to **Landscape**
- Disable headers/footers in the print dialog
- Enable "Background graphics" for full color output

---

## Integration into tms.org

### Option A — Standalone iframe embed
The simplest approach. Host the `tms-org-chart/` folder on your web server and embed with:
```html
<iframe src="/staff/tms-org-chart/index.html"
        width="100%" height="800px"
        style="border:none;border-radius:8px;"
        title="TMS Staff Organization Chart">
</iframe>
```

### Option B — Direct page include
If your CMS supports custom HTML pages, drop the whole folder onto your server and link directly to `index.html`. Works with WordPress, Drupal, any static host.

### Option C — Component integration
The chart uses no frameworks — it's vanilla HTML/CSS/JS. To integrate into a React or Vue app:
1. Include `data.js` as a module (export `TMS_DATA` with `export const TMS_DATA = {...}`)
2. Reference `styles.css` in your global stylesheet
3. Call `init()` from `main.js` after your component mounts

### Google Fonts dependency
The chart loads Inter and Barlow Condensed from Google Fonts. If your environment blocks external requests, download the fonts and self-host them, then update the `<link>` in `index.html`.

---

## Browser Support
Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

*TMS — The Minerals, Metals & Materials Society | tms.org*
