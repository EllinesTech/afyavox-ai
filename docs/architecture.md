# Afyavox AI — Architecture

## Overview

Afyavox AI is a voice-first clinical documentation assistant for healthcare workers in low-resource settings. It captures spoken consultations, transcribes them (Swahili + English), and generates structured clinical notes.

## Components

```
Browser (React)
    │
    ▼
FastAPI Backend
    ├── Whisper  → Speech-to-text
    ├── LLM      → Clinical note generation
    └── Translator → Multilingual support
```

## Data Flow

1. Clinician records audio in the browser
2. Audio is sent to `/api/transcribe`
3. Whisper transcribes the audio
4. Transcript is sent to `/api/notes`
5. LLM generates structured clinical notes
6. Notes are returned and displayed
