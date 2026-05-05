# Afyavox AI — API Reference

## POST /api/transcribe

Transcribes an audio file.

**Request**: `multipart/form-data`
- `audio` (file): Audio recording (webm/wav/mp3)
- `language` (string, optional): Language code, default `sw`

**Response**:
```json
{ "transcript": "..." }
```

---

## POST /api/notes

Generates clinical notes from a transcript.

**Request**: `application/json`
```json
{ "transcript": "...", "language": "sw" }
```

**Response**:
```json
{
  "chief_complaint": "...",
  "history": "...",
  "examination": "...",
  "plan": "..."
}
```
