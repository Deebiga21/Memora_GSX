import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ..models import Person, Event, Meeting, Decision, Evidence
from .pdf_service import get_document_chunks
import google.generativeai as genai

class AIEvidence(BaseModel):
    page_number: int = Field(description="The page number from the text where this was found")
    snippet: str = Field(description="Exact quote or snippet from the text supporting this entity")
    confidence: float = Field(description="Confidence score 0.0 to 1.0", default=0.9)

class ExtractedPerson(BaseModel):
    name: str = Field(description="Full name of the person")
    role: Optional[str] = Field(description="Role or title", default=None)
    department: Optional[str] = Field(description="Department", default=None)
    description: Optional[str] = Field(description="Brief description", default=None)
    evidence: Optional[AIEvidence] = None

class ExtractedEvent(BaseModel):
    title: str = Field(description="Title of the event")
    date: Optional[str] = Field(description="Date in YYYY-MM-DD format", default=None)
    type: Optional[str] = Field(description="Type of event", default=None)
    description: Optional[str] = Field(description="Brief description of the event", default=None)
    evidence: Optional[AIEvidence] = None

class ExtractedMeeting(BaseModel):
    title: str = Field(description="Title of the meeting")
    date: Optional[str] = Field(description="Date in YYYY-MM-DD format", default=None)
    type: Optional[str] = Field(description="Type of meeting", default=None)
    description: Optional[str] = Field(description="Brief description of the meeting", default=None)
    participants: List[str] = Field(description="List of names of people who participated", default_factory=list)
    evidence: Optional[AIEvidence] = None

class ExtractedDecision(BaseModel):
    title: str = Field(description="Title of the decision")
    date: Optional[str] = Field(description="Date in YYYY-MM-DD format", default=None)
    reason: Optional[str] = Field(description="Reason for the decision", default=None)
    action: Optional[str] = Field(description="Action taken due to the decision", default=None)
    impact: Optional[str] = Field(description="Impact of the decision", default=None)
    status: Optional[str] = Field(description="active, implemented, revised, rejected, unknown", default="active")
    evidence: Optional[AIEvidence] = None

class AIRelationship(BaseModel):
    source_entity: str = Field(description="Name/Title of the source entity")
    relationship_type: str = Field(description="E.g., triggered, resulted_in, supported_by, followed_by, participated_in")
    target_entity: str = Field(description="Name/Title of the target entity")
    evidence: Optional[AIEvidence] = None

class AIExtractionResult(BaseModel):
    people: List[ExtractedPerson] = Field(default_factory=list)
    events: List[ExtractedEvent] = Field(default_factory=list)
    meetings: List[ExtractedMeeting] = Field(default_factory=list)
    decisions: List[ExtractedDecision] = Field(default_factory=list)
    relationships: List[AIRelationship] = Field(default_factory=list)

def extract_entities_from_chunk(text: str) -> Optional[AIExtractionResult]:
    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("NVIDIA_API_KEY"))
    if not api_key:
        print("Warning: Missing API KEY.")
        return None
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
You are an institutional memory extraction engine.
Analyze only the supplied institutional document text.
Extract people, events, meetings and decisions.
Do not invent facts.
Do not infer unsupported information as fact.
If information is missing, return null or an empty array.
For every important entity or decision, identify the page number and supporting evidence snippet based on the '--- PAGE X ---' markers in the text.
A decision should include: title, date, reason, action, impact.
Distinguish explicitly stated facts from inferred relationships.
Only create a relationship when the document provides sufficient evidence.
Return valid JSON matching the following schema.

EXPECTED JSON FORMAT:
{{
    "people": [{{ "name": "...", "role": "...", "department": "...", "description": "...", "evidence": {{"page_number": 1, "snippet": "...", "confidence": 0.9}} }}],
    "events": [{{ "title": "...", "date": "...", "type": "...", "description": "...", "evidence": {{...}} }}],
    "meetings": [{{ "title": "...", "date": "...", "type": "...", "description": "...", "participants": ["..."], "evidence": {{...}} }}],
    "decisions": [{{ "title": "...", "date": "...", "reason": "...", "action": "...", "impact": "...", "status": "...", "evidence": {{...}} }}],
    "relationships": [{{ "source_entity": "...", "relationship_type": "...", "target_entity": "...", "evidence": {{...}} }}]
}}

