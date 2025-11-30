import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def auth_token():
    """Get authentication token for testing"""
    response = client.post(
        "/api/v1/auth/login/candidate",
        json={
            "email": "test@example.com",
            "password": "TestPass123"
        }
    )
    
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


def test_start_interview_unauthorized():
    """Test starting interview without authentication"""
    response = client.post(
        "/api/v1/interview/start",
        json={"interview_id": "test123"}
    )
    
    assert response.status_code == 403  # Forbidden without auth


def test_submit_answer_unauthorized():
    """Test submitting answer without authentication"""
    response = client.post(
        "/api/v1/interview/submit-answer",
        json={
            "interview_id": "test123",
            "question_id": "q123",
            "audio_data": "base64data",
            "answer_text": "Test answer"
        }
    )
    
    assert response.status_code == 403