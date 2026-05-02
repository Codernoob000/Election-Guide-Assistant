# 🗳️ ElectionBot — Your Civic Education Assistant

> **Empowering informed voters in 8 languages** — built with Google Gemini AI, Google Translate API, and modern web technologies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20-green.svg)
![Languages](https://img.shields.io/badge/languages-8-orange.svg)

---

## 🎯 Chosen Vertical

**Civic Education & Democratic Participation** — Helping citizens understand elections, voting rights, and the democratic process through AI-powered multilingual assistance.

---

## 🌍 Multilingual Support

| Flag | Language | Code | Script | Direction |
|------|----------|------|--------|-----------|
| 🇺🇸 | English | `en` | Latin | LTR |
| 🇮🇳 | Hindi | `hi` | Devanagari | LTR |
| 🇪🇸 | Spanish | `es` | Latin | LTR |
| 🇫🇷 | French | `fr` | Latin | LTR |
| 🇸🇦 | Arabic | `ar` | Arabic | **RTL** |
| 🇧🇩 | Bengali | `bn` | Bengali | LTR |
| 🇧🇷 | Portuguese | `pt` | Latin | LTR |
| 🇨🇳 | Mandarin | `zh` | Simplified Chinese | LTR |

---

## 🏗️ Architecture & Approach

### Multi-Agent Architecture

This project was built using a **4-agent system**:

1. **Agent 1 — Architect**: Designed the i18n system, component structure, and data flow
2. **Agent 2 — Builder**: Implemented all components, services, hooks, and locale files
3. **Agent 3 — QA**: Validated multilingual correctness, accessibility, security, and performance
4. **Agent 4 — Deployer**: Containerized and configured CI/CD pipelines

### i18n System

- **Static translations**: All UI text is translated via `i18next` using 8 JSON locale files
- **Dynamic translations**: Chat responses from Gemini AI are translated in real-time via Google Translate API
- **RTL support**: Arabic triggers `dir="rtl"` on `<html>`, CSS handles layout mirroring
- **Font loading**: Noto font family loaded on-demand for Devanagari, Arabic, Bengali, and Chinese scripts

### How It Works

```
User selects language → Entire UI switches instantly (i18next)
                      → Chat responses auto-translated (Google Translate API)
                      → Gemini AI understands all languages natively
                      → HTML lang/dir attributes update for accessibility
                      → Font loads for the active script
```

---

## 🔧 Google Services Used

| Service | Role |
|---------|------|
| **Google Gemini AI** | Powers the election education chatbot with intelligent, nonpartisan responses |
| **Google Translate API** | Translates chat responses in real-time to the user's selected language |
| **Google Fonts** | Noto Sans family for rendering Devanagari, Arabic, Bengali, and Chinese scripts |
| **Google Analytics GA4** | Tracks page views, language changes, and user engagement |
| **Google Cloud Run** | Serverless container deployment |
| **Google Cloud Build** | CI/CD pipeline for automated builds and deployments |

---

## 📋 Features

- 💬 **AI-Powered Chat** — Ask election questions in any of 8 languages
- 📅 **Election Timeline** — Interactive 8-stage timeline with expand/collapse
- ✅ **Voter Checklist** — Track voting readiness with sessionStorage persistence
- 🌓 **Dark/Light Mode** — Theme persists in localStorage
- 🌐 **Language Selector** — Switches all UI text simultaneously
- ♿ **Accessibility** — ARIA labels, skip links, focus states, screen reader support
- 📱 **Responsive** — Works on 375px, 768px, 1280px breakpoints
- 🛡️ **XSS Protection** — User input sanitized with DOMPurify

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 20+
- npm 9+
- Google Gemini API key
- Google Translate API key (optional, for dynamic translation)
- Google Analytics Measurement ID (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/election-guide-assistant.git
cd election-guide-assistant

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Fill in your API keys in .env
# VITE_GEMINI_API_KEY=your_key
# VITE_GOOGLE_TRANSLATE_API_KEY=your_key
# VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for chat responses |
| `VITE_GOOGLE_TRANSLATE_API_KEY` | ⚠️ Recommended | Google Translate API key for dynamic chat translation |
| `VITE_GA_MEASUREMENT_ID` | ❌ Optional | Google Analytics GA4 measurement ID |

> ⚠️ **Security Note**: `VITE_` prefixed variables are exposed in the client bundle. In production, proxy API calls through a backend server to protect your API keys.

---

## 🐳 Deployment

### Docker

```bash
docker build \
  --build-arg VITE_GEMINI_API_KEY=your_key \
  --build-arg VITE_GOOGLE_TRANSLATE_API_KEY=your_key \
  --build-arg VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX \
  -t election-guide .

docker run -p 8080:8080 election-guide
```

### Google Cloud Run

```bash
# Using Cloud Build
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_VITE_GEMINI_API_KEY=your_key,_VITE_GOOGLE_TRANSLATE_API_KEY=your_key,_VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## ♿ Accessibility

- **RTL Support**: Arabic triggers `dir="rtl"` on `<html>` with CSS layout mirroring
- **ARIA Labels**: All interactive elements use translated `aria-label` values
- **Skip Links**: "Skip to main content" link for keyboard navigation
- **Focus States**: Visible focus indicators in all themes
- **Screen Reader**: `aria-live="polite"` on chat container for message announcements
- **Semantic HTML**: Proper heading hierarchy, landmark regions

---

## 📝 Assumptions

- US election process used as primary reference framework
- Architecture is extensible to other democratic systems
- Google Translate API provides "good enough" translations with attribution badge
- Gemini AI naturally understands multilingual input

---

## 🧪 Testing

Comprehensive test suite using **Vitest + React Testing Library + MSW**.

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Visual test runner |
| `npm run test:coverage` | Coverage report |

### Test Files

| File | What it covers |
|------|----------------|
| `geminiService.test.js` | Core paths, edge cases, integration for AI service |
| `translateService.test.js` | Translation API, no-op for English, error fallbacks |
| `ChatContext.test.jsx` | State management, error handling, sessionStorage |
| `ElectionTimeline.test.jsx` | 8 stages, expand/collapse, data integration |
| `VoterChecklist.test.jsx` | Checklist state, progress, persistence |
| `LanguageSelector.test.jsx` | 8 languages, RTL, font switching, analytics |
| `accessibility.test.jsx` | ARIA attributes, axe-core scans, semantic HTML |
| `chatFlow.test.jsx` | Full chat pipeline integration scenarios |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for civic empowerment.
