import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk

class CandidateResult:
    def __init__(self, document: Document, score: float, matched_chunks: List[DocumentChunk]):
        self.document = document
        self.score = score
        self.matched_chunks = matched_chunks

class RetrieverService:
    """
    Retrieves candidate documents and chunks relevant to the employee's question.
    CRITICAL: The retriever DOES NOT make permission decisions.
    It returns all semantically/lexically relevant candidates.
    Authorization happens AFTER retrieval.
    """

    @staticmethod
    def normalize_query(query: str) -> List[str]:
        # Clean text, remove punctuation, extract lowercase tokens
        cleaned = re.sub(r"[^\w\s]", " ", query.lower())
        tokens = [t for t in cleaned.split() if len(t) > 1]
        # Remove very common noise words but keep key business words like q4, revenue, forecast, latest, etc.
        stop_words = {"what", "is", "the", "our", "a", "an", "of", "in", "for", "to", "and", "me", "tell", "show"}
        filtered = [t for t in tokens if t not in stop_words]
        return filtered if filtered else tokens

    @classmethod
    def search(cls, db: Session, query: str, top_k: int = 10) -> List[Document]:
        """
        Searches active documents and chunks matching query terms.
        Returns a ranked list of candidate Document objects.
        """
        terms = cls.normalize_query(query)
        if not terms:
            return []

        all_docs = db.query(Document).filter(Document.status != "ARCHIVED").all()
        scored_docs = []

        query_lower = query.lower()

        for doc in all_docs:
            score = 0.0
            doc_text = f"{doc.title} {doc.lineage_id} {doc.department} {doc.content}".lower()

            # Exact phrase bonus
            if query_lower in doc_text:
                score += 5.0

            # Title match bonus
            for term in terms:
                if term in doc.title.lower():
                    score += 3.0
                if term in doc.lineage_id.lower():
                    score += 2.0
                # Content match frequency
                matches = doc_text.count(term)
                if matches > 0:
                    score += min(matches * 0.5, 3.0)

            # Check chunk matches
            for chunk in doc.chunks:
                chunk_text = chunk.search_text.lower()
                for term in terms:
                    if term in chunk_text:
                        score += 1.0

            if score > 0:
                scored_docs.append((doc, score))

        # Sort descending by score
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        candidates = [doc for doc, score in scored_docs[:top_k]]
        return candidates
