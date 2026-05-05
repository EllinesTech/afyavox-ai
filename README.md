# Afyavox AI

Voice-first AI clinical documentation assistant for healthcare workers.

## Stack

- **Backend**: FastAPI + Whisper + OpenAI GPT-4
- **Frontend**: React + Vite

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # add your API keys
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Docs

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
