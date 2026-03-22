# Ayalon Insurance Claim Agent

An AI-powered agent that automates the submission of medical treatment refund claims on [Ayalon Insurance](https://www.ayalon-ins.co.il/) (איילון ביטוח). Built as a GitHub Copilot custom agent with skills for document reading and browser automation.

## What It Does

1. **Reads your documents** — Extracts text from receipts (PDF), doctor referrals, and certificates
2. **Fills the claim form** — Navigates the Ayalon portal in a visible browser, filling every field automatically
3. **Uploads attachments** — Attaches receipt, referral, and certificate to the form
4. **Asks for confirmation** — Screenshots each step so you can verify before submission
5. **Submits the claim** — Only after your explicit approval

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python 3](https://www.python.org/) with `pymupdf` (`pip install pymupdf`)
- [Playwright](https://playwright.dev/) (`npm install && npx playwright install chromium`)
- [GitHub Copilot](https://github.com/features/copilot) (Pro/Pro+/Business/Enterprise) with agent mode enabled

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/<your-account>/ensurance-agent.git
cd ensurance-agent
```

### 2. Install dependencies

```bash
npm install
npx playwright install chromium
pip install pymupdf
```

### 3. Add your personal info

Copy the example and fill in your real details:

```bash
cp user-info.example.md user-info.md
```

Edit `user-info.md` with your:
- Israeli ID number (תעודת זהות)
- Mobile phone number
- Bank details (bank code, branch, account number)

### 4. Add your treatment documents

Create a folder for your treatment provider under the project root, following this structure:

```
<provider-name>/
├── certificate.jpeg          # Provider's professional certificate (shared)
├── Doctor referral.pdf        # Doctor's referral letter (shared)
├── 1/                         # First treatment session
│   └── receipt.pdf            # Receipt/invoice for session 1
├── 2/                         # Second treatment session
│   └── receipt.pdf            # Receipt/invoice for session 2
└── 3/                         # Third treatment session
    └── receipt.pdf            # Receipt/invoice for session 3
```

**Key rules:**
- Each **provider** gets its own top-level folder (e.g., `shiatzu/`, `physiotherapy/`, `dental/`)
- Each **treatment session** gets a numbered subfolder (`1/`, `2/`, `3/`, ...)
- The **receipt** (PDF or image) goes inside the numbered subfolder
- The **certificate** and **doctor referral** sit at the provider folder root — they are shared across all sessions with the same provider
- When submitting claim #N, tell the agent: *"submit a claim for `<provider>` number N"*

### Example

```
shiatzu/
├── certificate.jpeg              # Shiatsu therapist's certificate
├── Doctor referral.pdf           # Doctor's referral for shiatsu
├── 1/
│   └── receipt_15mar2026.pdf     # Receipt for session on 15/03/2026
├── 2/
│   └── receipt_22mar2026.pdf     # Receipt for session on 22/03/2026
```

## Usage

### With GitHub Copilot (recommended)

1. Open the project in **VS Code**
2. Open **Copilot Chat** → select **treatment-refund-claim-agent** from the agents dropdown
3. Say: *"Submit a claim for shiatzu number 1"*
4. The agent will:
   - Read the receipt and referral
   - Show you a summary for confirmation
   - Open a visible browser to the Ayalon portal
   - Fill the form step by step (you can watch)
   - Upload all documents
   - Ask for final confirmation before submitting

### With GitHub Copilot CLI

```bash
copilot-cli "Submit a claim for shiatzu number 1"
```

## File Structure

```
.
├── .github/
│   ├── agents/
│   │   └── treatment-refund-claim-agent.agent.md   # Agent definition
│   └── skills/
│       ├── document-reader/
│       │   ├── SKILL.md                             # Skill instructions
│       │   └── read_document.py                     # PDF/image text extractor
│       └── web-interaction/
│           └── SKILL.md                             # Browser automation skill
├── .gitignore
├── copilot-instructions.md                          # Copilot custom instructions
├── package.json
├── user-info.example.md                             # Template for user details
├── user-info.md                                     # Your actual details (git-ignored)
├── <provider>/                                      # Treatment documents (git-ignored)
│   ├── certificate.jpeg
│   ├── Doctor referral.pdf
│   └── 1/
│       └── receipt.pdf
└── README.md
```

## Supported Treatment Types

The agent supports all treatment categories available on Ayalon's portal:
- **טיפולים** — Treatments (physiotherapy, shiatsu, complementary medicine, etc.)
- **בדיקות רפואיות** — Medical tests
- **התייעצות** — Consultations
- **ניתוחים** — Surgeries
- **תרופות** — Medications
- **רפואה משלימה** — Complementary medicine
- And more

## Security Notes

- `user-info.md` is **git-ignored** — your personal details are never committed
- Treatment document folders are **git-ignored** — your medical documents stay local
- The agent uses a **visible browser** — you can see everything it does
- The agent **always asks for confirmation** before submitting
- OTP/login credentials are entered by **you** in the browser, not stored anywhere

## License

MIT
