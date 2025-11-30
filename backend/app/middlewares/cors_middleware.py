from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app):
    """
    Setup CORS middleware for the FastAPI application
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With"
        ],
        expose_headers=["Content-Length", "Content-Range"],
        max_age=3600,  # Cache preflight requests for 1 hour
    )
    
    return app