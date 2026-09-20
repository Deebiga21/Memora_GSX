from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class DocumentPageBase(BaseModel):
    page_number: int
    text: str
    character_count: int = 0
    word_count: int = 0

class DocumentPageResponse(DocumentPageBase):
    id: int
    document_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentBase(BaseModel):
    filename: str
    original_filename: Optional[str] = None
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    page_count: int
    status: str

class DocumentResponse(DocumentBase):
    id: int
    upload_date: datetime
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PersonBase(BaseModel):
    name: str
    role: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    confidence: float = 1.0

class PersonResponse(PersonBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EventBase(BaseModel):
    title: str
    event_date: Optional[datetime] = None
    event_type: Optional[str] = None
    description: Optional[str] = None
    confidence: float = 1.0

class EventResponse(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MeetingBase(BaseModel):
    title: str
    meeting_date: Optional[datetime] = None
    meeting_type: Optional[str] = None
    description: Optional[str] = None
    confidence: float = 1.0

class MeetingResponse(MeetingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DecisionBase(BaseModel):
    title: str
    decision_date: Optional[datetime] = None
    reason: Optional[str] = None
    action: Optional[str] = None
    impact: Optional[str] = None
    status: Optional[str] = None
    confidence: float = 1.0

class DecisionResponse(DecisionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EvidenceBase(BaseModel):
    document_id: int
    page_number: int
    entity_type: str
    entity_id: int
    snippet: str
    context: Optional[str] = None
    confidence: float = 1.0

class EvidenceResponse(EvidenceBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RelationshipBase(BaseModel):
    source_type: str
    source_id: int
    relationship_type: str
    target_type: str
    target_id: int
    confidence: float = 1.0
    evidence_id: Optional[int] = None

class RelationshipResponse(RelationshipBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AskRequest(BaseModel):
    question: str
    history: Optional[List[dict]] = []

class AskResponse(BaseModel):
    answer: str
    confidence: float = 0.0
    related_decisions: List[dict] = []
    related_events: List[dict] = []
    related_people: List[dict] = []
    evidence: List[dict] = []
