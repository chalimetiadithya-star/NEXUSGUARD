import time
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.document import Document
from app.models.enums import QueryStatus
from app.models.conversation import Conversation, Message
from app.schemas.research import ResearchQueryResponse
from app.services.retriever_service import RetrieverService
from app.services.policy_engine import PolicyEngine
from app.services.version_resolver import VersionResolver
from app.services.secure_context_builder import SecureContextBuilder
from app.services.llm_provider import LLMProvider
from app.services.citation_validator import CitationValidator
from app.services.audit_service import AuditService

class ResearchOrchestrator:
    """
    Coordinates the Permission-Aware Secure Research workflow.
    CORE INVARIANT: Authorization occurs before evidence reaches the LLM context.
    Relevant does not mean authorized.
    """

    @classmethod
    def execute(
        cls,
        db: Session,
        question: str,
        authenticated_user: User,
        conversation_id: Optional[int] = None
    ) -> ResearchQueryResponse:
        start_time = time.time()
        request_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"

        # 1. Retrieve candidate documents (relevance only, no authorization yet)
        candidates = RetrieverService.search(db, question)
        candidate_ids = [c.document_id for c in candidates]

        # 2. DETERMINISTIC AUTHORIZATION GATE (PolicyEngine)
        decisions = PolicyEngine.evaluate(candidates, authenticated_user)

        authorized_docs = []
        for doc, decision in zip(candidates, decisions):
            if decision.allowed:
                authorized_docs.append(doc)

        authorized_ids = [d.document_id for d in authorized_docs]
        authorized_ids_set = set(authorized_ids)

        # 3. Stop immediately if zero authorized candidates exist
        if not authorized_docs:
            duration_ms = int((time.time() - start_time) * 1000)
            AuditService.record_query(
                db=db,
                request_id=request_id,
                user=authenticated_user,
                question=question,
                candidate_ids=candidate_ids,
                decisions=decisions,
                authorized_ids=[],
                selected_ids=[],
                llm_evidence_ids=[],
                status=QueryStatus.NO_AUTHORIZED_EVIDENCE.value,
                duration_ms=duration_ms
            )

            cls._record_chat(
                db=db,
                conversation_id=conversation_id,
                user=authenticated_user,
                question=question,
                answer="I couldn't find sufficient accessible evidence to answer this question using the information available to your account.",
                request_id=request_id,
                citations=[],
                status=QueryStatus.NO_AUTHORIZED_EVIDENCE.value
            )

            return ResearchQueryResponse(
                request_id=request_id,
                status=QueryStatus.NO_AUTHORIZED_EVIDENCE.value,
                answer="I couldn't find sufficient accessible evidence to answer this question using the information available to your account.",
                citations=[],
                conversation_id=conversation_id,
                duration_ms=duration_ms
            )

        # 4. Version & Conflict Resolution (Post-Authorization Only!)
        resolved = VersionResolver.resolve(authorized_docs, question)

        if resolved.has_conflict:
            duration_ms = int((time.time() - start_time) * 1000)
            selected_ids = [d.document_id for d in resolved.conflict_documents]
            
            # Citations for conflicting sources
            citations_map = {d.document_id: d for d in resolved.conflict_documents}
            citations = CitationValidator.validate(selected_ids, citations_map)

            AuditService.record_query(
                db=db,
                request_id=request_id,
                user=authenticated_user,
                question=question,
                candidate_ids=candidate_ids,
                decisions=decisions,
                authorized_ids=authorized_ids,
                selected_ids=selected_ids,
                llm_evidence_ids=[],
                status=QueryStatus.CONFLICT.value,
                duration_ms=duration_ms
            )

            cls._record_chat(
                db=db,
                conversation_id=conversation_id,
                user=authenticated_user,
                question=question,
                answer="Accessible company sources conflict on this question. Both authorized sources provide differing statements.",
                request_id=request_id,
                citations=[c.model_dump() for c in citations],
                status=QueryStatus.CONFLICT.value
            )

            return ResearchQueryResponse(
                request_id=request_id,
                status=QueryStatus.CONFLICT.value,
                answer="Accessible company sources conflict on this question. Multiple authorized documents provide differing statements on this topic.",
                citations=citations,
                conversation_id=conversation_id,
                duration_ms=duration_ms
            )

        # 5. Build Secure Context strictly with authorized evidence
        selected_docs = resolved.selected_documents
        selected_ids = [d.document_id for d in selected_docs]

        secure_context = SecureContextBuilder.build(
            question=question,
            authorized_documents=selected_docs,
            allowed_document_ids=authorized_ids_set
        )

        llm_evidence_ids = list(secure_context.source_ids)

        # Hard assertion verification
        assert set(llm_evidence_ids) <= authorized_ids_set, "Security Invariant Violated: LLM evidence not subset of authorized IDs!"

        # 6. LLM Grounded Synthesis
        llm_output = LLMProvider.generate(secure_context)

        # 7. Citation Validation: validate raw model citations against authorized map
        authorized_docs_map = {d.document_id: d for d in selected_docs}
        validated_citations = CitationValidator.validate(
            raw_citations=llm_output.raw_citations,
            authorized_documents_map=authorized_docs_map
        )

        # If model gave no citations or hallucinated, default to selected evidence
        if not validated_citations and selected_docs:
            validated_citations = CitationValidator.validate(
                raw_citations=selected_ids,
                authorized_documents_map=authorized_docs_map
            )

        duration_ms = int((time.time() - start_time) * 1000)

        # 8. Store complete audit trail
        AuditService.record_query(
            db=db,
            request_id=request_id,
            user=authenticated_user,
            question=question,
            candidate_ids=candidate_ids,
            decisions=decisions,
            authorized_ids=authorized_ids,
            selected_ids=selected_ids,
            llm_evidence_ids=llm_evidence_ids,
            status=QueryStatus.SUCCESS.value,
            duration_ms=duration_ms
        )

        # 9. Store conversation messages
        cls._record_chat(
            db=db,
            conversation_id=conversation_id,
            user=authenticated_user,
            question=question,
            answer=llm_output.answer,
            request_id=request_id,
            citations=[c.model_dump() for c in validated_citations],
            status=QueryStatus.SUCCESS.value
        )

        return ResearchQueryResponse(
            request_id=request_id,
            status=QueryStatus.SUCCESS.value,
            answer=llm_output.answer,
            citations=validated_citations,
            conversation_id=conversation_id,
            duration_ms=duration_ms
        )

    @classmethod
    def _record_chat(
        cls,
        db: Session,
        conversation_id: Optional[int],
        user: User,
        question: str,
        answer: str,
        request_id: str,
        citations: list,
        status: str
    ):
        import json
        if not conversation_id:
            conv = Conversation(user_id=user.employee_id, title=question[:40])
            db.add(conv)
            db.commit()
            db.refresh(conv)
            conversation_id = conv.id

        user_msg = Message(
            conversation_id=conversation_id,
            role="user",
            content=question,
            request_id=request_id
        )
        assistant_msg = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
            request_id=request_id,
            citations_json=json.dumps(citations),
            status=status
        )
        db.add(user_msg)
        db.add(assistant_msg)
        db.commit()
