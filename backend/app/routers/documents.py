import os
import shutil
import uuid
import re
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Document, DocumentPage
from ..schemas import DocumentResponse
from ..services.pdf_service import extract_and_store_pdf_pages
from datetime import datetime, timezone

router = APIRouter()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "20"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

def sanitize_filename(filename: str) -> str:
    filename = os.path.basename(filename)
    filename = re.sub(r'[^a-zA-Z0-9_\.-]', '_', filename)
    return filename

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file:
        raise HTTPException(status_code=400, detail="File must exist.")
        
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Max size is {MAX_FILE_SIZE_MB}MB.")
        
    original_filename = file.filename
    safe_filename = sanitize_filename(original_filename)
    unique_filename = f"{uuid.uuid4().hex}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_doc = Document(
        filename=unique_filename,
        original_filename=original_filename,
        file_path=file_path,
        file_type="application/pdf",
        file_size=file_size,
        status="uploaded"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Process PDF and extract pages immediately as part of upload pipeline (Step 2 & 3)
    try:
        page_count = extract_and_store_pdf_pages(db, db_doc.id, file_path)
        db_doc.page_count = page_count
        db.commit()
        db.refresh(db_doc)
    except Exception as e:
        db_doc.status = "failed"
        db_doc.error_message = f"Failed to extract PDF: {str(e)}"
        db.commit()
        
    return db_doc

@router.get("", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

@router.get("/{id}", response_model=DocumentResponse)
def get_document(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{id}/pages")
def get_document_pages(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    pages = db.query(DocumentPage).filter(DocumentPage.document_id == id).order_by(DocumentPage.page_number).all()
    return {
        "document_id": id,
        "filename": doc.original_filename,
        "page_count": doc.page_count,
        "pages": [{"page_number": p.page_number, "text": p.text} for p in pages]
    }

@router.get("/{id}/extraction-debug")
def get_extraction_debug(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    pages = db.query(DocumentPage).filter(DocumentPage.document_id == id).order_by(DocumentPage.page_number).all()
    pages_with_text = sum(1 for p in pages if p.character_count > 0)
    total_characters = sum(p.character_count for p in pages)
    sample_text = pages[0].text[:500] if pages and pages[0].text else ""
    
    return {
        "document_id": id,
        "filename": doc.original_filename,
        "page_count": doc.page_count,
        "pages_with_text": pages_with_text,
        "total_characters": total_characters,
        "sample_text": sample_text
    }

@router.post("/{id}/extract")
def extract_document_debug(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    from ..services.pdf_service import get_document_chunks
    from ..services.gemini_service import extract_with_gemini
    
    chunks = get_document_chunks(db, id, chunk_size=5)
    if not chunks:
        raise HTTPException(status_code=400, detail="No text found in document.")
        
    start_page, end_page, text = chunks[0] # Just test first chunk
    
    try:
        result = extract_with_gemini(text)
        return result
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

from fastapi.responses import FileResponse

@router.get("/{id}/file")
def get_document_file(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found")
    return FileResponse(doc.file_path, media_type="application/pdf", filename=doc.original_filename)

@router.get("/{id}/status")
def get_document_status(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "status": doc.status,
        "stage": doc.error_message if doc.status == "failed" else "completed" if doc.status == "processed" else doc.status
    }

@router.delete("/{id}")
def delete_document(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Also remove file
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except:
            pass
            

    from ..models import Evidence, Relationship, Person, Event, Meeting, Decision

    # Track entities associated with this document's evidence
    doc_evidence = db.query(Evidence).filter(Evidence.document_id == id).all()
    entities_to_check = set()
    for ev in doc_evidence:
        entities_to_check.add((ev.entity_type, ev.entity_id))
    
    # Delete relationships tied to this document's evidence
    evidence_ids = [ev.id for ev in doc_evidence]
    if evidence_ids:
        db.query(Relationship).filter(Relationship.evidence_id.in_(evidence_ids)).delete(synchronize_session=False)

    # Delete the evidence and pages
    db.query(Evidence).filter(Evidence.document_id == id).delete(synchronize_session=False)
    db.query(DocumentPage).filter(DocumentPage.document_id == id).delete(synchronize_session=False)
    
    # Delete the document
    db.delete(doc)
    db.flush()

    # Recalculate dependent entities
    for e_type, e_id in entities_to_check:
        count = db.query(Evidence).filter(Evidence.entity_type == e_type, Evidence.entity_id == e_id).count()
        if count == 0:
            # Delete orphan entity
            if e_type == 'person': db.query(Person).filter(Person.id == e_id).delete(synchronize_session=False)
            elif e_type == 'event': db.query(Event).filter(Event.id == e_id).delete(synchronize_session=False)
            elif e_type == 'meeting': db.query(Meeting).filter(Meeting.id == e_id).delete(synchronize_session=False)
            elif e_type == 'decision': db.query(Decision).filter(Decision.id == e_id).delete(synchronize_session=False)
            
            # Clean up any relationships where this entity is source or target
            db.query(Relationship).filter(Relationship.source_type == e_type, Relationship.source_id == e_id).delete(synchronize_session=False)
            db.query(Relationship).filter(Relationship.target_type == e_type, Relationship.target_id == e_id).delete(synchronize_session=False)

    db.commit()
    return {"status": "success"}

@router.post("/{id}/process")
def process_document(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    from ..services.ai_service import run_extraction_pipeline
    
    try:
        doc.status = "processing"
        db.commit()
        
        stats = run_extraction_pipeline(db, id)
        
        doc.status = "processed"
        doc.processed_at = datetime.now(timezone.utc)
        doc.error_message = None
        db.commit()
        return stats
    except Exception as e:
        doc.status = "failed"
        doc.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}/extracted_flow")
def get_extracted_flow(id: int, db: Session = Depends(get_db)):
    from ..models import Evidence, Person, Event, Meeting, Decision, Relationship, Project
    
    # Get all evidence for this doc
    evidences = db.query(Evidence).filter(Evidence.document_id == id).all()
    
    people = []
    flow_items = []
    
    for ev in evidences:
        if ev.entity_type == "person":
            p = db.query(Person).filter(Person.id == ev.entity_id).first()
            if p and p not in people: people.append(p)
        elif ev.entity_type == "event":
            e = db.query(Event).filter(Event.id == ev.entity_id).first()
            if e: flow_items.append({"type": "Event", "date": e.event_date, "title": e.title, "description": e.description})
        elif ev.entity_type == "meeting":
            m = db.query(Meeting).filter(Meeting.id == ev.entity_id).first()
            if m: flow_items.append({"type": "Meeting", "date": m.meeting_date, "title": m.title, "description": m.description})
        elif ev.entity_type == "decision":
            d = db.query(Decision).filter(Decision.id == ev.entity_id).first()
            if d: flow_items.append({"type": "Decision", "date": d.decision_date, "title": d.title, "description": d.reason, "action": d.action})
            
    # Deduplicate flow items based on title and type
    unique_flow = []
    seen = set()
    for item in flow_items:
        key = f"{item['type']}_{item['title']}"
        if key not in seen:
            seen.add(key)
            unique_flow.append(item)
            
    # Sort by date
    unique_flow.sort(key=lambda x: str(x["date"]) if x["date"] else "0000-00-00")
    
    # Get forecasts for this doc
    from ..models import Forecast
    forecasts = []
    for ev in evidences:
        if ev.entity_type == "prediction":
            pr = db.query(Forecast).filter(Forecast.id == ev.entity_id).first()
            if pr:
                forecasts.append({
                    "type": pr.title,
                    "description": pr.description,
                    "expected_date": pr.expected_date,
                    "basis": pr.basis
                })

    def get_entity_title(e_type, e_id):
        if e_type == "person":
            p = db.query(Person).filter(Person.id == e_id).first()
            return p.name if p else "Person"
        elif e_type == "event":
            e = db.query(Event).filter(Event.id == e_id).first()
            return e.title if e else "Event"
        elif e_type == "meeting":
            m = db.query(Meeting).filter(Meeting.id == e_id).first()
            return m.title if m else "Meeting"
        elif e_type == "decision":
            d = db.query(Decision).filter(Decision.id == e_id).first()
            return d.title if d else "Decision"
        elif e_type == "project":
            pr = db.query(Project).filter(Project.id == e_id).first()
            return pr.title if pr else "Project"
        elif e_type == "forecast":
            f = db.query(Forecast).filter(Forecast.id == e_id).first()
            return f.title if f else "Forecast"
        return str(e_type)

    evidence_ids = [ev.id for ev in evidences]
    
    # Relationships linked by evidence
    rel_query = db.query(Relationship).filter(Relationship.evidence_id.in_(evidence_ids)) if evidence_ids else []
    relationships = list(rel_query)
    
    # Also include relationships where both source and target are entities found in this document
    entity_keys = set((ev.entity_type, ev.entity_id) for ev in evidences)
    
    if entity_keys:
        from sqlalchemy import or_, and_
        # This could be a complex query, so we'll just fetch all relationships for these source entities
        # and filter in memory since it's a small app.
        for e_type, e_id in entity_keys:
            src_rels = db.query(Relationship).filter(Relationship.source_type == e_type, Relationship.source_id == e_id).all()
            for r in src_rels:
                if (r.target_type, r.target_id) in entity_keys and r not in relationships:
                    relationships.append(r)
    
    rel_data = []
    for r in relationships:
        src_name = get_entity_title(r.source_type, r.source_id)
        tgt_name = get_entity_title(r.target_type, r.target_id)
        rel_data.append({
            "source": f"{src_name}_{r.source_type}_{r.source_id}",
            "target": f"{tgt_name}_{r.target_type}_{r.target_id}",
            "type": r.relationship_type
        })

    return {
        "people": [{"name": p.name, "role": p.role, "department": p.department} for p in people],
        "flow": unique_flow,
        "forecasts": forecasts,
        "relationships": rel_data
    }

@router.get('/{document_id}/detail')
def get_document_detail(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    
    pages_data = []
    from ..models import Evidence, Person, Event, Meeting, Decision, Forecast
    
    db_pages = db.query(DocumentPage).filter(DocumentPage.document_id == document_id).order_by(DocumentPage.page_number).all()
    
    for db_page in db_pages:
        page_num = db_page.page_number - 1 # 0-indexed for the loop logic below
        text = db_page.text
        
        evidences = db.query(Evidence).filter(Evidence.document_id == document_id, Evidence.page_number == db_page.page_number).all()
        entities = []
        for ev in evidences:
            title = f"Unknown {ev.entity_type}"
            if ev.entity_type == 'person':
                p = db.query(Person).filter(Person.id == ev.entity_id).first()
                if p: title = p.name
            elif ev.entity_type == 'event':
                e = db.query(Event).filter(Event.id == ev.entity_id).first()
                if e: title = e.title
            elif ev.entity_type == 'meeting':
                m = db.query(Meeting).filter(Meeting.id == ev.entity_id).first()
                if m: title = m.title
            elif ev.entity_type == 'decision':
                d = db.query(Decision).filter(Decision.id == ev.entity_id).first()
                if d: title = d.title
            elif ev.entity_type == 'prediction':
                pr = db.query(Forecast).filter(Forecast.id == ev.entity_id).first()
                if pr: title = pr.description

            entities.append({
                'type': ev.entity_type,
                'id': ev.entity_id,
                'title': title,
                'snippet': ev.snippet,
                'confidence': ev.confidence
            })
        
        pages_data.append({
            'page_number': page_num + 1,
            'text': text,
            'extracted_entities': entities
        })
            
    return {
        'id': doc.id,
        'filename': doc.filename,
        'status': doc.status,
        'created_at': doc.created_at,
        'pages': pages_data
    }
