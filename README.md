# TMS Staff Organization Chart — v0.13
**Interactive org chart with headshots, sub-reporting lines, search, directory, and instant PDF export.**

---

## Package Structure

```
tms-org-chart/
├── index.html            ← Entry point
├── styles.css            ← All styles, responsive layout, print/PDF
├── main.js               ← Rendering, search, modal, lightbox, directory, PDF
├── staff-data.xlsx       ← ⭐ All staff data — the only file you need to edit
├── assets/
│   ├── tms-logo.png      ← TMS logo (RGBA PNG, transparent background)
│   └── headshots/        ← Staff headshot photos (JPG)
└── README.md
```

---

## Updating Staff Data

Open **`staff-data.xlsx`** in Excel or Google Sheets. It has three sheets:

### Staff sheet
Each row is one person. Columns:

| Column | Description |
|--------|-------------|
| `id` | Unique identifier — **never change once set** |
| `name` | Full name (First Last) |
| `title` | Job title |
| `ext` | Phone extension |
| `direct` | Direct phone number |
| `email` | Email address |
| `photo` | Filename in `assets/headshots/` — leave blank if no photo |
| `dept_id` | Must match an `id` in the Departments sheet |
| `role` | See roles below |
| `reports_to_id` | The `id` of their direct manager |
| `description` | Optional bio text shown in the profile modal |

**Roles:**
| Role | Where it appears |
|------|-----------------|
| `executive` | CEO — shown as dept head of the Executive block (only one) |
| `deputy` | Deputy Executive Director — member of Executive block |
| `exec_staff` | Staff reporting directly to CEO — members of Executive block |
| `dept_head` | Department head — shown in the colored header of their department |
| `manager` | Mid-level manager — their direct reports are indented beneath them |
| `staff` | Regular staff member |

**Sub-reporting:** Set a person's `role` to `manager` and point their reports' `reports_to_id` to that manager's `id`. Those reports will be visually indented beneath the manager. If a staff member's `reports_to_id` points to someone who isn't a `manager`, they will still appear — they'll just show as direct department members.

### Departments sheet
Defines department display names and colors.

Available colors: `exec` (red), `yellow`, `green`, `orange`, `blue`, `pink`

### Meta sheet
| Key | Description |
|-----|-------------|
| `directoryDate` | Date shown in the page header — update when publishing changes |
| `version` | App version displayed in the header badge |

---

## Adding a New Staff Member
1. Add their headshot JPG to `assets/headshots/`
2. Add a new row in the Staff sheet with a unique `id` (e.g. `jane-smith`)
3. Fill in all columns; set `dept_id` and `reports_to_id` to match existing values
4. Save the file and reload the page — changes appear immediately

## Removing a Staff Member
Delete their row from the Staff sheet. If they were a `manager`, their reports will automatically fall back to appearing as direct department members.

## Adding a New Department
1. Add a row to the Departments sheet with a unique `id`, display `name`, and `color`
2. Add staff rows with `dept_id` matching the new department's `id`

---

## Features

- **Org Chart view** — hierarchical by department, color-coded, with sub-reporting indentation
- **Directory view** — card grid of all staff; sortable by Role, A–Z (last name), or Department
- **Search** — filters both views live by name, title, email, or extension
- **Profile modals** — click any staff card to see full contact info; click the headshot to enlarge
- **Export PDF** — instantly opens the browser print dialog pre-formatted for 11×8.5" landscape; disabled when Directory view is active
- **Mobile responsive** — single-column layout on small screens

---

## PDF Export
Click **Export PDF** in the page header. In the browser print dialog:
- Paper size: **Letter**, Orientation: **Landscape** (usually auto-set)
- Enable **Background graphics** for full color output
- Disable browser headers/footers for a clean page

The PDF layout is pre-rendered in the background when the page loads, so the print dialog opens instantly.

---

## Integration into tms.org

**Option A — Iframe embed** (simplest):
```html
<iframe src="/staff/tms-org-chart/index.html"
        width="100%" height="820px"
        style="border:none;"
        title="TMS Staff Organization Chart">
</iframe>
```

**Option B — Direct page** — upload the entire `tms-org-chart/` folder to your server and link directly to `index.html`.

**Important:** The page loads `staff-data.xlsx` via `fetch`, so it must be served from a web server — it will not work when opened as a local file (`file://`). Any static host works (Apache, Nginx, AWS S3, Netlify, etc.).

---

*TMS — The Minerals, Metals & Materials Society | tms.org | v0.13*
