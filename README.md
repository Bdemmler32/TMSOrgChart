# TMS Staff Organization Chart — v0.02
**Interactive org chart with headshots, contact info, sub-reporting lines, search, and PDF export.**

---

## Package Structure

```
tms-org-chart/
├── index.html          ← Entry point
├── styles.css          ← All styles + responsive + print/PDF
├── main.js             ← Rendering engine, search, modal, lightbox, PDF export
├── staff-data.xlsx     ← ⭐ Staff data — edit this for all changes
├── assets/
│   └── headshots/      ← Staff headshot photos (JPG)
└── README.md
```

---

## Updating Staff Data

Open **`staff-data.xlsx`** in Excel or Google Sheets. It has three sheets:

### Staff sheet (main)
Each row is one person. Columns:

| Column | Description |
|--------|-------------|
| `id` | Unique key — **never change after creation** |
| `name` | Full name |
| `title` | Job title |
| `ext` | Phone extension |
| `direct` | Direct phone number |
| `email` | Email address |
| `photo` | Filename in `assets/headshots/` |
| `dept_id` | Must match an `id` in the Departments sheet |
| `role` | `executive`, `deputy`, `exec_staff`, `dept_head`, `manager`, or `staff` |
| `reports_to_id` | The `id` of the person they directly report to |
| `description` | Optional bio text shown in the profile modal |

**Roles explained:**
- `executive` — CEO (only one)
- `deputy` — Deputy Executive Director
- `exec_staff` — Staff reporting directly to CEO outside departments
- `dept_head` — Department head, shown in the colored header
- `manager` — Mid-level manager; their reports are indented beneath them
- `staff` — Regular staff member

**Sub-reporting:** To show Bob, Cheryl, and Ken under Dave, set their `reports_to_id` to `dave-rasel` and their `role` to `staff`. Dave's `role` should be `manager`.

### Departments sheet
Defines department display names and colors. Colors: `yellow`, `green`, `blue-light`, `blue`, `pink`, `exec`.

### Meta sheet
Update `directoryDate` when publishing a new version.

---

## Adding a New Staff Member
1. Add headshot to `assets/headshots/`
2. Add a row in the Staff sheet with a unique `id` (e.g. `jane-smith`)
3. Set `dept_id` and `reports_to_id` appropriately
4. Save and reload the page

---

## PDF Export
Click **Export PDF** → browser print dialog → set:
- Paper size: **Letter**, Orientation: **Landscape**
- Enable **Background graphics**
- Disable headers/footers

---

## Integration into tms.org

**Option A — Iframe embed:**
```html
<iframe src="/staff/tms-org-chart/index.html"
        width="100%" height="820px"
        style="border:none;border-radius:8px;"
        title="TMS Staff Organization Chart">
</iframe>
```

**Option B — Direct page** — upload the whole folder, link to `index.html`.

**Note:** The page loads `staff-data.xlsx` via fetch, so it must be served from a web server (not opened as a local file). Any static host works (Apache, Nginx, S3, Netlify, etc.).

---

*TMS — The Minerals, Metals & Materials Society | tms.org | v0.02*
