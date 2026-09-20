from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserProfile
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ProfileSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    institution: Optional[str] = None
    profile_image: Optional[str] = None

@router.get("")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(name="Arun Kumar", email="arun@novatech.edu", role="Project Lead", department="IT", institution="NovaTech Institute")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("")
def update_profile(updates: ProfileSchema, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile
