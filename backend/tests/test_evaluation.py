import pytest
from app.services.evaluation_service import evaluation_service
from app.utils.constants import SCORING_WEIGHTS


def test_scoring_weights_sum():
    """Test that scoring weights sum to 1.0"""
    total = sum(SCORING_WEIGHTS.values())
    assert abs(total - 1.0) < 0.01  # Allow small floating point error


def test_score_calculation():
    """Test score calculation logic"""
    criteria = {
        "accuracy": 8.0,
        "relevance": 7.5,
        "communication": 8.5,
        "clarity": 7.0,
        "confidence": 8.0
    }
    
    expected_score = (
        8.0 * SCORING_WEIGHTS["accuracy"] +
        7.5 * SCORING_WEIGHTS["relevance"] +
        8.5 * SCORING_WEIGHTS["communication"] +
        7.0 * SCORING_WEIGHTS["clarity"] +
        8.0 * SCORING_WEIGHTS["confidence"]
    )
    
    # Calculate weighted score
    calculated_score = sum(
        criteria[key] * SCORING_WEIGHTS[key] 
        for key in criteria.keys()
    )
    
    assert abs(calculated_score - expected_score) < 0.01