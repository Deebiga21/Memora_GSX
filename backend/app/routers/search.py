from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Person, Event, Meeting, Decision, Evidence, Document

router = APIRouter()

@router.get("")
def search_all(q: str = "", db: Session = Depends(get_db)):
    if not q:
        return {"people": [], "events": [], "meetings": [], "decisions": [], "documents": [], "evidence": []}
        
    search_term = f"%{q}%"
    
    people = db.query(Person).filter(Person.name.ilike(search_term) | Person.description.ilike(search_term)).all()
    events = db.query(Event).filter(Event.title.ilike(search_term) | Event.description.ilike(search_term)).all()
    meetings = db.query(Meeting).filter(Meeting.title.ilike(search_term) | Meeting.description.ilike(search_term)).all()
    decisions = db.query(Decision).filter(Decision.title.ilike(search_term) | Decision.reason.ilike(search_term)).all()
    documents = db.query(Document).filter(Document.filename.ilike(search_term)).all()
    evidence = db.query(Evidence).filter(Evidence.snippet.ilike(search_term)).all()
    
    return {
        "people": [{"id": p.id, "name": p.name} for p in people],
        "events": [{"id": e.id, "title": e.title} for e in events],
        "meetings": [{"id": m.id, "title": m.title} for m in meetings],
        "decisions": [{"id": d.id, "title": d.title} for d in decisions],
        "documents": [{"id": d.id, "filename": d.filename} for d in documents],
        "evidence": [{"id": e.id, "snippet": e.snippet} for e in evidence]
    }
