"""
Translation service — NLLB-200 (No Language Left Behind).

Supports 200+ languages including:
- African: Swahili, Kikuyu, Luo, Kisii, Zulu, Amharic, Yoruba, Hausa, Igbo...
- Asian: Chinese (Simplified/Traditional), Korean, Japanese, Hindi, Arabic...
- European: French, Spanish, Portuguese, German, Italian, Russian...
- And 180+ more

Phase 2 implementation.
All translation runs locally — patient data never leaves the network.

Two translation modes:
  1. Input translation:  ANY language → English  (for AI processing)
  2. Output translation: English → doctor's chosen language  (for note delivery)
"""
from typing import Optional


# NLLB language code mapping (BCP-47 → NLLB flores200 codes)
# Whisper returns BCP-47 codes; NLLB uses flores200 codes
LANGUAGE_MAP = {
    # African languages
    "sw": "swh_Latn",    # Swahili
    "ki": "kik_Latn",    # Kikuyu
    "luo": "luo_Latn",   # Luo (Dholuo)
    "guz": "guz_Latn",   # Kisii (Gusii)
    "zu": "zul_Latn",    # Zulu
    "am": "amh_Ethi",    # Amharic
    "yo": "yor_Latn",    # Yoruba
    "ha": "hau_Latn",    # Hausa
    "ig": "ibo_Latn",    # Igbo
    "so": "som_Latn",    # Somali
    # Asian languages
    "zh": "zho_Hans",    # Chinese Simplified
    "zh-TW": "zho_Hant", # Chinese Traditional
    "ko": "kor_Hang",    # Korean
    "ja": "jpn_Jpan",    # Japanese
    "hi": "hin_Deva",    # Hindi
    "ar": "arb_Arab",    # Arabic
    "ur": "urd_Arab",    # Urdu
    "bn": "ben_Beng",    # Bengali
    # European languages
    "fr": "fra_Latn",    # French
    "es": "spa_Latn",    # Spanish
    "pt": "por_Latn",    # Portuguese
    "de": "deu_Latn",    # German
    "it": "ita_Latn",    # Italian
    "ru": "rus_Cyrl",    # Russian
    "nl": "nld_Latn",    # Dutch
    # English (no translation needed)
    "en": "eng_Latn",    # English
}


def get_nllb_code(bcp47_code: str) -> Optional[str]:
    """Convert a BCP-47 language code to NLLB flores200 code."""
    return LANGUAGE_MAP.get(bcp47_code)


async def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text from ANY language to English.
    Used internally before passing transcript to the LLM.

    Phase 2: integrate facebook/nllb-200-distilled-600M here.
    """
    if source_lang == "en":
        return text  # already English, skip translation

    # Phase 2 hook: load NLLB pipeline and translate
    # from transformers import pipeline
    # translator = pipeline("translation", model="facebook/nllb-200-distilled-600M")
    # src_code = get_nllb_code(source_lang) or source_lang
    # result = translator(text, src_lang=src_code, tgt_lang="eng_Latn")
    # return result[0]["translation_text"]

    raise NotImplementedError(
        f"Translation from '{source_lang}' to English available in Phase 2 (NLLB-200). "
        f"Supports 200+ languages including Kikuyu, Luo, Kisii, Arabic, Chinese, Korean, and more."
    )


async def translate_notes(notes: str, target_lang: str) -> str:
    """
    Translate clinical notes from English to the doctor's chosen output language.
    The doctor can choose: Chinese, Korean, Swahili, Arabic, French, or any of 200+ languages.

    Phase 2/3: integrate NLLB or Ollama multilingual output here.
    """
    if target_lang == "en":
        return notes  # already English, no translation needed

    # Phase 3 hook: translate notes to doctor's chosen language
    # tgt_code = get_nllb_code(target_lang) or target_lang
    # result = translator(notes, src_lang="eng_Latn", tgt_lang=tgt_code)
    # return result[0]["translation_text"]

    raise NotImplementedError(
        f"Output translation to '{target_lang}' available in Phase 3. "
        f"Doctor can choose any of 200+ output languages."
    )
