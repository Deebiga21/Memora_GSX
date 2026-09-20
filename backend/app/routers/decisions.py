from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Decision, Relationship, Event, Meeting, Person, Evidence, Document
from ..schemas import DecisionResponse

router = APIRouter()

@router.get("", response_model=List[DecisionResponse])
def get_decisions(db: Session = Depends(get_db)):
    return db.query(Decision).all()

@router.get("/{id}", response_model=DecisionResponse)
def get_decision(id: int, db: Session = Depends(get_db)):
    dec = db.query(Decision).filter(Decision.id == id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    return dec

@router.get("/{id}/trace")
def get_decision_trace(id: int, db: Session = Depends(get_db)):
    dec = db.query(Decision).filter(Decision.id == id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
        
    trace = {
        "decision": {
            "id": dec.id,
            "title": dec.title,
            "date": dec.decision_date,
            "reason": dec.reason,
            "action": dec.action,
            "impact": dec.impact,
            "confidence": dec.confidence
        },
        "trigger_events": [],
        "meetings": [],
        "people": [],
        "evidence": []
    }
    
    # Evidence linked to this decision
    evidences = db.query(Evidence).filter(Evidence.entity_type == "decision", Evidence.entity_id == id).all()
    for ev in evidences:
        doc = db.query(Document).filter(Document.id == ev.document_id).first()
        trace["evidence"].append({
            "document_id": doc.id if doc else None,
            "document": doc.filename if doc else "Unknown",
            "page": ev.page_number,
            "snippet": ev.snippet
        })
        
    # Relationships where decision is target
    incoming_rels = db.query(Relationship).filter(Relationship.target_type == "decision", Relationship.target_id == id).all()
    
    for rel in incoming_rels:
        if rel.source_type == "event" and rel.relationship_type == "triggered":
            evt = db.query(Event).filter(Event.id == rel.source_id).first()
            if evt:
                trace["trigger_events"].append({"id": evt.id, "title": evt.title, "date": evt.event_date})
        elif rel.source_type == "meeting" and rel.relationship_type == "resulted_in":
            mtg = db.query(Meeting).filter(Meeting.id == rel.source_id).first()
            if mtg:
                trace["meetings"].append({"id": mtg.id, "title": mtg.title, "date": mtg.meeting_date})
                # Find people who participated in this meeting
                p_rels = db.query(Relationship).filter(
                    Relationship.source_type == "person",
                    Relationship.target_type == "meeting",
                    Relationship.target_id == mtg.id,
                    Relationship.relationship_type == "participated_in"
                ).all()
                for pr in p_rels:
                    person = db.query(Person).filter(Person.id == pr.source_id).first()
                    if person:
                        if not any(p["id"] == person.id for p in trace["people"]):
                            trace["people"].append({"id": person.id, "name": person.name, "role": person.role})

    return trace
