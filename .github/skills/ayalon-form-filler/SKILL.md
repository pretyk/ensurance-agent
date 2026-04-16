---
name: ayalon-form-filler
description: >
  Use this skill when the agent needs to fill the Ayalon Insurance claim form.
  Contains tested Playwright selectors, page flow, and a reusable script for
  login, navigation, and treatment-form completion on the Ayalon portal.
---

# Ayalon Insurance Form Filler Skill

Tested selectors and automation scripts for the Ayalon Insurance online claim
portal (`clientportfolio.ayalon-ins.co.il`). Use alongside the **web-interaction**
skill (Playwright) and the **document-reader** skill.

---

## Portal URL

```
https://clientportfolio.ayalon-ins.co.il/cpLogin/mainLogin/login
```

---

## 1. Login Page

| Element | Selector | Notes |
|---|---|---|
| ID field | `#personIdComponent` | type = text |
| Phone field | `#phone_phoneNumberComponent` | type = tel |
| Login button | `button.btnPrim` | text = "כניסה" |

### OTP Page (appears after clicking כניסה)

| Element | Selector | Notes |
|---|---|---|
| OTP input | `#num_numInputComponent` | type = tel, maxLength = 6 |
| OTP submit | `#otpSubmit` | class includes `submitButton btnPrim` |

### Important — Angular Change Detection

- **Use `page.type()` (not `page.fill()`)** for the OTP field. Angular's
  reactive forms require keystroke events to detect changes.
- Use a small `delay` (e.g., `{ delay: 100 }`) between keystrokes.
- **Wait for redirect** after OTP submit:
  ```js
  await page.waitForURL('**/user-panel/**', { timeout: 30000 });
  ```

### OTP Handling

The agent should **ask the user for the OTP** (via `ask_user`), then type it
programmatically into the OTP field and click submit — do NOT ask the user
to type it manually in the browser.

---

## 2. Post-Login Navigation

After login the user lands on the dashboard:
```
https://clientportfolio.ayalon-ins.co.il/cp/user-panel/main
```

### Navigating to Claims

The "הגשת תביעה" link is inside a hover submenu and is **not directly
clickable** (the element is invisible). Instead, **navigate directly**:

```js
await page.goto('https://clientportfolio.ayalon-ins.co.il/cp/user-panel/claims-by-product');
```

### Claims-by-Product Page

Shows a grid of insurance categories (`.claims_grid`):

| Category | Hebrew |
|---|---|
| Health Insurance | ביטוח בריאות |
| Car Insurance | ביטוח רכב |
| Home Insurance | ביטוח דירה |
| Life Insurance | ביטוח חיים |
| Nursing Care | ביטוח סיעוד |
| Personal Accidents | ביטוח תאונות אישיות |
| Loss of Work Capacity | אובדן כושר עבודה |

**Selector to click Health Insurance:**
```js
// The <a> tags have no href — they are Angular click-handled.
// Click the <li> parent, not the <a>.
await page.click('.claims_grid li:first-child');
```

---

## 3. Person Selection Page

URL: `.../claim-settlement`

Shows **"עבור מי מבוקש ההחזר הכספי?"** with buttons for each insured person.

| Element | Selector | Notes |
|---|---|---|
| Person button | `button.round-btn:has-text("NAME")` | Contains name + ID number |

Example:
```js
await page.click('button.round-btn:has-text("INSURED_NAME")');
```

Match the insured person to the **patient name on the doctor referral**.

---

## 4. Treatment Category Page

URL: `.../claim-flow/claim-for`

Shows **"באיזה נושא?"** with category buttons.

| Category | Selector |
|---|---|
| בדיקות רפואיות | `button.round-btn:has-text("בדיקות רפואיות")` |
| התייעצות שלא לצרכי ניתוח | `button.round-btn:has-text("התייעצות")` |
| טיפולים | `button.round-btn:has-text("טיפולים")` |
| ניתוחים | `button.round-btn:has-text("ניתוחים")` |
| תרופות שאינן בסל הבריאות | `button.round-btn:has-text("תרופות")` |
| השתלות/טיפולים מיוחדים בחול | `button.round-btn:has-text("השתלות")` |
| מחלות קשות | `button.round-btn:has-text("מחלות קשות")` |
| התפתחות הילד | `button.round-btn:has-text("התפתחות")` |
| רפואה משלימה | `button.round-btn:has-text("רפואה משלימה")` |

For **shiatzu / complementary medicine**, select **רפואה משלימה**.

### Popup After Category Selection

A popup appears with text "כדי לחסוך לך זמן יקר..." listing required documents.

```js
await page.click('button:has-text("להתחלת התהליך")');
```

---

## 5. Receipts & Treatments Form

URL: `.../claim-flow/receipts-and-treatments`

This is step 2 of 4: **"קבלות ומסמכים"**.

### Form Fields (per treatment row)

