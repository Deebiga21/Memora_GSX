from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Person, Event, Meeting, Project
from ..schemas import PersonResponse, EventResponse, MeetingResponse, ProjectResponse

router = APIRouter()

@router.get("/people", response_model=List[PersonResponse])
def get_people(db: Session = Depends(get_db)):
    return db.query(Person).all()

@router.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

@router.get("/meetings", response_model=List[MeetingResponse])
def get_meetings(db: Session = Depends(get_db)):
    return db.query(Meeting).all()

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

from ..models import Decision, Relationship

@router.get("/graph")
def get_global_graph(db: Session = Depends(get_db)):
    nodes = []
    edges = []
    
    # Fetch all entities
    people = db.query(Person).all()
    events = db.query(Event).all()
    meetings = db.query(Meeting).all()
    decisions = db.query(Decision).all()
    projects = db.query(Project).all()
    
    for p in people: nodes.append({"id": f"person_{p.id}", "label": p.name, "type": "Person"})
    for e in events: nodes.append({"id": f"event_{e.id}", "label": e.title, "type": "Event"})
    for m in meetings: nodes.append({"id": f"meeting_{m.id}", "label": m.title, "type": "Meeting"})
    for d in decisions: nodes.append({"id": f"decision_{d.id}", "label": d.title, "type": "Decision"})
    for pr in projects: nodes.append({"id": f"project_{pr.id}", "label": pr.title, "type": "Project"})
    
    rels = db.query(Relationship).filter(Relationship.source_type != "document").all()
    for i, r in enumerate(rels):
        edges.append({
            "id": f"edge_{i}",
            "source": f"{r.source_type}_{r.source_id}",
            "target": f"{r.target_type}_{r.target_id}",
            "label": r.relationship_type
        })
        
    return {"nodes": nodes, "edges": edges}
