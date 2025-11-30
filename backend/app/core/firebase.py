import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.core.config import settings


class FirebaseConnection:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseConnection, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.initialize()
            self._initialized = True
    
    def initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            print("✅ Firebase initialized successfully")
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            raise
    
    @property
    def db(self):
        """Get Firestore database instance"""
        return firestore.client()
    
    @property
    def bucket(self):
        """Get Firebase Storage bucket instance"""
        return storage.bucket()


# Global Firebase instance
firebase_conn = FirebaseConnection()