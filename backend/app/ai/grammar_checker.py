def check_grammar(text: str) -> dict:
    """
    Detect grammar mistakes and provide corrections.
    Currently uses mock rule-based logic. Ready to be integrated with LLMs or libraries like LanguageTool.
    """
    mistakes = []
    text_lower = text.lower()
    
    # Mock error detection
    if "is went" in text_lower:
        mistakes.append({"error": "is went", "correction": "went", "message": "Incorrect verb tense."})
    if "more better" in text_lower:
        mistakes.append({"error": "more better", "correction": "better", "message": "Double comparative."})
        
    score = 100.0 if not mistakes else max(0.0, 100.0 - (len(mistakes) * 15))
    
    return {
        "mistakes": mistakes,
        "grammar_score": score
    }
