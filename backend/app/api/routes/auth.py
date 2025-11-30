from fastapi import APIRouter, HTTPException, status
from app.schemas.candidate import CandidateRegister, CandidateLogin, CandidateResponse
from app.services.firebase_service import firebase_service
from app.core.security import get_password_hash, verify_password, create_access_token
from app.utils.constants import COLLECTIONS, UserRole
from datetime import datetime


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/candidate", response_model=CandidateResponse)
async def register_candidate(candidate_data: CandidateRegister):
    """Register a new candidate"""
    
    # Check if email already exists
    existing_candidate = await firebase_service.get_candidate_by_email(
        candidate_data.email
    )
    
    if existing_candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(candidate_data.password)
    
    # Prepare candidate data
    candidate_dict = {
        "email": candidate_data.email,
        "password": hashed_password,
        "full_name": candidate_data.full_name,
        "phone": candidate_data.phone,
        "job_role": candidate_data.job_role,
        "resume_data": candidate_data.resume_data.dict(),
        "created_at": datetime.utcnow()
    }
    
    # Save to Firebase
    candidate_id = await firebase_service.create_document(
        COLLECTIONS["CANDIDATES"],
        candidate_dict
    )
    
    # Get created candidate
    candidate = await firebase_service.get_document(
        COLLECTIONS["CANDIDATES"],
        candidate_id
    )
    
    return candidate


@router.post("/login/candidate")
async def login_candidate(login_data: CandidateLogin):
    """Candidate login"""
    
    # Get candidate by email
    candidate = await firebase_service.get_candidate_by_email(login_data.email)
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, candidate["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": candidate["id"],
            "email": candidate["email"],
            "role": UserRole.CANDIDATE
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": candidate["id"],
            "email": candidate["email"],
            "full_name": candidate["full_name"],
            "role": UserRole.CANDIDATE
        }
    }


@router.post("/login/company")
async def login_company(login_data: CandidateLogin):
    """Company login"""
    
    # Get company by email
    companies = await firebase_service.query_documents(
        COLLECTIONS["COMPANIES"],
        filters=[("email", "==", login_data.email)],
        limit=1
    )
    
    if not companies:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    company = companies[0]
    
    # Verify password
    if not verify_password(login_data.password, company["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": company["id"],
            "email": company["email"],
            "role": UserRole.COMPANY
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": company["id"],
            "email": company["email"],
            "company_name": company["company_name"],
            "role": UserRole.COMPANY
        }
    }