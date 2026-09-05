"""
voice_analyzer.py
─────────────────
Processes transcribed speech text from the Voice Interview feature.

Adds speech-specific heuristics on top of the standard NLP pipeline:
  • Filler-word density (um, uh, like, you know …)
  • Speech clarity score
  • Pace estimation from word count

The final scores are merged with the standard score_generator output.
"""

import re
from app.ai.score_generator import generate_scores
import json

FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "literally",
    "actually", "kind of", "sort of", "i mean", "right",
]

CLARITY_POSITIVE = [
    "therefore", "consequently", "specifically", "furthermore",
    "in conclusion", "to summarize", "for example", "such as",
    "in other words", "as a result",
]


def analyze_voice_answer(transcript: str) -> str:
    """
    Runs full NLP analysis + speech-specific metrics on a voice transcript.
    Returns a JSON string with all scores and speech feedback.
    """
    # 1. Run standard NLP pipeline
    base_report = json.loads(generate_scores(transcript))

    words = re.findall(r"\b\w+\b", transcript.lower())
    total_words = len(words)

    # 2. Filler-word analysis
    filler_count = sum(
        len(re.findall(rf"\b{re.escape(fw)}\b", transcript.lower()))
        for fw in FILLER_WORDS
    )
    filler_ratio = filler_count / max(total_words, 1)
    filler_penalty = min(30, filler_ratio * 200)          # max 30-point penalty

    # 3. Clarity bonus (structured connectors)
    clarity_bonus = sum(
        5 for cw in CLARITY_POSITIVE if cw in transcript.lower()
    )
    clarity_bonus = min(clarity_bonus, 20)                # cap at 20

    # 4. Pace score (ideal: 120-160 words per minute; we estimate from length)
    # Assume average voice answer ~ 60-90 seconds
    pace_score = 100.0
    if total_words < 30:
        pace_score = 50.0    # too short / too slow
    elif total_words > 250:
        pace_score = 60.0    # possibly rushed

    # 5. Adjusted confidence score
    adjusted_confidence = max(
        0.0,
        min(100.0, base_report["scores"]["confidence_score"] - filler_penalty + clarity_bonus)
    )

    # 6. Re-compute overall with speech weights
    # Grammar 35% | Vocabulary 25% | Confidence 25% | Pace 15%
    overall = (
        base_report["scores"]["grammar_score"]    * 0.35
        + base_report["scores"]["vocabulary_score"] * 0.25
        + adjusted_confidence                       * 0.25
        + pace_score                                * 0.15
    )

    report = {
        "scores": {
            "grammar_score":     round(base_report["scores"]["grammar_score"], 2),
            "vocabulary_score":  round(base_report["scores"]["vocabulary_score"], 2),
            "confidence_score":  round(adjusted_confidence, 2),
            "pace_score":        round(pace_score, 2),
            "overall_score":     round(overall, 2),
        },
        "speech_feedback": {
            "filler_count":      filler_count,
            "filler_ratio_pct":  round(filler_ratio * 100, 1),
            "clarity_bonus":     clarity_bonus,
            "word_count":        total_words,
            "pace_assessment":   (
                "Good pace" if 30 <= total_words <= 250
                else ("Too brief — try to elaborate more" if total_words < 30
                      else "May be too fast — slow down a little")
            ),
            "fillers_detected":  [
                fw for fw in FILLER_WORDS
                if re.search(rf"\b{re.escape(fw)}\b", transcript.lower())
            ],
        },
        "feedback": base_report["feedback"],
    }

    return json.dumps(report, indent=4)
