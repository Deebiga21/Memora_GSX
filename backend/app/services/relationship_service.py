import os
from typing import List, Tuple, Any, Dict
from sqlalchemy.orm import Session
from ..models import Relationship, Person, Event, Meeting, Decision

def resolve_entity_id_by_name(db: Session, entity_type: str, name: str) -> int:
    # Extremely basic resolution for AI extracted string references
    if entity_type == "person":
        ent = db.query(Person).filter(Person.name.ilike(f"%{name}%")).first()
    elif entity_type == "event":
        ent = db.query(Event).filter(Event.title.ilike(f"%{name}%")).first()
    elif entity_type == "meeting":
        ent = db.query(Meeting).filter(Meeting.title.ilike(f"%{name}%")).first()
    elif entity_type == "decision":
        ent = db.query(Decision).filter(Decision.title.ilike(f"%{name}%")).first()
    else:
        ent = None
        
    return ent.id if ent else None

def build_relationships(db: Session, document_id: int, extracted_data: List[Tuple[str, Any]], ai_relationships: List[Any]) -> int:
    """
    Builds relationships between the extracted entities without an extra AI call.
    Uses explicitly passed relationships from AI extraction phase and heuristic logic.
    """
    if not extracted_data:
        return 0
        
    count = 0
    
    # Process explicitly passed relationships (either Dicts or Pydantic models)
    for r in ai_relationships:
        if isinstance(r, dict):
            # Already resolved ID from meeting participants in ai_service
            rel = Relationship(
                source_type=r["source_type"],
                source_id=r["source_id"],
                relationship_type=r["rel_type"],
                target_type=r["target_type"],
                target_id=r["target_id"],
                evidence_id=r.get("evidence_id")
            )
            db.add(rel)
            count += 1
        else:
            # Pydantic model (AIRelationship) from Gemini payload
            # We need to resolve the string names to IDs
            source_type = "event" # fallback heuristic or we could parse
            target_type = "decision"
            
            # Very naive type inference based on relationship name
            if r.relationship_type in ["participated_in"]: source_type = "person"; target_type = "meeting"
            elif r.relationship_type in ["triggered"]: source_type = "event"; target_type = "decision"
            elif r.relationship_type in ["resulted_in"]: source_type = "meeting"; target_type = "decision"
            elif r.relationship_type in ["followed_by"]: source_type = "decision"; target_type = "action"
            
            s_id = resolve_entity_id_by_name(db, source_type, r.source_entity)
            t_id = resolve_entity_id_by_name(db, target_type, r.target_entity)
            
            if s_id and t_id:
                rel = Relationship(
                    source_type=source_type,
                    source_id=s_id,
                    relationship_type=r.relationship_type,
                    target_type=target_type,
                    target_id=t_id
                )
                db.add(rel)
                count += 1
            
    # Heuristically add Document contains links
    for etype, entity in extracted_data:
        if etype in ["event", "decision"]:
            rel = Relationship(
                source_type="document",
                source_id=document_id,
                relationship_type="contains",
                target_type=etype,
                target_id=entity.id
            )
            db.add(rel)
            count += 1
            
    db.commit()
        
    return count
