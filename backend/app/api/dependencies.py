from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.services.firebase_service import firebase_service
from app.utils.constants import UserRole, COLLECTIONS
from typing import Dict, Optional


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """Get current authenticated user"""
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    user_role: str = payload.get("role")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # Get user from database based on role
    if user_role == UserRole.CANDIDATE:
        user = await firebase_service.get_document(COLLECTIONS["CANDIDATES"], user_id)
    elif user_role == UserRole.COMPANY:
        user = await firebase_service.get_document(COLLECTIONS["COMPANIES"], user_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user role"
        )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


async def get_current_candidate(
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """Ensure current user is a candidate"""
    
    # Check if user is from candidates collection
    candidate = await firebase_service.get_document(
        COLLECTIONS["CANDIDATES"], 
        current_user["id"]
    )
    
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Candidates only"
        )
    
    return candidate


async def get_current_company(
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """Ensure current user is a company"""
    
    company = await firebase_service.get_document(
        COLLECTIONS["COMPANIES"],
        current_user["id"]
    )
    
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Companies only"
        )
    
    return company