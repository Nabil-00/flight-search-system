# AI-Assisted Conversational Flight Search and Availability System

An enterprise-grade, web-based flight search and availability platform that automates the process of receiving customer flight requirements expressed in natural language, converting them into structured flight-search data, validating the data deterministically, querying flight availability via Duffel, and proposing alternatives ($D-1$ and $D+1$) when the requested date has no suitable flights.

---

## Core Principle
> **AI interprets the customer's language. The application validates, decides, and executes the search.**
> The AI layer must not directly control the flight provider or bypass application validation.

---

## Brand Palette & Design Architecture

The interface uses the locked corporate palette:
- **White** (`#FFFFFF`): Main backgrounds, cards, and clean surfaces
- **Storm Green** (`#0F282F`): Header, navigation, dark surfaces, text headings
- **Vivid Cyan** (`#02EFF0`): Primary CTA, active states, highlights, badge accents
- **Brand Gradient**: `linear-gradient(135deg, #0F282F 0%, #02EFF0 100%)`

---

## System Architecture

```
CUSTOMER (Web / Chat)
       │
       ▼
FRONTEND APPLICATION (React / Next.js)
  • ConversationPanel.tsx
  • FlightSearchForm.tsx
  • RequestSummary.tsx
  • FlightResults.tsx
  • AlternativeFlights.tsx
  • LoadingState.tsx
  • ErrorMessage.tsx
       │
       ▼ HTTPS
NEXT.JS / VERCEL BACKEND
  ├── POST /api/normalize
  └── POST /api/flights/search
       │
  ┌────┴────────────────────────┐
  ▼                             ▼
AI EXTRACTION (DeepSeek)   FLIGHT SEARCH ORCHESTRATOR
(via OpenRouter)                │
  │                             ▼
  ▼                       DUFFEL ADAPTER
REQUEST NORMALIZER              │
  • Location                    ▼
  • Passenger             DUFFEL TEST API
  • Cabin                       │
  • Date                        ▼
  │                       RESPONSE NORMALIZER
  ▼                             │
VALIDATION ENGINE               ▼
(VALID / INCOMPLETE       AVAILABILITY DECISION
 INVALID / AMBIGUOUS)      • D Available?
                                ├── YES ──► AVAILABLE
                                └── NO  ──► Search D-1 / D+1
                                                ├── Found ──► ALTERNATIVES_FOUND
                                                └── None  ──► NO_AVAILABILITY
```

---

## Architectural Layers

1. **Presentation Layer**: Built with React & Next.js App Router, featuring a dual-mode conversational panel and structured travel agent form.
2. **Application / API Layer**:
   - `POST /api/normalize`: Receives natural language input, invokes AI extraction, normalizes fields, and returns validation status (`VALID`, `INCOMPLETE`, `INVALID`, `AMBIGUOUS`).
   - `POST /api/flights/search`: Accepts canonical flight search request and runs the availability decision workflow.
3. **AI Layer**: DeepSeek via OpenRouter (`deepseek/deepseek-chat`) with strict JSON schema extraction, backed by a deterministic regex parser for offline/test resilience.
4. **Normalization Layer**:
   - Location: Maps city names, airport names, and aliases to standard IATA codes (e.g., Lagos $\rightarrow$ `LOS`, London Heathrow $\rightarrow$ `LHR`, Dubai $\rightarrow$ `DXB`).
   - Passengers: Parses quantities and phrases (e.g. "me and my wife" $\rightarrow$ 2 adults).
   - Cabin: Maps strings to `economy`, `premium_economy`, `business`, `first`.
   - Date: Resolves relative dates ("next Saturday", "tomorrow", "Friday next week") against reference dates.
5. **Validation Engine**: Enforces business rules (BR-001) ensuring all required fields exist and values are valid before contacting providers.
6. **Flight Provider Abstraction & Duffel Integration**:
   - Implements `FlightProvider` interface.
   - Communicates with Duffel Test API (`https://api.duffel.com/air/offer_requests`).
   - Built-in Sandbox Simulator mode for zero-configuration local evaluation.
   - Enforces **BR-009**: Provider/system errors (`DUFFEL_TIMEOUT`, `DUFFEL_AUTH_ERROR`, etc.) are never converted into `NO_AVAILABILITY`.

---

## Getting Started

### 1. Installation
```bash
cd flight-search-system
pnpm install # or npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```env
# DeepSeek AI API Key via OpenRouter
OPENROUTER_API_KEY=your_openrouter_key_here

# Duffel Flight API Sandbox Access Token
DUFFEL_ACCESS_TOKEN=your_duffel_token_here
```
*Note: The application operates in offline simulation mode automatically if API keys are not provided, allowing full evaluation without credentials.*

### 3. Run Development Server
```bash
pnpm dev # or npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running the Automated Test Suite

The project includes unit and integration tests across 4 dedicated directories:

```bash
pnpm test # or npm test
```

### Test Directory Structure
- `tests/normalization/location.test.ts`: City, airport, and IATA code resolution tests.
- `tests/normalization/passenger.test.ts`: Number and phrase passenger parsing tests.
- `tests/normalization/cabin.test.ts`: Cabin class normalization tests.
- `tests/normalization/date.test.ts`: Relative and ISO date parsing tests.
- `tests/validation/flight-request.test.ts`: Validation engine rule enforcement tests.
- `tests/ai/extraction.test.ts`: Natural-language customer request extraction tests.
- `tests/flight-search/orchestrator.test.ts`: Orchestrator $D$, $D-1$, $D+1$ search, alternative fallback, and error isolation tests.

---

## Demo Scenarios

The user interface includes one-click demo presets:
1. **Scenario 1 — Exact Availability**:
   - Input: *"I need 3 business class tickets from Lagos to Dubai next Saturday."*
   - Result: Extracts `LOS` $\rightarrow$ `DXB`, 3 adults, Business cabin. Searches requested date and returns available flights.
2. **Scenario 2 — No Availability / Alternatives**:
   - Input: *"I need a flight from Lagos to London on 2026-09-18 in economy."*
   - Result: Requested date has no availability. The orchestrator automatically searches $D-1$ and $D+1$ and displays alternative flights.
3. **Scenario 3 — Incomplete Request**:
   - Input: *"I need to go to London next week."*
   - Result: Flags missing departure city, passenger count, and cabin class; displays context-aware clarification questions.
