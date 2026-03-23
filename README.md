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

## ⚠️ Important Disclaimer

> **USE AT YOUR OWN RISK — READ THIS BEFORE USING**

### Nature of This Tool

This agent is a **facilitation tool only**. It automates the mechanical process of filling web forms and uploading documents — the same actions you would perform manually in your browser. It is **not** a licensed insurance advisor, legal representative, or financial service provider. It does not provide insurance advice, legal counsel, or medical guidance of any kind.

### How Authentication Works

- The agent **does not store, handle, or have access to your passwords or OTP codes**. 
- You must authenticate yourself by entering your OTP (one-time password) **directly in the browser window**. The agent cannot and does not bypass any security mechanisms.
- The agent interacts with the Ayalon Insurance website **exactly as a human user would** — through a standard browser session that you can see and monitor in real time.

### Your Responsibility

- **You are solely and entirely responsible** for verifying that all information entered into the claim form is accurate, complete, and truthful before submission.
- **You must review every field, every uploaded document, and every selection** the agent makes before confirming submission. The agent will prompt you for confirmation, but the final responsibility is yours.
- Submitting false, inaccurate, or misleading information to an insurance company — whether done manually or through an automated tool — **may constitute fraud** and can result in claim denial, policy cancellation, legal action, or criminal prosecution under applicable Israeli law.
- The agent may make mistakes, including but not limited to: selecting wrong dropdown values, entering incorrect amounts, uploading wrong documents, misreading PDF text, or filling fields with data from the wrong receipt. **You must catch and correct any errors before submission.**

### No Warranties

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. THE AUTHORS AND COPYRIGHT HOLDERS SHALL NOT BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE, INCLUDING BUT NOT LIMITED TO:

- Denied insurance claims due to incorrect or incomplete submissions
- Financial losses resulting from errors in form filling
- Legal consequences arising from submission of inaccurate information
- Loss of insurance coverage or benefits
- Any damages arising from reliance on the agent's output without independent verification
- Service disruptions caused by changes to the Ayalon Insurance website

### No Affiliation

This project is **not affiliated with, endorsed by, or associated with Ayalon Insurance (איילון ביטוח)** or any insurance company. It is an independent, open-source automation tool. The Ayalon Insurance website may change at any time, which could cause this tool to malfunction or produce incorrect results.

### Applicable Law

Insurance claims in Israel are governed by the Insurance Contract Law (חוק חוזה הביטוח), 1981, and related regulations. The user is responsible for ensuring compliance with all applicable laws and the terms of their insurance policy.

### By Using This Tool, You Acknowledge That:

1. You have read and understood this disclaimer
2. You accept full responsibility for any claims submitted using this tool
3. You will verify all information before submission
4. You understand the agent is a facilitation tool and not a substitute for your own judgment
5. You will not hold the authors liable for any consequences of using this tool

---

## Security Notes

- `user-info.md` is **git-ignored** — your personal details are never committed
- Treatment document folders are **git-ignored** — your medical documents stay local
- The agent uses a **visible browser** — you can see everything it does
- The agent **always asks for confirmation** before submitting
- OTP/login credentials are entered by **you** in the browser, not stored anywhere

## License

MIT — see disclaimer above for limitation of liability.
