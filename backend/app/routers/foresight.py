from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Prediction, Evidence, Document

router = APIRouter()

@router.get('/')
def get_foresight(db: Session = Depends(get_db)):
    predictions = db.query(Prediction).all()
    result = []
    for p in predictions:
        ev = db.query(Evidence).filter(Evidence.entity_type == 'prediction', Evidence.entity_id == p.id).first()
        doc_name = None
        if ev:
            doc = db.query(Document).filter(Document.id == ev.document_id).first()
            if doc:
                doc_name = doc.filename
        result.append({
            'id': p.id,
            'type': p.prediction_type,
            'description': p.description,
            'expected_date': p.expected_date.isoformat() if p.expected_date else None,
            'basis': p.basis,
            'status': p.status,
            'confidence': p.confidence,
            'source_document': doc_name,
            'source_page': ev.page_number if ev else None,
            'evidence_snippet': ev.snippet if ev else None
        })
    return result
