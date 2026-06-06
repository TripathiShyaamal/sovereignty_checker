# IOMETE — Data Sovereignty Checker

A clean web app that helps companies understand their data sovereignty risk
based on six inputs and guides them toward the right infrastructure approach.
Risk scoring runs in the client, while a Netlify function uses OpenAI to
generate the result content.

The app is built with React 19, Tailwind CSS (used selectively), and uses
`html2canvas` for the "Download Card" feature. It uses Google Fonts CDN to load
Archivo, Inter, and DM Mono — so it needs an internet connection on first load
unless you self-host the fonts.

## Project structure

```
iomete-data-sovereignty-checker/
├── README.md
├── package.json
├── craco.config.js          # adds the "@/" path alias
├── jsconfig.json            # IDE awareness of "@/" alias
├── tailwind.config.js
├── postcss.config.js
├── netlify/
│   └── functions/
│       ├── generate-result.js       # generates result copy with OpenAI
│       └── send-report.js           # emails the full report with Resend
├── .gitignore
├── public/
│   └── index.html           # loads Google Fonts + mounts React
├── src/
│   ├── index.js             # React entry
│   ├── App.js               # mounts <SovereigntyChecker />
│   ├── App.css
│   ├── index.css            # font-family defaults + screen transitions
│   ├── components/
│   │   └── SovereigntyChecker.jsx   # entire UI: form, result, indicator,
│   │                                # checklist, email capture, share card,
│   │                                # book CTA
│   └── lib/
│       └── sovereigntyLogic.js      # risk assessment + local reference copy
└── build/                   # production build, already compiled
    └── index.html
```

## Run locally (development mode, with hot reload)

```bash
yarn install
yarn start
```

The dev server runs on http://localhost:3000.

If you prefer npm:

```bash
npm install
npm start
```

## Build for production

```bash
yarn build
```

This produces the static `build/` folder used by the Netlify deployment.

## Netlify configuration

Set `OPENAI_API_KEY` and `RESEND_API_KEY` in the Netlify site's environment
variables. Set `RESEND_FROM_EMAIL` to an address on a verified Resend domain;
otherwise the email function uses Resend's onboarding sender. The result
generator is available at `/.netlify/functions/generate-result`, and report
emails are sent through `/.netlify/functions/send-report`.

## Run the pre-built version (no installation required)

A production build is already included in the `build/` directory. Two options:

**Option A — serve via a tiny local HTTP server (recommended):**

```bash
npx serve build
# or
python3 -m http.server -d build 8000
```

Then open http://localhost:8000 in your browser.

**Option B — open the file directly:**

Most modern browsers will run `build/index.html` directly via `file://` because
the build uses relative paths (`homepage: "."` in `package.json`). Some
browsers restrict module loading from `file://` though, so if you see a blank
page, fall back to Option A.

## How the app works

1. The user answers six questions about their industry, company size, data
   location, jurisdictions, top priority, and whether their team has discussed
   sovereignty.
2. `assessRisk()` in `src/lib/sovereigntyLogic.js` classifies the user into
   **High**, **Moderate**, or **Low Sovereignty Exposure** using the rules in
   the original product spec.
3. The form sends the answers and risk level to the `generate-result` Netlify
   function, which uses `gpt-4o-mini` and a data sovereignty knowledge base to
   generate structured result content.
4. The result screen renders:
   - a full-width risk header (Racing-900 background, FLUORO-400 label),
   - a static three-zone risk indicator with a vertical marker positioned at
     28% / 58% / 92% of the bar depending on the risk level,
   - two info cards ("Why You Got This Result", "What the Right Infrastructure
     Looks Like") generated dynamically from the user's inputs and a small
     industry-specific knowledge base,
   - a "What To Do Next" checklist with 3–5 input-specific actions,
   - a "Share this with your team" box with a one-paste, three-sentence
     summary and copy-to-clipboard,
   - an email-capture row (High / Moderate only),
   - a "Share your result" preview card that downloads as a PNG via
     `html2canvas`,
   - a "Talk to IOMETE" CTA (High / Moderate only).
4. The "Start over" link clears state and returns to the form.

## Design system

Exact hex values, applied via inline styles:

| Token | Value |
|------|-------|
| App background | `#F2EEEB` |
| Card background | `#FFFFFF` |
| Primary text | `#202020` |
| Secondary text | `#626261` |
| Borders | `#D0D0CD` |
| Primary (Racing-900) | `#2D382D` |
| Accent (FLUORO-400) | `#D3F52C` |
| Accent muted | `#A0B8A0` |
| Low risk label | `#617A61` |
| Inline error | `#ED7E68` |
| Copy box background | `#FCFCF8` |

Fonts:

- **Archivo** — all headings (form title, risk label, card titles, app title).
- **Inter** — body copy, field labels, descriptors, buttons.
- **DM Mono** — small technical tags and the PNG card footer.

## Notes on the email capture

The email-capture is a UI-only flow — no email is actually sent because the app
has no backend. On a valid email format it shows a confirmation message and the
input is replaced. If you want to wire this to a real email service, point the
`handleSend` function in `src/components/SovereigntyChecker.jsx` at the
endpoint of your choice.
