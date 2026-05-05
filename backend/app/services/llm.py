"""
LLM service — Ollama (local LLaMA 3 / Mistral).
Phase 3 implementation. Patient data never leaves the local network.
"""
from dataclasses import dataclass


@dataclass
class ClinicalNote:
    symptoms: str
    diagnosis: str
    plan: str
    raw_transcript: str


async def generate_notes(transcript: str, language: str = "en") -> ClinicalNote:
    """
    Generate structured clinical notes from a transcript using a local LLM.
    Phase 3: integrate Ollama here.
    """
    # Phase 3 hook: call Ollama API at settings.ollama_base_url
    raise NotImplementedError("Clinical note generation available in Phase 3 (Ollama)")
