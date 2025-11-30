from datetime import datetime
from typing import Dict, Any, Optional
import re


def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat() if dt else None


def parse_datetime(dt_str: str) -> Optional[datetime]:
    """Parse ISO datetime string"""
    try:
        return datetime.fromisoformat(dt_str)
    except (ValueError, TypeError):
        return None


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to remove special characters"""
    # Remove special characters, keep only alphanumeric, dots, hyphens, underscores
    filename = re.sub(r'[^\w\s\-\.]', '', filename)
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    return filename


def calculate_percentage(score: float, max_score: float = 10.0) -> float:
    """Calculate percentage from score"""
    if max_score == 0:
        return 0.0
    return round((score / max_score) * 100, 2)


def get_grade_from_score(score: float) -> str:
    """Get letter grade from numerical score (0-10)"""
    if score >= 9.0:
        return "A+"
    elif score >= 8.0:
        return "A"
    elif score >= 7.0:
        return "B+"
    elif score >= 6.0:
        return "B"
    elif score >= 5.0:
        return "C"
    else:
        return "D"


def format_duration(seconds: int) -> str:
    """Format duration in seconds to human readable string"""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    if hours > 0:
        return f"{hours}h {minutes}m {secs}s"
    elif minutes > 0:
        return f"{minutes}m {secs}s"
    else:
        return f"{secs}s"


def extract_keywords(text: str) -> list[str]:
    """Extract potential keywords from text"""
    # Remove common words and split
    common_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that'
    }
    
    # Convert to lowercase and split
    words = text.lower().split()
    
    # Filter out common words and keep meaningful ones
    keywords = [word.strip('.,!?;:') for word in words 
                if word.lower() not in common_words and len(word) > 3]
    
    return list(set(keywords))  # Remove duplicates


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to maximum length with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safely divide two numbers, return default if denominator is zero"""
    try:
        return numerator / denominator if denominator != 0 else default
    except (TypeError, ZeroDivisionError):
        return default


def mask_email(email: str) -> str:
    """Mask email for privacy (e.g., j***@example.com)"""
    try:
        username, domain = email.split('@')
        if len(username) <= 2:
            masked_username = username[0] + '*'
        else:
            masked_username = username[0] + '*' * (len(username) - 2) + username[-1]
        return f"{masked_username}@{domain}"
    except:
        return email