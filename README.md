# UK Medical Schools Comparison Tool

A static reference tool for comparing fees, support structures, and resource provision across UK medical schools. Developed for the BMA Medical Students Committee (MSC).

Live site: [comparisontool.online](https://comparisontool.online)

---

## Project purpose

The tool presents structured, neutral data on the following categories:

- **International tuition fees** — reported annual fees for international students
- **Placement travel support** — reimbursement and payment systems
- **Welfare and leave provisions** — flexibility, attendance, and leave policies
- **Resource provision** — clinical equipment and learning resources
- **Financial support** — hardship funds, research grants, elective funding

It does not rank or assess medical schools.

---

## How the site works

This is a fully static website — HTML, CSS, and vanilla JavaScript — with no backend or database required. It is hosted via GitHub Pages.

Data is stored in `data/medical_schools.json` and loaded at runtime by `js/app.js` to populate the comparison table. Chart areas are placeholder images pending full data visualisation integration.

---

## Data structure

Edit `data/medical_schools.json` to update institution data. No rebuild is required — the site reads the file directly in the browser.

```json
{
  "schools": [
    {
      "university": "Institution name",
      "international_fees": "£30,000 – £45,000",
      "travel_support": "Claim-based reimbursement | Fixed allowance | Upfront payment",
      "leave_flexibility": "High | Moderate | Limited",
      "resources_provided": ["Scrubs", "Stethoscope", "Learning platforms"],
      "financial_support": ["Hardship fund", "Research grants", "Elective funding"]
    }
  ]
}
```

---

## File structure

```
comparisontool.online/
├── index.html              Main comparison page
├── about.html              About page
├── CNAME                   Custom domain for GitHub Pages
├── css/
│   └── styles.css          All styles
├── js/
│   └── app.js              Table rendering, sorting, filtering
├── data/
│   └── medical_schools.json  Institution data
└── images/
    └── placeholder-chart.png  Placeholder for chart sections
```

---

## Deployment

The site deploys automatically from the `main` branch via GitHub Pages.

### To update the site

1. Make changes to any file
2. Commit and push to `main`
3. GitHub Pages rebuilds automatically (usually within 60 seconds)

### DNS setup for `comparisontool.online`

Point your domain to GitHub Pages:

**Option A — A records (recommended):**

Add four A records for `@` pointing to:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Option B — CNAME record:**

Add a CNAME record for `www` pointing to:
```
obscurum.github.io
```

After DNS propagates (up to 24–48 hours), enable HTTPS in the GitHub Pages settings.

### Local development

```bash
cd comparisontool.online
python3 -m http.server 8000
# Visit http://localhost:8000
```

---

## Contact

To request data updates or report inaccuracies, contact the BMA Medical Students Committee.