Each treatment row contains 4 fields. Row IDs follow a pattern where the
first row uses `mat-input-0` / `mat-input-1`, second uses `mat-input-2` /
`mat-input-3`, etc.

| Field | Selector (Row N, 0-indexed) | Input method |
|---|---|---|
| Receipt number (מספר הקבלה) | `#mat-input-${2*N + 1}` | `page.type()` |
| Treatment date (תאריך הטיפול) | `#mat-input-${2*N}` | `page.type()` — format: `DD/MM/YYYY` |
| Medical reason (סיבה רפואית) | ng-select autocomplete (see below) | Type + select from dropdown |
| Treatment type (סוג הטיפול) | ng-select autocomplete (see below) | Type + select from dropdown |

### ng-select Autocomplete Fields

The medical reason and treatment type fields use **ng-select** (not Material
autocomplete). They are wrapped in `div.rc-autocomplete-wrapper` elements
with unique IDs.

**How to interact:**

1. Find the wrapper ID:
   ```js
   const wrappers = await page.$$eval('.rc-autocomplete-wrapper',
     els => els.map(el => ({ id: el.id }))
   );
   // IDs are dynamically generated, e.g. "autocomplete_8bfde39541ebb"
   ```

2. Click and type into the inner input:
   ```js
   await page.click(`#${wrapperId} input`);
   await page.type(`#${wrapperId} input`, 'search text', { delay: 100 });
   await page.waitForTimeout(2000);
   ```

3. Select from dropdown:
   ```js
   await page.click('.ng-option:has-text("option text")');
   ```

**Known medical reason options** (for "כאב" search):
- כאבי גב (back pain)
- כאבי ראש (headache)
- כאבי שרירי לעיסה (jaw muscle pain)
- כאבים (general pain) ← use this for neck pain / general complaints

**Known treatment type options:**
- שיאצו (shiatsu) — for shiatsu treatments

### Adding Multiple Treatments

Click **"הוספת קבלה"** to add another treatment row:
```js
await page.click('button:has-text("הוספת קבלה")');
```

### ⚠️ CRITICAL: Receipt Number Validation

**Each treatment row MUST have a DIFFERENT receipt number.** If the same
receipt number is used across rows, the form shows a validation error:
> "יש להזין מספרי קבלות שונים"

When a single receipt covers multiple treatments (common for complementary
medicine), you have two options:
1. **Submit one row only** — enter one treatment date and use the receipt.
   This works if you only need to claim one treatment at a time.
2. **Ask the user** — if the receipt covers multiple treatments, ask the
   user how they want to handle it (e.g., separate claims, or single entry).

### Continue Button

```js
await page.click('button.btnPrim:has-text("המשך")');
```

---

## 6. Document Upload Page

(Step 2 continued — after the treatment details)

Expected uploads:
- **קבלה** (Receipt) — the PDF from the session folder
- **הפניה רפואית** (Referral) — `Doctor referral.pdf`
- **תעודת מטפל / Other** — `certificate.jpeg` (if additional upload slot exists)

Use **absolute paths** when uploading:
```js
await page.setInputFiles('input[type="file"]', 'C:/dev/ensurance agent/shiatzu/3/receipt.pdf');
```

---

## 7. Payment Method Page (Step 3: אופן התשלום)

Expected fields (from `user-info.md`):
- Bank (בנק): code 20 = מזרחי טפחות
- Branch (סניף): 573
- Account (חשבון): from user-info.md

---

## 8. Confirmation Page (Step 4: אישור וסיום)

**Always ask for explicit user confirmation before final submit.**

---

## Reusable Script

A Playwright automation script is provided at:
```
.github/skills/ayalon-form-filler/ayalon-form-filler.mjs
```

Run it with:
```bash
node .github/skills/ayalon-form-filler/ayalon-form-filler.mjs
```

The script handles login, navigation to claim form, and interactive treatment
entry with a REPL for further commands.

---

## Tips & Pitfalls

1. **Angular reactive forms**: Always use `page.type()` with `{ delay }`,
   never `page.fill()`, for form inputs that use Angular change detection.
2. **Hidden menu links**: The "הגשת תביעה" nav link is inside a hover
   submenu — navigate directly via URL instead of clicking.
3. **Angular click handlers**: The claims grid `<a>` tags have no `href`.
   Click the parent `<li>` element instead.
4. **Session timeout**: The Ayalon portal may timeout. If redirected to login
   page unexpectedly, re-authenticate.
5. **Date format**: Always use `DD/MM/YYYY` (e.g., `29/03/2026`).
6. **Escape after date**: Press Escape after typing a date to close the
   datepicker overlay.
7. **ng-select dropdowns**: Options appear in `.ng-option` elements inside
   a `.ng-dropdown-panel`, NOT in Material `mat-option` elements.
8. **Dynamic IDs**: Autocomplete wrapper IDs are generated dynamically on
   each page load. Always query for them at runtime.
