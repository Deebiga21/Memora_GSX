from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    original_filename = Column(String)
    file_path = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    page_count = Column(Integer, default=0)
    status = Column(String, default="uploaded") # uploaded, processing, processed, failed, needs_review
    upload_date = Column(DateTime, default=get_utc_now)
    processed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class DocumentPage(Base):
    __tablename__ = "document_pages"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    page_number = Column(Integer)
    text = Column(Text)
    character_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)

class Person(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String, nullable=True)
    department = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    event_date = Column(DateTime, nullable=True)
    event_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    meeting_date = Column(DateTime, nullable=True)
    meeting_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class Decision(Base):
    __tablename__ = "decisions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    decision_date = Column(DateTime, nullable=True)
    reason = Column(Text, nullable=True)
    action = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    status = Column(String, nullable=True) # active, implemented, revised, rejected, unknown
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    page_number = Column(Integer)
    entity_type = Column(String, index=True) # "person", "event", "meeting", "decision"
    entity_id = Column(Integer, index=True)
    snippet = Column(Text)
    context = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=get_utc_now)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    prediction_type = Column(String, index=True) # UPCOMING_DEADLINE, PLANNED_MEETING, EXPECTED_ACTION, etc.
    description = Column(Text)
    expected_date = Column(DateTime, nullable=True)
    basis = Column(Text, nullable=True)
    status = Column(String, default="pending")
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class Relationship(Base):
    __tablename__ = "relationships"
    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, index=True)
    source_id = Column(Integer, index=True)
    relationship_type = Column(String, index=True)
    target_type = Column(String, index=True)
    target_id = Column(Integer, index=True)
    confidence = Column(Float, default=1.0)
    evidence_id = Column(Integer, ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class UserProfile(Base):
    __tablename__ = 'user_profile'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default='User')
    email = Column(String, default='')
    role = Column(String, default='')
    department = Column(String, default='')
    institution = Column(String, default='NovaTech Institute')
    profile_image = Column(String, default='')

class UserSettings(Base):
    __tablename__ = 'user_settings'
    id = Column(Integer, primary_key=True, index=True)
    dark_mode = Column(Integer, default=0)
    voice_input = Column(Integer, default=1)
    voice_output = Column(Integer, default=0)
    show_confidence = Column(Integer, default=1)
    show_evidence = Column(Integer, default=1)
    notify_processing = Column(Integer, default=1)
    notify_failure = Column(Integer, default=1)
    notify_review = Column(Integer, default=0)

