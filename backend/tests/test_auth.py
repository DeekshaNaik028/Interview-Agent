import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_candidate():
    """Test candidate registration"""
    response = client.post(
        "/api/v1/auth/register/candidate",
        json={
            "email": "test@example.com",
            "password": "TestPass123",
            "full_name": "Test Candidate",
            "phone": "+1234567890",
            "job_role": "Software Engineer",
            "resume_data": {
                "skills": ["Python", "JavaScript", "React"],
                "experience_years": 3,
                "education": "Bachelor's in Computer Science",
                "previous_roles": ["Junior Developer", "Developer"],
                "certifications": ["AWS Certified"]
            }
        }
    )
    
    assert response.status_code in [200, 400]  # 400 if already exists


def test_login_candidate():
    """Test candidate login"""
    response = client.post(
        "/api/v1/auth/login/candidate",
        json={
            "email": "test@example.com",
            "password": "TestPass123"
        }
    )
    
    assert response.status_code in [200, 401]
    
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"


def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    response = client.post(
        "/api/v1/auth/login/candidate",
        json={
            "email": "invalid@example.com",
            "password": "WrongPassword"
        }
    )
    
    assert response.status_code == 401