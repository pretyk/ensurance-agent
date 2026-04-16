# Copilot Custom Instructions

## Project Overview

This is an insurance claim submission agent for Ayalon Insurance (איילון ביטוח) in Israel. It automates filing medical treatment refund claims through the Ayalon online portal.

## Document File System Structure

Treatment documents are organized by **provider** and **session number**:

```
<provider-folder>/
├── certificate.jpeg            # Provider's professional certificate (shared across all sessions)
├── Doctor referral.pdf         # Doctor's referral letter (shared across all sessions)
├── 1/                          # Session 1
│   └── <receipt-file>.pdf      # Receipt for this session (any filename)
├── 2/                          # Session 2
│   └── <receipt-file>.pdf      # Receipt for this session
└── N/                          # Session N
    └── <receipt-file>.pdf
```

### Key conventions:
- **Provider folder** name = the treatment type (e.g., `shiatzu/`, `physiotherapy/`, `dental/`)
- **Numbered subfolders** (`1/`, `2/`, ...) = individual treatment sessions, in chronological order
- **Receipt** = the PDF or image file inside each numbered folder (filename can be anything)
- **Certificate** and **Doctor referral** = at the provider root, shared across all sessions with the same provider and treatment category
- **User info** = in `user-info.md` at the project root (ID, phone, bank details)

### When a user says "submit claim for X number N":
- `X` = the provider folder name
- `N` = the session subfolder number
- Read the receipt from `X/N/`
- Read the certificate from `X/certificate.jpeg`
- Read the referral from `X/Doctor referral.pdf`
- Read user details from `user-info.md`

## How to Read Documents

Use the document-reader skill to extract text from PDFs:
```bash
python .github/skills/document-reader/read_document.py --folder "<provider>/N/"
python .github/skills/document-reader/read_document.py "<provider>/Doctor referral.pdf"
```

For images (certificates), use the `view` tool to inspect visually.

## Ayalon Portal — Detailed Automation Guide

### Portal URL
```
https://clientportfolio.ayalon-ins.co.il/cpLogin/mainLogin/login
```

### Login Flow
1. Navigate to the login URL
2. Fill `#personIdComponent` with user's ID and `#phone_phoneNumberComponent` with phone (from `user-info.md`)
3. Click `button.btnPrim` (כניסה) → OTP is sent via SMS
4. **Ask the user for the OTP** using `ask_user` — do NOT ask them to type in the browser
5. Type OTP into `#num_numInputComponent` using `page.type()` with `{ delay: 100 }` — **not** `page.fill()` (Angular needs keystroke events)
6. Click `#otpSubmit`
7. Wait for redirect: `page.waitForURL('**/user-panel/**', { timeout: 30000 })`

### Navigation to Claim Form
- **Do NOT click** the "הגשת תביעה" menu link — it's in a hidden hover submenu
- **Navigate directly**: `page.goto('https://clientportfolio.ayalon-ins.co.il/cp/user-panel/claims-by-product')`
- Select **ביטוח בריאות**: click `.claims_grid li:first-child` (the `<a>` has no href, click the `<li>`)
- Select insured person: click `button.round-btn:has-text("PERSON_NAME")` — match to the patient on the referral
- Select treatment category: click the matching `button.round-btn` (e.g., `"רפואה משלימה"` for shiatzu/complementary medicine)
- Dismiss popup: click `button:has-text("להתחלת התהליך")`

### Treatment Form Fields
The form at `.../receipts-and-treatments` has 4 fields per treatment row:
- **מספר הקבלה** (Receipt number): `#mat-input-${2*N+1}` for row N (0-indexed)
- **תאריך הטיפול** (Treatment date): `#mat-input-${2*N}` — format `DD/MM/YYYY`, press Escape after to close datepicker
- **סיבה רפואית** (Medical reason): ng-select autocomplete — type search text into `#wrapperId input`, select from `.ng-option`
- **סוג הטיפול** (Treatment type): ng-select autocomplete — same pattern

### Key Behaviors
- Use `page.type()` with `{ delay }` for all Angular form fields — never `page.fill()`
- Autocomplete wrapper IDs are **dynamic** — query `.rc-autocomplete-wrapper` IDs at runtime
- Dropdown options use `.ng-option` (ng-select library), NOT `mat-option`
- Add more treatment rows: click `button:has-text("הוספת קבלה")`
- Continue to next step: click `button.btnPrim:has-text("המשך")`

### ⚠️ Receipt Number Constraint
Each treatment row **must have a different receipt number**. Using the same receipt number on multiple rows triggers: "יש להזין מספרי קבלות שונים". When one receipt covers multiple treatments, submit only one treatment per claim, or ask the user for guidance.

### Treatment Category Mapping
| Treatment | Category to Select |
|---|---|
| שיאצו (Shiatsu) | רפואה משלימה |
| פיזיותרפיה (Physiotherapy) | טיפולים |
| רפואה משלימה (Complementary) | רפואה משלימה |

### Form Filler Skill
Use the **ayalon-form-filler** skill for tested selectors, helper functions, and a reusable Playwright script. See `.github/skills/ayalon-form-filler/SKILL.md`.

## Important Notes

- Always use **headed (visible) browser mode** — never headless
- Always **ask for user confirmation** before submitting
- The agent should **narrate** each action before performing it
- Personal data is in `user-info.md` (git-ignored, never commit)
- Treatment documents are git-ignored — they stay local only
