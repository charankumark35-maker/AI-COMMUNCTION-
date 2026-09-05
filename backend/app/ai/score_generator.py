import json
from app.ai.grammar_checker import check_grammar
from app.ai.vocabulary_analyzer import analyze_vocabulary
from app.ai.sentiment_analysis import analyze_sentiment

def generate_scores(text: str) -> str:
    """
    Runs all NLP analysis modules on the provided text, computes an overall score,
    and returns a comprehensive JSON response.
    """
    # 1. Run Analysis
    grammar_data = check_grammar(text)
    vocab_data = analyze_vocabulary(text)
    sentiment_data = analyze_sentiment(text)
    
    # 2. Extract Scores
    grammar_score = grammar_data.get("grammar_score", 0.0)
    vocab_score = vocab_data.get("vocabulary_score", 0.0)
    confidence_score = sentiment_data.get("confidence_score", 0.0)
    
    # 3. Calculate Overall Score (Weighted: 40% Grammar, 30% Vocab, 30% Confidence)
    overall_score = (grammar_score * 0.40) + (vocab_score * 0.30) + (confidence_score * 0.30)
    
    # 4. Construct Final Response
    report = {
        "scores": {
            "grammar_score": round(grammar_score, 2),
            "vocabulary_score": round(vocab_score, 2),
            "confidence_score": round(confidence_score, 2),
            "overall_score": round(overall_score, 2)
        },
        "feedback": {
            "grammar_mistakes": grammar_data.get("mistakes", []),
            "vocabulary_suggestions": vocab_data.get("suggestions", []),
            "tone": sentiment_data.get("tone", "neutral")
        }
    }
    
    # Return as JSON string
    return json.dumps(report, indent=4)
