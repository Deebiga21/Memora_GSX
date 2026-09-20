from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Person, Event, Meeting, Decision, Document, Evidence, Relationship
from datetime import datetime

router = APIRouter()

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    docs = db.query(Document).count()
    people = db.query(Person).count()
    events = db.query(Event).count()
    meetings = db.query(Meeting).count()
    decisions = db.query(Decision).count()
    evidence = db.query(Evidence).count()
    from ..models import Prediction
    predictions = db.query(Prediction).count()
    
    processed_docs = db.query(Document).filter(Document.status == "processed").count()
    pending_docs = db.query(Document).filter(Document.status.in_(["uploaded", "processing"])).count()
    failed_docs = db.query(Document).filter(Document.status == "failed").count()
    
    # Decisions with and without evidence
    decisions_list = db.query(Decision.id).all()
    traceable_decisions = 0
    decisions_missing_evidence = 0
    
    for (d_id,) in decisions_list:
        ev_count = db.query(Evidence).filter(Evidence.entity_type == "decision", Evidence.entity_id == d_id).count()
        if ev_count > 0:
            traceable_decisions += 1
        else:
            decisions_missing_evidence += 1
            
    recent_events = db.query(Event).order_by(Event.event_date.desc()).limit(5).all()
    recent_decs = db.query(Decision).order_by(Decision.decision_date.desc()).limit(5).all()
    
    return {
        "counts": {
            "documents": docs,
            "people": people,
            "events": events,
            "meetings": meetings,
            "decisions": decisions,
            "evidence": evidence,
            "relationships": relationships,
            "predictions": predictions
        },
        "stats": {
            "processed_documents": processed_docs,
            "pending_documents": pending_docs,
            "failed_documents": failed_docs,
            "traceable_decisions": traceable_decisions,
            "decisions_missing_evidence": decisions_missing_evidence
        },
        "recent_events": [{"id": e.id, "title": e.title, "date": e.event_date} for e in recent_events],
        "recent_decisions": [{"id": d.id, "title": d.title, "date": d.decision_date} for d in recent_decs]
    }

@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    meetings = db.query(Meeting).all()
    decisions = db.query(Decision).all()
    
    timeline = []
    for e in events:
        if e.event_date: timeline.append({"id": f"event_{e.id}", "title": e.title, "date": e.event_date.isoformat(), "type": "Event"})
    for m in meetings:
        if m.meeting_date: timeline.append({"id": f"meeting_{m.id}", "title": m.title, "date": m.meeting_date.isoformat(), "type": "Meeting"})
    for d in decisions:
        if d.decision_date: timeline.append({"id": f"decision_{d.id}", "title": d.title, "date": d.decision_date.isoformat(), "type": "Decision"})
        
    timeline.sort(key=lambda x: x["date"], reverse=True)
    return timeline
