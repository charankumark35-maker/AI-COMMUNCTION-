import re

def analyze_vocabulary(text: str) -> dict:
    """
    Analyze word quality and suggest better vocabulary.
    Currently uses basic heuristic matching. Can be upgraded with NLTK or WordNet.
    """
    suggestions = []
    text_lower = text.lower()
    
    # Basic mock analysis
    if "good" in text_lower:
        suggestions.append({"word": "good", "suggestions": ["excellent", "superb", "outstanding"]})
    if "bad" in text_lower:
        suggestions.append({"word": "bad", "suggestions": ["subpar", "deficient", "inadequate"]})
    if "very big" in text_lower:
        suggestions.append({"word": "very big", "suggestions": ["massive", "enormous", "gigantic"]})
        
    # Simple score based on unique word density
    words = re.findall(r'\b\w+\b', text_lower)
    unique_words = len(set(words))
    total_words = len(words)
    
    if total_words == 0:
        vocab_score = 0.0
    else:
        # Base score + uniqueness bonus
        vocab_score = min(100.0, 50.0 + ((unique_words / total_words) * 50.0))
        
    return {
        "suggestions": suggestions,
        "vocabulary_score": vocab_score
    }
