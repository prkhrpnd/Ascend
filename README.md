# Ascend: Responsible Student Credit and Financial Health Platform

Ascend is a data-first starter credit line and credit-building platform designed for higher education students in India. With explicit, per-purpose DPDP consent, students link their bank cash flow via an Account Aggregator boundary or upload a bank statement CSV.

A deterministic financial engine replays historical cash flow, evaluates affordability under baseline and stress conditions (Day-1 backtest), and sets starter credit limits equal to the lowest of three conservative caps: min(Tier Cap, Capacity Cap, Stress Due-Date Cap).

A regulated partner lender issues a small revolving ₹500 line, repaid automatically two days after the student's primary income lands via AutoPay. On-time repayments are reported to the credit bureau, building a formal credit track record before graduation.

---

## Key Architectural Principles

1. **Deterministic Financial Logic**:
   All limit assessments, capacity caps, recurrence detection, fee calculations, and cycle transitions reside in `/lib/engine`. AI is strictly confined to plain-language explanations and classification of unknown transaction narrations. AI never determines approvals or credit limits.

2. **Supabase Multi-Tenant Isolation**:
   Every private record is scoped strictly by authenticated `user_id`. Row Level Security (RLS) policies enforce multi-user isolation across all 10 core tables:
   - `profiles`: Student enrollment, institution, and program details
   - `consents`: Granular DPDP consent records with purpose and expiration
   - `bank_connections`: Account Aggregator FIP connections and account tokens
   - `statement_uploads`: Upload metadata and private storage references
   - `transactions`: Normalized and deduplicated bank statement ledger
   - `financial_analyses`: Deterministic cap calculations and backtest outputs
   - `credit_simulations`: Affordability and stress scenario projections
   - `repayment_records`: Historical cycle payments and bureau audit status
   - `report_shares`: Voluntary parent/landlord report card tokens
   - `audit_logs`: Immutable security and privacy audit trail

3. **Hybrid Supabase Client Adapter**:
   The application features a dual-mode Supabase client (`/lib/supabase/client.ts`):
   - **Production Mode**: When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided, the app connects directly to remote Supabase Auth, PostgreSQL, and private Storage.
   - **Zero-Config Local Sandbox Mode**: When remote credentials are not supplied, the client seamlessly falls back to an in-browser and in-memory multi-user adapter with full user isolation, auth session recovery, and RLS filtering.

4. **Nationwide Multi-Institution Support**:
   Ascend supports verified students across universities and colleges nationwide, featuring an indexed search directory of institutions (`/config/institutions.ts`) alongside a customizable enrollment entry flow.

5. **Account Aggregator Boundary & Flexible CSV Ingestion**:
   - **AA Boundary**: Implements the RBI Account Aggregator protocol with FIP discovery (SBI, HDFC, ICICI, Kotak, Axis, PNB), consent artifact review, and sandbox OTP verification.
   - **CSV Ingestion**: Handles bank statements with automatic column detection (supporting varied Indian bank column formats such as `Particulars`, `Withdrawal`, `Deposit`), column mapping customization, and row deduplication.

6. **DPDP Data Governance**:
   Under the Digital Personal Data Protection (DPDP) Act, consents are un-prechecked by default. Students can inspect active consents, review data categories, revoke consent with one click, wipe statement data, or request permanent account deletion on `/settings`.

7. **Strict Copy & Formatting Standards**:
   - Zero em dashes (`—`) or en dashes (`–`) anywhere in user-facing copy.
   - All monetary values stored as integer paise in code and rendered in rupees with Indian digit grouping (e.g. ₹1,25,000).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server & Client Components)
- **Language**: TypeScript (Strict typing, Zero `any` in engine calculations)
- **Database & Auth**: Supabase (@supabase/supabase-js, PostgreSQL, RLS)
- **Styling**: Tailwind CSS (Warm editorial fintech theme with Fraunces, JetBrains Mono, and Caveat)
- **Statement Parsing**: PapaParse (with deduplication and column auto-mapping)
- **Validation**: Zod (Runtime validation across all API route handlers)
- **Testing**: Vitest (20 deterministic unit and architecture tests)

---

## Project Structure

```
ascend/
├── app/
│   ├── layout.tsx                # Root layout with AuthProvider & AppProvider
│   ├── page.tsx                  # Landing page with nationwide pilot CTA
│   ├── login/                    # Student sign-in page
│   ├── signup/                   # Student registration with institution selector
│   ├── forgot-password/          # Password recovery flow
│   ├── start/                    # Eligibility check and per-purpose DPDP consent
│   ├── link/                     # Account Aggregator sync & CSV upload
│   ├── ledger/                   # The Digital Khata (categorized transaction ledger)
│   ├── assess/                   # Day-1 Backtest & The Three Caps
│   ├── simulator/                # 60-day Forward Affordability Simulator
│   ├── offer/                    # Cost Card disclosure & self-set cap agreement
│   ├── line/                     # Active credit line dashboard & AutoPay scrubber
│   ├── score/                    # Repayment progress indicator & graduation
│   ├── report/                   # Shareable parent/landlord report card
│   ├── settings/                 # Profile, active consents, statement wipe, account deletion
│   ├── declarations/             # Complete Section 12 declarations
│   └── api/                      # REST endpoints for assessment, cycle, chat, and report
├── config/
│   ├── policy.ts                 # Central policy configuration (caps, pricing, buffers)
│   └── institutions.ts           # Nationwide searchable higher education directory
├── lib/
│   ├── supabase/                 # Supabase client, types, and AuthContext provider
│   ├── engine/                   # Deterministic underwriting math (caps, cost, cycle, parse)
│   ├── context/                  # AppContext user-scoped state provider
│   └── utils.ts                  # Currency formatting (integer paise to INR grouping)
├── supabase/
│   ├── schema.sql                # Production PostgreSQL schema with RLS policies
│   └── migrations/               # Database migration scripts
└── tests/
    ├── engine.test.ts            # 14 acceptance tests for financial logic
    └── user_journey.test.ts      # 6 verification tests for auth, RLS, CSV, and copy
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
If you do not configure Supabase credentials, the app will run in local isolated sandbox mode automatically.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm test
```
Runs all 20 tests verifying deterministic engine math, CSV column detection, multi-user isolation, and zero em/en dash copy compliance.

### 5. Typecheck & Build
```bash
npx tsc --noEmit
npm run build
```

---

## Regulatory Compliance Notes

- **Ascend is not a bank or NBFC**: All credit lines are issued and held by regulated lending partners (SIMULATED in this prototype).
- **DPDP Act Ready**: Un-prechecked consents, clear retention periods, and instant one-click revocation.
- **Zero Revenue from Late Fees**: Ascend earns from partner graduation fees and on-time behavior, never from penalties or late fees.
- **No Device Snooping**: Operates with zero access to contacts, photos, SMS, or camera.
