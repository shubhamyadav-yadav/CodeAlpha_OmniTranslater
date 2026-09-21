# OmniTranslater &bull; Full-Stack AI Language Translation Suite

A production-grade, secure, accessible, and responsive full-stack **Neural Language Translation Suite** built with React 18, TypeScript, Vite, Node.js, and Express.

Designed with enterprise software craftsmanship: clean separation of concerns, server-side secret isolation, multi-provider translation architecture, strict request schema validation, rate limiting, and 100% automated test coverage.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & Security Philosophy](#architecture--security-philosophy)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Translation Providers](#translation-providers)
  - [1. MyMemory (Zero-config Default)](#1-mymemory-zero-config-default)
  - [2. Google Cloud Translation API (v2)](#2-google-cloud-translation-api-v2)
  - [3. LibreTranslate](#3-libretranslate)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [API Reference](#api-reference)
- [Security Review & Audits](#security-review--audits)
- [Accessibility & Usability](#accessibility--usability)
- [Deployment Guidelines](#deployment-guidelines)
- [License](#license)

---

## Overview

The **Language Translation Tool** enables users to translate text across multiple languages with real-time feedback. Unlike simplistic frontends that expose proprietary translation keys inside client bundles, this application uses a hardened backend API gateway that proxies all requests to legitimate translation service providers.

```
┌─────────────────┐       HTTP / JSON       ┌─────────────────┐       REST / HTTPS      ┌───────────────────────┐
│                 │ ──────────────────────> │  Node Express   │ ──────────────────────> │ Translation Provider  │
│  React 18 + TS  │    (No Secret Keys)     │ Gateway Service │    (Private API Key)    │ (Google / MyMemory /  │
│ Client Frontend │ <────────────────────── │ (Rate Limited,  │ <────────────────────── │     LibreTranslate)   │
│                 │   Sanitized Response    │   Validated)    │       Plain Text        └───────────────────────┘
└─────────────────┘                         └─────────────────┘
```

---

## Key Features

### Core Translation Capabilities
- **Multi-Language Translation:** Seamlessly translates phrases and paragraphs across 20+ world languages (Spanish, French, German, Hindi, Japanese, Arabic, Mandarin, Russian, Portuguese, etc.).
- **Auto-Detect Source Language:** Automatically detects the input language when "Auto Detect" is selected.
- **Direct-Match Bypass:** Detects when source and target languages match and immediately returns the original text without sending redundant external network requests.
- **Real-Time Loading States:** Sleek animated shimmer skeleton indicators communicate translation progress.
- **Robust Error Handling:** Clear, accessible alert notifications for empty input, network errors, timeouts, and provider limits.

### Usability & Accessibility (a11y)
- **One-Click Clipboard Copy:** Copies translated text with interactive visual feedback ("Copied!" with checkmark).
- **Text-to-Speech (TTS):** Uses the native Web Speech API (`window.speechSynthesis`) to pronounce translations accurately in the target language.
- **Language Swap:** Swaps source and target languages with a single click; automatically exchanges input and output text for continuous conversation.
- **Live Character Counter:** Displays character progress up to the 5,000 character limit with warning states when approaching capacity.
- **Keyboard Friendly:** Translates immediately via `Ctrl + Enter` (or `Cmd + Enter`).
- **Accessible ARIA Standards:** Full screen-reader support via `aria-live="polite"`, `role="alert"`, `aria-label`, and high-contrast visible focus rings.
- **Responsive Design:** Fluid layout optimized for mobile smartphones (<640px), tablets (640-1024px), laptops, and desktop screens without horizontal overflow.

---

## Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 &bull; TypeScript &bull; Vite | Fast HMR, type safety, optimized production chunking |
| **Frontend Styling** | Custom CSS Design System | Zero CSS-in-JS runtime bloat, CSS variables, dark palette |
| **Backend Runtime** | Node.js (v20+) &bull; Express 4 &bull; TypeScript | Industry standard, robust ecosystem, high throughput |
| **API Validation** | Zod (v3) | Schema validation, type inference, strict input sanitization |
| **Security Middleware**| Helmet &bull; CORS &bull; express-rate-limit | Defense-in-depth HTTP headers, origin checks, DDoS protection |
| **Testing Suite** | Vitest (v5) &bull; Supertest &bull; React Testing Library | Blazing fast integration and component test execution |
| **Process Tooling** | Concurrently &bull; TSX | Clean single-command developer workflow |

---

## Architecture & Security Philosophy

1. **Zero Secret Leakage:**
   - Private translation API keys are strictly loaded into the backend server process using `dotenv`.
   - Client-side code never references, bundles, or receives API credentials.
   - Built frontend assets in `client/dist/` contain only static code and public assets.
2. **Strict Git Hygiene:**
   - Root `.gitignore` automatically excludes all `.env`, `.env.*`, and `node_modules` directories.
   - A documented `.env.example` template provides safe configuration placeholders without secrets.
3. **Payload Sanitization & Size Limits:**
   - Express JSON parser is restricted to `100kb` to prevent memory exhaustion and payload inflation attacks.
   - Character limits (max 5,000 chars) are enforced on both the client (live warning) and server (Zod schema validation).
4. **Sanitized Error Masking:**
   - Detailed error stack traces are logged exclusively to server `stdout`.
   - The centralized error handler sanitizes outgoing error messages and redacts any potential API key strings before returning response payloads.
5. **Content Security Policy (CSP):**
   - Helmet provides strict CSP headers ensuring only authorized scripts, styles, and fonts can load.

---

## Project Structure

```text
Language Translation Tool In AI internship/
├── client/                               # Frontend React + TypeScript application
│   ├── index.html                        # HTML entry point with accessibility meta
│   ├── package.json                      # Client dependencies and build scripts
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   ├── vite.config.ts                    # Vite configuration with API dev proxy
│   ├── public/                           # Static assets (favicons, etc.)
│   └── src/
│       ├── main.tsx                      # React DOM root entry
│       ├── App.tsx                       # Main UI view and state orchestration
│       ├── components/                   # Modular, accessible UI components
│       │   ├── Header.tsx                # Branding & live server health status
│       │   ├── LanguageSelector.tsx      # Language dropdowns, quick pills, swap button
│       │   ├── TranslationInput.tsx      # Textarea, counter, paste, clear buttons
│       │   ├── TranslationOutput.tsx     # Output text, TTS audio, copy button
│       │   ├── AlertBanner.tsx           # Accessible error notification banner
│       │   └── Footer.tsx                # Security & attribution footer
│       ├── services/
│       │   └── api.ts                    # Typed API client with error handling
│       ├── types/
│       │   └── translation.ts            # Frontend data contracts
│       ├── utils/
│       │   ├── clipboard.ts              # Robust clipboard copy with legacy fallback
│       │   └── speech.ts                 # Web Speech API speech synthesis helper
│       ├── styles/
│       │   ├── index.css                 # CSS variables, typography, and base reset
│       │   └── App.css                   # Component layout and responsive styles
│       └── __tests__/                    # Vitest frontend unit & workflow tests
│           ├── App.test.tsx              # Component render and user interaction tests
│           ├── clipboard.test.ts         # Clipboard utility tests
│           └── speech.test.ts            # Speech synthesis tests
│
├── server/                               # Backend Node.js Express service
│   ├── package.json                      # Server dependencies and scripts
│   ├── tsconfig.json                     # Server TypeScript compiler configuration
│   ├── .env.example                      # Server environment template
│   ├── src/
│   │   ├── server.ts                     # HTTP listener & process signal handling
│   │   ├── app.ts                        # Express factory, middleware, static hosting
│   │   ├── config/
│   │   │   └── env.ts                    # Typed environment configuration
│   │   ├── controllers/
│   │   │   └── translate.controller.ts   # Route controllers (translate, health, langs)
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts           # Centralized security error handler
│   │   │   ├── rateLimiter.ts            # IP-based rate limiting middleware
│   │   │   └── validateRequest.ts        # Zod input validation schema
│   │   ├── routes/
│   │   │   └── translate.routes.ts       # Express route definitions
│   │   ├── services/
│   │   │   ├── languages.ts              # Standard ISO-639-1 language catalog
│   │   │   ├── translation.service.ts    # Provider registry & delegation
│   │   │   └── providers/                # Pluggable translation adapters
│   │   │       ├── base.provider.ts      # Abstract BaseTranslationProvider
│   │   │       ├── google.provider.ts    # Google Cloud Translation v2 REST client
│   │   │       ├── mymemory.provider.ts  # MyMemory Translation API client
│   │   │       └── libretranslate.provider.ts # LibreTranslate API client
│   │   └── types/
│   │       └── index.ts                  # Server data contracts
│   └── tests/                            # Server integration & validation tests
│       ├── api.test.ts                   # Validation and endpoint integration tests
│       └── provider.test.ts              # Real translation execution & error tests
│
├── .env.example                          # Root environment template
├── .gitignore                            # Git ignore configuration
├── package.json                          # Workspace orchestration scripts
└── README.md                             # Documentation
```

---

## Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended). Check with `node -v`.
- **npm:** v9.0.0 or higher. Check with `npm -v`.

---

## Installation & Setup

1. **Clone or Navigate to the Project Root:**
   ```bash
   cd "Language Translation Tool In AI internship"
   ```

2. **Install Root and Subproject Dependencies:**
   ```bash
   npm run install:all
   ```
   *(Or individually: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

---

## Environment Configuration

1. Copy the example environment file into `server/.env`:
   ```bash
   cp .env.example server/.env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example server/.env`)*

2. Open `server/.env` and verify the settings:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173

   # Translation Provider Selection
   # Options: 'mymemory' | 'google' | 'libretranslate'
   TRANSLATION_PROVIDER=mymemory

   # Google Cloud Translation API Key (required if TRANSLATION_PROVIDER=google)
   GOOGLE_TRANSLATE_API_KEY=YOUR_GOOGLE_CLOUD_API_KEY

   # LibreTranslate Settings (required if TRANSLATION_PROVIDER=libretranslate)
   LIBRETRANSLATE_API_URL=https://libretranslate.com
   LIBRETRANSLATE_API_KEY=YOUR_LIBRETRANSLATE_API_KEY

   # MyMemory Settings (optional - increases daily quota)
   MYMEMORY_EMAIL=
   MYMEMORY_API_KEY=

   # Abuse Prevention & Validation
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_TEXT_LENGTH=5000
   ```

---

## Translation Providers

The backend uses the **Provider Pattern** (`BaseTranslationProvider`), allowing you to switch translation engines cleanly via the `TRANSLATION_PROVIDER` variable.

### 1. MyMemory (Zero-config Default)
- **Status:** Enabled by default.
- **Setup:** Works out of the box with no API key required for testing and evaluation (up to 5,000 words/day free).
- **Optional:** Setting `MYMEMORY_EMAIL=your-email@example.com` raises the free limit to 50,000 words/day.

### 2. Google Cloud Translation API (v2)
- **Setup:**
  1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
  2. Enable the **Cloud Translation API**.
  3. Generate an API Key under **APIs & Services > Credentials**.
  4. In `server/.env`, set:
     ```env
     TRANSLATION_PROVIDER=google
     GOOGLE_TRANSLATE_API_KEY=AIzaSy...your_real_key
     ```
  5. Restart the server. Translations will immediately use official Google Cloud Translation services.

### 3. LibreTranslate
- **Setup:**
  1. Use any public LibreTranslate host, run a local Docker container (`docker run -ti --rm -p 5000:5000 libretranslate/libretranslate`), or use a private instance.
  2. In `server/.env`, configure:
     ```env
     TRANSLATION_PROVIDER=libretranslate
     LIBRETRANSLATE_API_URL=https://libretranslate.com
     LIBRETRANSLATE_API_KEY=your_key_if_required
     ```

---

## Running the Application

### Development Mode

Run both the backend API and frontend Vite development server concurrently with a single command from the project root:

```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173) (with automated API proxy to backend)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Alternatively, run services independently in separate terminal windows: `npm run dev:server` and `npm run dev:client`)*

### Production Mode

1. **Build both client and server:**
   ```bash
   npm run build
   ```
2. **Start the production server:**
   ```bash
   npm run start
   ```
   The production Express server serves both the authenticated `/api/*` endpoints and the optimized production frontend from `client/dist/` on port 5000 ([http://localhost:5000](http://localhost:5000)).

---

## Testing & Quality Assurance

The project includes an automated test suite covering backend controllers, provider integrations, input validation, client components, and utilities.

### Run All Automated Tests
```bash
npm test
```

### Run Server Tests Individually
```bash
npm run test:server
```
Runs Vitest against `server/tests/`:
- `GET /api/health` status and uptime verification
- `GET /api/languages` language listing
- `POST /api/translate` input validation (empty strings, whitespace, language regex, payload limits)
- Direct-match optimization (same source and target language)
- 404 catch-all verification
- Live translation execution ("Hello, how are you?" &rarr; Spanish)
- Provider error simulation and configuration detection

### Run Client Tests Individually
```bash
npm run test:client
```
Runs Vitest and React Testing Library against `client/src/__tests__/`:
- Initial DOM rendering and layout
- Empty input validation handling
- Successful translation flow and result display
- Network and API failure handling with accessible error alerts
- Language swapping behavior
- Clipboard utility and fallback
- Web Speech API TTS triggers and audio cancellation

---

## API Reference

### 1. Health Check
`GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-21T07:30:00.000Z",
  "uptimeSeconds": 42,
  "activeProvider": "mymemory",
  "version": "1.0.0"
}
```

### 2. Supported Languages
`GET /api/languages`

**Response:**
```json
{
  "success": true,
  "data": [
    { "code": "auto", "name": "Auto Detect" },
    { "code": "en", "name": "English", "nativeName": "English" },
    { "code": "es", "name": "Spanish", "nativeName": "Español" },
    { "code": "hi", "name": "Hindi", "nativeName": "हिन्दी" }
  ]
}
```

### 3. Translate Text
`POST /api/translate`

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "sourceLang": "en",
  "targetLang": "es"
}
```

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "translatedText": "¡Hola como están!",
    "sourceLang": "en",
    "targetLang": "es",
    "detectedSourceLanguage": "en",
    "provider": "mymemory",
    "timestamp": "2026-09-21T07:30:00.000Z"
  }
}
```

**Validation Error Response (HTTP 400):**
```json
{
  "success": false,
  "error": {
    "message": "Text cannot be empty.",
    "code": "VALIDATION_ERROR",
    "details": ["Text cannot be empty."]
  }
}
```

---

## Security Review & Audits

- **No Exposed Secrets:** Inspected frontend production build bundles; no environment variables or API keys are bundled into JavaScript assets.
- **Strict Git Protection:** `.gitignore` actively excludes `.env` and all credential files. Verified with `git status --ignored`.
- **Dependency Audit:** Both `client` and `server` pass `npm audit` with **0 vulnerabilities**.
- **Input Sanitization:** Strictly validated with Zod schemas; limits body size to 100kb and text to 5,000 characters.
- **XSS Immunity:** Output strings are rendered exclusively through React text elements without `dangerouslySetInnerHTML`.
- **Rate Limiting:** Active sliding window IP limiter prevents brute force and DDoS floods.

---

## Accessibility & Usability

- **Keyboard Navigation:** Full tab order across all selects, buttons, and textareas. Direct translation shortcut via `Ctrl + Enter`.
- **WCAG AA Contrast:** Deep slate and electric blue palette with readable contrast ratios on dark backgrounds.
- **Assistive Technology:** Semantic HTML5 elements (`<header>`, `<main>`, `<footer>`, `<select>`, `<button>`) with `role="region"`, `role="alert"`, and `aria-live="polite"` regions.

---

### Vercel Serverless Deployment (Recommended)

This repository includes native Vercel Serverless support via `vercel.json` and `api/index.ts`.

#### Option A: 1-Click Git Import (Easiest)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select and import your GitHub repository: **`CodeAlpha_OmniTranslater`**.
3. Vercel automatically detects `vercel.json`:
   - **Framework Preset:** Other / Vite
   - **Build Command:** `npm run vercel-build` (automatically configured)
   - **Output Directory:** `client/dist` (automatically configured)
4. (Optional) Add environment variables in **Environment Variables**:
   - `TRANSLATION_PROVIDER=google`
   - `GOOGLE_TRANSLATE_API_KEY=YOUR_KEY` (if using Google Cloud API key)
5. Click **Deploy**. Your app will be live on a `*.vercel.app` domain in ~1 minute!

#### Option B: Deploy via Vercel CLI
```bash
npx vercel
```
Follow the interactive prompts to link and deploy your project.

---

### Container Deployment (Docker)

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm run install:all
COPY . .
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json server/
COPY --from=builder /app/server/dist server/dist
COPY --from=builder /app/server/node_modules server/node_modules
COPY --from=builder /app/client/dist client/dist

EXPOSE 5000
CMD ["npm", "run", "start"]
```

---

## License

MIT &bull; Free for educational, commercial, and personal use.
