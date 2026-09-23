import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ..models import Person, Event, Meeting, Decision, Evidence, Forecast, ForecastEvidence, Project
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

class ExtractedForecast(BaseModel):
    type: str = Field(description="UPCOMING_DEADLINE, PLANNED_MEETING, EXPECTED_ACTION, DEPENDENCY, POTENTIAL_RISK, FOLLOW_UP")
    description: str = Field(description="Description of the predicted or future event/action")
    expected_date: Optional[str] = Field(description="Expected date in YYYY-MM-DD format if known", default=None)
    basis: str = Field(description="The explicit basis or reason stated in the document")
    evidence: Optional[AIEvidence] = None

class ExtractedProject(BaseModel):
    title: str = Field(description="Title or name of the project")
    status: Optional[str] = Field(description="proposed, active, completed, delayed", default="proposed")
    description: Optional[str] = Field(description="Brief description of the project", default=None)
    budget: Optional[str] = Field(description="Budget if mentioned", default=None)
    timeline: Optional[str] = Field(description="Timeline or duration if mentioned", default=None)
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
    forecasts: List[ExtractedForecast] = Field(default_factory=list)
    projects: List[ExtractedProject] = Field(default_factory=list)
    relationships: List[AIRelationship] = Field(default_factory=list)

def extract_entities_from_chunk(text: str) -> Optional[AIExtractionResult]:
    from .gemini_service import extract_with_gemini
    try:
        raw_dict = extract_with_gemini(text)
        return AIExtractionResult(**raw_dict)
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")

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
    # Try exact case-insensitive match first to avoid merging distinct entities (e.g. "Ram" and "Ramesh Kumar")
    existing = db.query(Person).filter(Person.name.ilike(p.name)).first()
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
    existing = db.query(Event).filter(Event.title.ilike(e.title)).first()
    if existing: return existing
    dt = parse_date(e.date)
    new_e = Event(title=e.title, event_date=dt, event_type=e.type, description=e.description)
    db.add(new_e)
    db.commit()
    db.refresh(new_e)
    return new_e

def get_or_create_meeting(db: Session, m: ExtractedMeeting) -> Meeting:
    existing = db.query(Meeting).filter(Meeting.title.ilike(m.title)).first()
    if existing: return existing
    dt = parse_date(m.date)
    new_m = Meeting(title=m.title, meeting_date=dt, meeting_type=m.type, description=m.description)
    db.add(new_m)
    db.commit()
    db.refresh(new_m)
    return new_m

def get_or_create_decision(db: Session, d: ExtractedDecision) -> Decision:
    existing = db.query(Decision).filter(Decision.title.ilike(d.title)).first()
    if existing: return existing
    dt = parse_date(d.date)
    new_d = Decision(title=d.title, decision_date=dt, reason=d.reason, action=d.action, impact=d.impact, status=d.status)
    db.add(new_d)
    db.commit()
    db.refresh(new_d)
    return new_d

def get_or_create_forecast(db: Session, f: ExtractedForecast) -> Forecast:
    existing = db.query(Forecast).filter(Forecast.description.ilike(f.description)).first()
    if existing: return existing
    new_f = Forecast(title=f.type, description=f.description, reason=f.basis)
    db.add(new_f)
    db.commit()
    db.refresh(new_f)
    return new_f

def get_or_create_project(db: Session, p: ExtractedProject) -> Project:
    existing = db.query(Project).filter(Project.title.ilike(p.title)).first()
    if existing: return existing
    new_p = Project(title=p.title, status=p.status, description=p.description, budget=p.budget, timeline=p.timeline)
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p

def run_extraction_pipeline(db: Session, document_id: int):
    chunks = get_document_chunks(db, document_id, chunk_size=5)
    
    stats = {
        "documents": 1,
        "people": 0,
        "events": 0,
        "meetings": 0,
        "decisions": 0,
        "forecasts": 0,
        "projects": 0,
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
            
        for proj in getattr(res, 'projects', []):
            p_obj = get_or_create_project(db, proj)
            add_evidence("project", p_obj.id, proj.evidence)
            stats["projects"] += 1
            extracted_data.append(("project", p_obj))
            
        for fc in getattr(res, 'forecasts', []):
            fore = get_or_create_forecast(db, fc)
            ev_rec = add_evidence("forecast", fore.id, fc.evidence)
            if ev_rec:
                fe = ForecastEvidence(forecast_id=fore.id, document_id=document_id, page_number=ev_rec.page_number, evidence_id=ev_rec.id)
                db.add(fe)
                db.commit()
            stats["forecasts"] += 1
            extracted_data.append(("forecast", fore))
            
        ai_relationships.extend(res.relationships)
            
    # Build Relationships
    from .relationship_service import build_relationships
    rels = build_relationships(db, document_id, extracted_data, ai_relationships)
    stats["relationships"] += rels
    
    return stats
