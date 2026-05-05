# AfyaVox AI

> Voice-Powered Clinical Assistant — Making Clinical Conversations Smarter, Faster, and Safer.

**Founder:** Elijah Mwangi (Ellines Tech)

AfyaVox AI listens to doctor-patient consultations, transcribes speech in Swahili and English, translates to English, and generates structured clinical notes in real time — all running locally with no cloud dependency for patient data.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  USERS: Doctor (Web) │ Mobile (Android) │ Tablet │ Offline      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / Secure WebSocket
┌──────────────────────────────▼──────────────────────────────────┐
│  APPLICATION LAYER (AfyaVox AI Core)                            │
│                                                                 │
│  Audio Capture → Speech Processing → Whisper ASR               │
│       → Language Detection & Translation (NLLB/Whisper)        │
│       → AI Clinical Notes (Ollama — LLaMA 3 / Mistral)         │
│       → Output: Structured Notes │ Copy/Export │ EMR Save      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  PLATFORM & SERVICES LAYER                                      │
│  API Gateway │ Auth (JWT/OAuth2) │ User Service │ File Service  │
│  Notification Service │ Audit & Logging Service                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  INFRASTRUCTURE (Cloud / On-Premise)                            │
│  Docker │ Kubernetes │ GPU Servers │ Load Balancer │ CI/CD      │
│  PostgreSQL │ Redis │ Object Storage │ Monitoring               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  EXTERNAL AI / MODELS                                           │
│  Whisper (ASR) │ NLLB/Whisper (Translation) │ Ollama (LLM)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Speech-to-Text | OpenAI Whisper (local) |
| Translation | NLLB / Whisper multilingual |
| Clinical Notes | Ollama — LLaMA 3 / Mistral (local) |
| Database | PostgreSQL + Redis |
| Auth | JWT / OAuth2 + RBAC |
| Infrastructure | Docker + Kubernetes |
| Compliance | HIPAA / GDPR / ISO 27001 / HL7 FHIR |

---

## Roadmap

| Phase | Scope | Timeline |
|---|---|---|
| 1 — Foundation | Audio recording, Whisper STT, transcript display | Weeks 1–2 |
| 2 — Translation | Auto language detection, NLLB translation to English | Week 3 |
| 3 — AI Notes | Ollama LLM clinical note generation | Week 4 |
| 4 — Frontend UI | Full dashboard, copy/export, UX polish | Month 2 |
| 5 — Real-Time | Streaming ASR, speaker diarization, latency optimization | Month 3 |
| 6 — Deployment | Cloud/on-premise deploy, cross-device, global CDN | TBD |
| 7 — Advanced | Offline mode, Android app, EMR integration, compliance | TBD |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.ai) (Phase 3+)
- ffmpeg (required by Whisper)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in your values
uvicorn app.main:app --reload
# → http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Health Check
```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

---

## Key Benefits

- Real-time transcription & translation
- AI-powered structured clinical notes
- Works offline & online
- Secure, private & compliant (patient data never leaves local network)
- Integrates with hospital systems (EMR)
- Accessible on all devices

---

## Security & Compliance

- End-to-end encryption (transit & at rest)
- HIPAA / GDPR compliant design
- Role-Based Access Control (RBAC)
- Audit logs (no patient content logged)
- Data anonymization support
- Consent management

---

## Integrations (Phase 7)

- EMR / HIS: OpenMRS, Bahmni, TrakCare, Epic
- Laboratory Systems
- Pharmacy Systems
- Appointment Systems
- Identity Providers (SSO / OAuth2)

---

## Docs

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)

---

*AfyaVox AI v1.0 — Designed for Scalability, Security & Real-World Hospital Use*
*© Ellines Tech — Elijah Mwangi*
