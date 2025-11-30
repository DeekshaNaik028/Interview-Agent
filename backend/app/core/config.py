from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Interview Agent System"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: str
    FIREBASE_STORAGE_BUCKET: str
    
    # Gemini AI
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # File Upload
    MAX_VIDEO_SIZE_MB: int = 500
    MAX_AUDIO_SIZE_MB: int = 50
    ALLOWED_VIDEO_EXTENSIONS: str = "mp4,webm,avi"
    ALLOWED_AUDIO_EXTENSIONS: str = "mp3,wav,webm"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def allowed_video_extensions_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_VIDEO_EXTENSIONS.split(",")]
    
    @property
    def allowed_audio_extensions_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_AUDIO_EXTENSIONS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()