from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserSettings
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SettingsSchema(BaseModel):
    dark_mode: Optional[int] = None
    voice_input: Optional[int] = None
    voice_output: Optional[int] = None
    show_confidence: Optional[int] = None
    show_evidence: Optional[int] = None
    notify_processing: Optional[int] = None
    notify_failure: Optional[int] = None
    notify_review: Optional[int] = None

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("")
def update_settings(updates: SettingsSchema, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)
        
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    db.commit()
    db.refresh(settings)
    return settings
