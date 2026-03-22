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

## Login Flow for Ayalon Portal

1. Navigate to `https://clientportfolio.ayalon-ins.co.il/cpLogin/mainLogin/login`
2. Enter user's ID and phone from `user-info.md`
3. Click כניסה → OTP is sent via SMS
4. User enters OTP manually in the browser
5. After login: click הגשת תביעה → select ביטוח בריאות → select the insured person → select treatment category → fill form → upload documents → submit

## Important Notes

- Always use **headed (visible) browser mode** — never headless
- Always **ask for user confirmation** before submitting
- The agent should **narrate** each action before performing it
- Personal data is in `user-info.md` (git-ignored, never commit)
- Treatment documents are git-ignored — they stay local only
