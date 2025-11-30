from app.core.firebase import firebase_conn
import base64
from typing import Optional
from datetime import timedelta
import uuid


class StorageService:
    def __init__(self):
        self.bucket = firebase_conn.bucket
    
    async def upload_file(
        self, 
        file_data: bytes, 
        filename: str,
        content_type: str,
        folder: str = "interviews"
    ) -> str:
        """Upload file to Firebase Storage"""
        
        # Generate unique filename
        unique_filename = f"{folder}/{uuid.uuid4()}_{filename}"
        
        # Create blob
        blob = self.bucket.blob(unique_filename)
        
        # Upload file
        blob.upload_from_string(
            file_data,
            content_type=content_type
        )
        
        # Make blob publicly readable
        blob.make_public()
        
        return blob.public_url
    
    async def upload_base64_audio(
        self,
        base64_audio: str,
        interview_id: str,
        question_id: str
    ) -> str:
        """Upload base64 encoded audio"""
        
        # Decode base64
        audio_data = base64.b64decode(base64_audio)
        
        # Generate filename
        filename = f"audio_{interview_id}_{question_id}.webm"
        
        # Upload
        return await self.upload_file(
            audio_data,
            filename,
            "audio/webm",
            folder=f"interviews/{interview_id}/audio"
        )
    
    async def upload_video_chunk(
        self,
        video_data: bytes,
        interview_id: str,
        chunk_index: int
    ) -> str:
        """Upload video chunk"""
        
        filename = f"video_chunk_{chunk_index}.webm"
        
        return await self.upload_file(
            video_data,
            filename,
            "video/webm",
            folder=f"interviews/{interview_id}/video"
        )
    
    async def get_signed_url(
        self,
        blob_name: str,
        expiration: int = 3600
    ) -> str:
        """Generate signed URL for private files"""
        
        blob = self.bucket.blob(blob_name)
        url = blob.generate_signed_url(
            expiration=timedelta(seconds=expiration),
            method='GET'
        )
        return url
    
    async def delete_file(self, blob_name: str) -> bool:
        """Delete file from storage"""
        blob = self.bucket.blob(blob_name)
        blob.delete()
        return True


# Global instance
storage_service = StorageService()