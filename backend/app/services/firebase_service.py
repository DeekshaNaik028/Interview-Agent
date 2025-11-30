from app.core.firebase import firebase_conn
from typing import Dict, List, Optional
from datetime import datetime
from google.cloud.firestore_v1 import FieldFilter


class FirebaseService:
    def __init__(self):
        self.db = firebase_conn.db
    
    # Generic CRUD Operations
    async def create_document(self, collection: str, data: Dict) -> str:
        """Create a new document in a collection"""
        doc_ref = self.db.collection(collection).document()
        data['id'] = doc_ref.id
        data['created_at'] = datetime.utcnow()
        doc_ref.set(data)
        return doc_ref.id
    
    async def get_document(self, collection: str, doc_id: str) -> Optional[Dict]:
        """Get a document by ID"""
        doc_ref = self.db.collection(collection).document(doc_id)
        doc = doc_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        return None
    
    async def update_document(self, collection: str, doc_id: str, data: Dict) -> bool:
        """Update a document"""
        doc_ref = self.db.collection(collection).document(doc_id)
        data['updated_at'] = datetime.utcnow()
        doc_ref.update(data)
        return True
    
    async def delete_document(self, collection: str, doc_id: str) -> bool:
        """Delete a document"""
        doc_ref = self.db.collection(collection).document(doc_id)
        doc_ref.delete()
        return True
    
    async def query_documents(
        self, 
        collection: str, 
        filters: Optional[List[tuple]] = None,
        limit: Optional[int] = None
    ) -> List[Dict]:
        """Query documents with filters"""
        query = self.db.collection(collection)
        
        if filters:
            for field, operator, value in filters:
                query = query.where(filter=FieldFilter(field, operator, value))
        
        if limit:
            query = query.limit(limit)
        
        docs = query.stream()
        return [doc.to_dict() for doc in docs]
    
    # Candidate Operations
    async def get_candidate_by_email(self, email: str) -> Optional[Dict]:
        """Get candidate by email"""
        candidates = await self.query_documents(
            "candidates",
            filters=[("email", "==", email)],
            limit=1
        )
        return candidates[0] if candidates else None
    
    # Interview Operations
    async def get_interview_questions(self, interview_id: str) -> List[Dict]:
        """Get all questions for an interview"""
        return await self.query_documents(
            "questions",
            filters=[("interview_id", "==", interview_id)]
        )
    
    async def save_interview_answer(
        self, 
        interview_id: str, 
        question_id: str, 
        answer_data: Dict
    ) -> str:
        """Save candidate's answer"""
        answer_data.update({
            "interview_id": interview_id,
            "question_id": question_id,
            "timestamp": datetime.utcnow()
        })
        return await self.create_document("answers", answer_data)
    
    # Company Operations
    async def get_company_interviews(self, company_id: str) -> List[Dict]:
        """Get all interviews for a company"""
        return await self.query_documents(
            "interviews",
            filters=[("company_id", "==", company_id)]
        )
    
    async def get_interview_evaluation(self, interview_id: str) -> Optional[Dict]:
        """Get evaluation for an interview"""
        evaluations = await self.query_documents(
            "evaluations",
            filters=[("interview_id", "==", interview_id)],
            limit=1
        )
        return evaluations[0] if evaluations else None


# Global instance
firebase_service = FirebaseService()