TEXT:
{text}
"""
    
    try:
        response = model.generate_content(prompt)
        content = response.text
        if content:
            # Simple cleanup for markdown code blocks if the model outputs them
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            return AIExtractionResult.model_validate_json(content)
    except Exception as e:
        print(f"Error extracting from chunk: {str(e)}")
    return None

def parse_date(date_str: str):
    from datetime import datetime
    if not date_str:
        return None
    try:
        if len(date_str) >= 10:
            return datetime.strptime(date_str[:10], "%Y-%m-%d")
    except:
        pass
    return None

def get_or_create_person(db: Session, p: ExtractedPerson) -> Person:
    existing = db.query(Person).filter(Person.name.ilike(f"%{p.name}%")).first()
    if existing:
        if p.role and not existing.role: existing.role = p.role
        if p.department and not existing.department: existing.department = p.department
        return existing
    new_p = Person(name=p.name, role=p.role, department=p.department, description=p.description)
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p

def get_or_create_event(db: Session, e: ExtractedEvent) -> Event:
    existing = db.query(Event).filter(Event.title.ilike(f"%{e.title}%")).first()
    if existing: return existing
    dt = parse_date(e.date)
    new_e = Event(title=e.title, event_date=dt, event_type=e.type, description=e.description)
    db.add(new_e)
    db.commit()
    db.refresh(new_e)
    return new_e

def get_or_create_meeting(db: Session, m: ExtractedMeeting) -> Meeting:
    existing = db.query(Meeting).filter(Meeting.title.ilike(f"%{m.title}%")).first()
    if existing: return existing
    dt = parse_date(m.date)
    new_m = Meeting(title=m.title, meeting_date=dt, meeting_type=m.type, description=m.description)
    db.add(new_m)
    db.commit()
    db.refresh(new_m)
    return new_m

def get_or_create_decision(db: Session, d: ExtractedDecision) -> Decision:
    existing = db.query(Decision).filter(Decision.title.ilike(f"%{d.title}%")).first()
    if existing: return existing
    dt = parse_date(d.date)
    new_d = Decision(title=d.title, decision_date=dt, reason=d.reason, action=d.action, impact=d.impact, status=d.status)
    db.add(new_d)
    db.commit()
    db.refresh(new_d)
    return new_d

def run_extraction_pipeline(db: Session, document_id: int):
    chunks = get_document_chunks(db, document_id, chunk_size=5)
    
    stats = {
        "documents": 1,
        "people": 0,
        "events": 0,
        "meetings": 0,
        "decisions": 0,
        "evidence": 0,
        "relationships": 0
    }
    
    extracted_data = [] # To pass to relationship builder
    ai_relationships = []

    for start_page, end_page, text in chunks:
        res = extract_entities_from_chunk(text)
        if not res:
            continue
            
        def add_evidence(entity_type, entity_id, ev: AIEvidence):
            if not ev: return None
            evidence_rec = Evidence(
                document_id=document_id,
                page_number=ev.page_number,
                snippet=ev.snippet,
                entity_type=entity_type,
                entity_id=entity_id,
                confidence=ev.confidence
            )
            db.add(evidence_rec)
            db.commit()
            db.refresh(evidence_rec)
            stats["evidence"] += 1
            return evidence_rec

        for p in res.people:
            person = get_or_create_person(db, p)
            add_evidence("person", person.id, p.evidence)
            stats["people"] += 1
            extracted_data.append(("person", person))
            
        for e in res.events:
            evt = get_or_create_event(db, e)
            add_evidence("event", evt.id, e.evidence)
            stats["events"] += 1
            extracted_data.append(("event", evt))
            
        for m in res.meetings:
            mtg = get_or_create_meeting(db, m)
            ev_rec = add_evidence("meeting", mtg.id, m.evidence)
            stats["meetings"] += 1
            extracted_data.append(("meeting", mtg))
            
            for participant_name in m.participants:
                part = get_or_create_person(db, ExtractedPerson(name=participant_name))
                extracted_data.append(("person", part))
                ai_relationships.append({
                    "source_type": "person", "source_id": part.id,
                    "target_type": "meeting", "target_id": mtg.id,
                    "rel_type": "participated_in", "evidence_id": ev_rec.id if ev_rec else None
                })
            
        for d in res.decisions:
            dec = get_or_create_decision(db, d)
            add_evidence("decision", dec.id, d.evidence)
            stats["decisions"] += 1
            extracted_data.append(("decision", dec))
            
        ai_relationships.extend(res.relationships)
            
    # Build Relationships
    from .relationship_service import build_relationships
    rels = build_relationships(db, document_id, extracted_data, ai_relationships)
    stats["relationships"] += rels
    
    return stats
