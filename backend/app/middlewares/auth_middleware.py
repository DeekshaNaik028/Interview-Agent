from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import decode_access_token
from typing import Callable


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle authentication for protected routes
    """
    
    # Routes that don't require authentication
    PUBLIC_ROUTES = [
        "/",
        "/health",
        "/api/v1/auth/register/candidate",
        "/api/v1/auth/login/candidate",
        "/api/v1/auth/login/company",
        "/docs",
        "/redoc",
        "/openapi.json"
    ]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Check if route is public
        if request.url.path in self.PUBLIC_ROUTES:
            return await call_next(request)
        
        # Check for Authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            # Allow request to proceed - will be caught by dependencies
            return await call_next(request)
        
        # Validate token format
        if not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
        
        # Continue to next middleware/route
        return await call_next(request)