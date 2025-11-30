import re
from typing import Optional


def validate_email(email: str) -> bool:
    """Validate email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Remove spaces, dashes, and parentheses
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    # Check if it contains only digits and is between 10-15 characters
    return bool(re.match(r'^\+?[\d]{10,15}$', cleaned))


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength
    Returns: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    # Optional: Check for special characters
    # if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
    #     return False, "Password must contain at least one special character"
    
    return True, None


def validate_file_extension(filename: str, allowed_extensions: list[str]) -> bool:
    """Validate file extension"""
    if not filename or '.' not in filename:
        return False
    
    extension = filename.rsplit('.', 1)[1].lower()
    return extension in allowed_extensions


def validate_url(url: str) -> bool:
    """Validate URL format"""
    url_pattern = r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
    return bool(re.match(url_pattern, url))


def validate_job_role(job_role: str) -> bool:
    """Validate job role format"""
    # Job role should be 2-100 characters
    if not job_role or len(job_role) < 2 or len(job_role) > 100:
        return False
    
    # Should contain only letters, spaces, and basic punctuation
    return bool(re.match(r'^[a-zA-Z\s\-\/\(\)]+$', job_role))


def validate_skills_list(skills: list[str]) -> bool:
    """Validate skills list"""
    if not skills or len(skills) == 0:
        return False
    
    # Each skill should be 2-50 characters
    for skill in skills:
        if not skill or len(skill) < 2 or len(skill) > 50:
            return False
    
    return True


def validate_experience_years(years: int) -> bool:
    """Validate experience years"""
    return 0 <= years <= 50


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input"""
    # Remove potentially harmful characters
    text = re.sub(r'[<>]', '', text)
    # Limit length
    text = text[:max_length]
    # Strip whitespace
    text = text.strip()
    return text