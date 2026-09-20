from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Evidence
from ..schemas import EvidenceResponse

router = APIRouter()

@router.get("/{id}", response_model=EvidenceResponse)
def get_evidence(id: int, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.id == id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return ev
