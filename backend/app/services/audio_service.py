import speech_recognition as sr
import base64
import tempfile
import os
from typing import Optional


class AudioService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
    
    async def transcribe_audio(self, audio_base64: str) -> Optional[str]:
        """
        Transcribe audio from base64 encoded string to text
        
        Args:
            audio_base64: Base64 encoded audio data
            
        Returns:
            Transcribed text or None if transcription fails
        """
        try:
            # Decode base64 audio
            audio_data = base64.b64decode(audio_base64)
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                temp_audio.write(audio_data)
                temp_audio_path = temp_audio.name
            
            # Transcribe audio
            with sr.AudioFile(temp_audio_path) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio)
            
            # Clean up temp file
            os.unlink(temp_audio_path)
            
            return text
            
        except sr.UnknownValueError:
            print("Speech recognition could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Could not request results from speech recognition service; {e}")
            return None
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return None
    
    async def validate_audio_format(self, audio_base64: str) -> bool:
        """
        Validate audio format and size
        
        Args:
            audio_base64: Base64 encoded audio data
            
        Returns:
            True if valid, False otherwise
        """
        try:
            audio_data = base64.b64decode(audio_base64)
            
            # Check size (max 50MB as per settings)
            max_size = 50 * 1024 * 1024  # 50MB in bytes
            if len(audio_data) > max_size:
                return False
            
            return True
            
        except Exception as e:
            print(f"Error validating audio: {e}")
            return False


# Global instance
audio_service = AudioService()