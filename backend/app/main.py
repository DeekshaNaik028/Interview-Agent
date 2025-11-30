from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import routers directly instead of from __init__.py
from app.api.routes import auth
from app.api.routes import interview
from app.api.routes import company
from app.api.routes import candidate
from app.api.routes import evaluation
from app.api.routes import question


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    debug=settings.DEBUG,
    description="AI-powered interview platform with voice-based assessment"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(candidate.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(interview.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(question.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(evaluation.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(company.router, prefix=f"/api/{settings.API_VERSION}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Interview Agent System API",
        "version": settings.API_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )