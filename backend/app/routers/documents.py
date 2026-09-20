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
        
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid MIME type. Must be application/pdf.")
        
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

from fastapi.responses import FileResponse

@router.get("/{id}/file")
def get_document_file(id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found")
    return FileResponse(doc.file_path, media_type="application/pdf", filename=doc.original_filename)

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
