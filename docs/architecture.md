# AfyaVox AI — Architecture v1.0

> Designed for Scalability, Security & Real-World Hospital Use

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. USERS & CLIENTS                                                 │
│  Doctor (Web App) │ Mobile App (Android) │ Tablet/Desktop │ Offline │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS / TLS 1.3 / Secure WebSockets
┌──────────────────────────────▼──────────────────────────────────────┐
│  2. APPLICATION LAYER (AfyaVox AI Core)                             │
│                                                                     │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │ AUDIO       │  │ SPEECH           │  │ SPEECH               │   │
│  │ CAPTURE     │→ │ PROCESSING       │→ │ RECOGNITION          │   │
│  │             │  │                  │  │                      │   │
│  │ Web Mic     │  │ Voice Activity   │  │ Whisper (Local/API)  │   │
│  │ Mobile Rec  │  │ Noise Reduction  │  │ Timestamps           │   │
│  │ Streaming   │  │ Speaker Diariz.  │  │                      │   │
│  └─────────────┘  └──────────────────┘  └──────────┬───────────┘   │
│                                                    │               │
│  ┌─────────────────────────┐  ┌────────────────────▼───────────┐   │
│  │ OUTPUT & ACTIONS        │  │ LANGUAGE DETECTION &           │   │
│  │                         │  │ TRANSLATION                    │   │
│  │ Structured Notes (SOAP) │  │                                │   │
│  │ Copy/Export (PDF, DOCX) │  │ Language Detection             │   │
│  │ Share / Send            │  │ NLLB / Whisper Translation     │   │
│  │ EMR Save                │  │ Convert to English             │   │
│  └─────────────────────────┘  └────────────────────┬───────────┘   │
│                                                    │               │
│                              ┌─────────────────────▼───────────┐   │
│                              │ AI CLINICAL NOTES GENERATION    │   │
│                              │                                 │   │
│                              │ LLM: Ollama (LLaMA 3 / Mistral) │   │
│                              │ Clinical Prompting              │   │
│                              │ Structured Output               │   │
│                              └─────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│  3. PLATFORM & SERVICES LAYER                                       │
│                                                                     │
│  API Gateway        │ Auth Service (JWT/OAuth2, RBAC)               │
│  User Service       │ File/Media Service (Audio Storage)            │
│  Notification Svc   │ Audit & Logging Service                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│  4. INFRASTRUCTURE LAYER (Cloud / On-Premise)                       │
│                                                                     │
│  Docker Containers │ Kubernetes │ GPU Servers (ASR + LLM)           │
│  Load Balancer │ Auto Scaling │ CI/CD (GitHub Actions)              │
│  Monitoring (Prometheus + Grafana)                                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│  5. EXTERNAL AI / MODELS LAYER                                      │
│                                                                     │
│  Whisper (ASR) │ NLLB/Whisper (Translation) │ Ollama (Local LLM)   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Browser records audio (WebM/Opus)
    │
    ▼ POST /api/transcribe (multipart)
FastAPI validates file size (≤ 100 MB)
    │
    ▼ WhisperService.transcribe()
Save to tempfile → Whisper model → Delete tempfile
    │
    ▼ Phase 2 hook: Translation (NLLB)
If language ≠ "en" → translate to English
    │
    ▼ Phase 3 hook: Note Generation (Ollama)
POST /api/notes → LLM prompt → Structured clinical note
    │
    ▼ Response to browser
{ transcript, language, status }
{ symptoms, diagnosis, plan }
```

## Data & Storage (Phase 3+)

- PostgreSQL — primary database (users, sessions, notes)
- Redis — cache & sessions
- Object Storage — audio files, documents, exports
- Backup & Disaster Recovery
- Data Retention Policies

## Security & Compliance

- End-to-End Encryption (Transit & At Rest)
- HIPAA / GDPR Compliance
- Role-Based Access Control (RBAC)
- Audit Logs (no patient content logged)
- Data Anonymization
- Consent Management
- Secure API Gateway
- Regular Security Audits

Standards: HIPAA │ GDPR │ ISO 27001 │ HL7 FHIR │ OWASP Top 10

## Network & Access

- HTTPS / TLS 1.3
- Secure WebSockets (Streaming)
- VPN Support (Hospitals)
- Offline Sync (Mobile)
- Global CDN (Web App)

## Integrations (Phase 7)

- EMR / HIS: OpenMRS, Bahmni, TrakCare, Epic
- Laboratory Systems
- Pharmacy Systems
- Appointment Systems
- Identity Providers (SSO / OAuth2)
