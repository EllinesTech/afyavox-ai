# AfyaVox AI

> Voice-Powered Clinical Assistant — Making Clinical Conversations Smarter, Faster, and Safer.

**Founder:** Elijah Mwangi (Ellines Tech)

---

## What Is AfyaVox AI?

AfyaVox AI is a **global** voice-to-notes clinical assistant. A doctor and patient can speak in **any language in the world** — Kikuyu, Luo, Kisii, Arabic, Chinese, Korean, Swahili, French, Spanish, Hindi, Portuguese, and 200+ more — and AfyaVox will:

1. **Transcribe** the conversation automatically (speech-to-text)
2. **Detect the language** automatically — no manual selection needed
3. **Translate** everything to English internally for AI processing
4. **Generate structured clinical notes** (symptoms, diagnosis, plan)
5. **Output the notes in the doctor's chosen language** — English, Chinese, Korean, Swahili, Arabic, or any language the doctor prefers

**Zero typing. Zero writing. The doctor just speaks.**

---

## How It Works

```
Doctor + Patient speak in ANY language
(Kikuyu, Luo, Kisii, Arabic, Chinese, Korean, Swahili, French, Hindi, 200+ more)
         │
         ▼
  Browser captures audio (any device — desktop, tablet, mobile)
         │
         ▼
  Whisper ASR → transcribes speech + auto-detects language
         │
         ▼
  NLLB Translation → converts ANY language to English
         │
         ▼
  Ollama LLM (local) → generates structured clinical notes in English
         │
         ▼
  Doctor selects output language
  (English / Chinese / Korean / Swahili / Arabic / French / any)
         │
         ▼
  Notes delivered → Copy / Export (PDF, DOCX) / Save to EMR
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  USERS & CLIENTS (any device, anywhere in the world)             │
│  Doctor (Web) │ Mobile (Android/iOS) │ Tablet │ Desktop │ Offline│
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTPS / TLS 1.3 / Secure WebSocket
┌──────────────────────────────▼───────────────────────────────────┐
│  APPLICATION LAYER (AfyaVox AI Core)                             │
│                                                                  │
│  Audio Capture (200+ languages)                                  │
│    → Whisper ASR: transcribe + auto-detect language              │
│    → NLLB Translation: ANY language → English                    │
│    → Ollama LLM: generate structured clinical notes              │
│    → Output Translation: English → doctor's chosen language      │
│    → Copy / Export (PDF, DOCX) / EMR Save                        │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│  PLATFORM & SERVICES LAYER                                       │
│  API Gateway │ Auth (JWT/OAuth2, RBAC) │ User Service            │
│  File/Media Service │ Notification Service │ Audit & Logging     │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│  INFRASTRUCTURE (Cloud / On-Premise)                             │
│  Docker │ Kubernetes │ GPU Servers │ Load Balancer │ CI/CD       │
│  PostgreSQL │ Redis │ Object Storage │ Monitoring                │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│  AI / MODELS LAYER (all free, all local)                         │
│  Whisper (ASR, 99 languages) │ NLLB-200 (translation, 200 langs) │
│  Ollama — LLaMA 3 / Mistral (clinical notes generation)          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Free |
| Backend | FastAPI (Python) | Free |
| Speech-to-Text | OpenAI Whisper (local, 99 languages) | Free |
| Translation | NLLB-200 (local, 200+ languages) | Free |
| Clinical Notes | Ollama — LLaMA 3 / Mistral (local) | Free |
| Database | PostgreSQL + Redis | Free |
| Auth | JWT / OAuth2 + RBAC | Free |
| Infrastructure | Docker + Kubernetes | Free |
| PWA / Installable | Vite PWA plugin | Free |

---

## Key Features

- Supports **200+ languages** — any language a doctor or patient speaks
- Doctor chooses the **output language** for clinical notes
- **No typing, no writing** — voice only
- Works on **any device** — desktop, tablet, mobile, offline
- **Installable** as a PWA on any device (no app store needed)
- **Secure** — patient data never leaves the local network
- **Subscription tiers** — free, professional, enterprise
- **EMR integration** — OpenMRS, Bahmni, TrakCare, Epic (Phase 7)

---

## Roadmap

| Phase | Scope | Timeline |
|---|---|---|
| 1 — Foundation | Audio recording, Whisper STT, transcript display | Weeks 1–2 |
| 2 — Translation | Auto language detection, NLLB (200+ languages → English) | Week 3 |
| 3 — AI Notes | Ollama LLM notes + doctor chooses output language | Week 4 |
| 4 — Frontend UI | Full responsive dashboard, PWA, copy/export, UX polish | Month 2 |
| 5 — Real-Time | Streaming ASR, speaker diarization (doctor vs patient) | Month 3 |
| 6 — Deployment | Cloud deploy, global CDN, subscription tiers, cross-device | TBD |
| 7 — Advanced | Offline mode, Android app, EMR integration, compliance | TBD |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- ffmpeg (required by Whisper — `choco install ffmpeg` on Windows)
- [Ollama](https://ollama.ai) (Phase 3+) — `ollama pull llama3`

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Subscription Tiers (Phase 6)

| Tier | Features |
|---|---|
| Free | Basic transcription, English output, 10 sessions/month |
| Professional | All languages, custom output language, unlimited sessions, export |
| Enterprise | EMR integration, RBAC, audit logs, on-premise deployment, SLA |

---

## Security & Compliance

- End-to-end encryption (transit & at rest)
- HIPAA / GDPR / ISO 27001 / HL7 FHIR
- Role-Based Access Control (RBAC)
- Audit logs (no patient content logged)
- Data anonymization + consent management

---

## Docs

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)

---

*AfyaVox AI v1.0 — Designed for Scalability, Security & Real-World Hospital Use*
*© Ellines Tech — Elijah Mwangi*
