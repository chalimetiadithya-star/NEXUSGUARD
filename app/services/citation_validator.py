from typing import List, Set, Dict, Any
from app.schemas.document import CitationResponse
from app.models.document import Document

class CitationValidator:
    """
    Deterministically validates model-provided citations against authorized evidence.
    CRITICAL: Citations must STRICTLY be a subset of the authorized evidence IDs.
    Any hallucinated or unauthorized citation is rejected immediately.
    """

    @staticmethod
    def validate(
        raw_citations: List[str],
        authorized_documents_map: Dict[str, Document]
    ) -> List[CitationResponse]:
        valid_citations: List[CitationResponse] = []
        seen_ids = set()

        for raw_id in raw_citations:
            clean_id = raw_id.strip()
            if not clean_id or clean_id in seen_ids:
                continue

            # Deterministic check: must exist in authorized documents
            if clean_id in authorized_documents_map:
                doc = authorized_documents_map[clean_id]
                valid_citations.append(
                    CitationResponse(
                        document_id=doc.document_id,
                        title=doc.title,
                        version=doc.version,
                        effective_date=doc.effective_date,
                        classification=doc.classification,
                        department=doc.department,
                        excerpt=doc.content[:200] + "..." if len(doc.content) > 200 else doc.content
                    )
                )
                seen_ids.add(clean_id)
            else:
                # Log or drop rejected unauthorized/hallucinated citation
                pass

        return valid_citations
