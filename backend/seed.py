import os
import sys
from datetime import datetime, timedelta

# Add backend directory to sys.path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, Document, DocumentPage, Person, Event, Meeting, Decision, Evidence, Relationship

def seed_db():
    print("Starting database seed with relationships...")
    db = SessionLocal()
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Clear existing data
    db.query(Relationship).delete()
    db.query(Evidence).delete()
    db.query(Decision).delete()
    db.query(Meeting).delete()
    db.query(Event).delete()
    db.query(Person).delete()
    db.query(DocumentPage).delete()
    db.query(Document).delete()
    db.commit()

    # Dates
    today = datetime.now()
    d_minus_30 = today - timedelta(days=30)
    d_minus_25 = today - timedelta(days=25)
    d_minus_20 = today - timedelta(days=20)
    d_minus_15 = today - timedelta(days=15)
    d_minus_5 = today - timedelta(days=5)
    d_minus_2 = today - timedelta(days=2)
    
    # Create Documents
    doc1 = Document(filename="Q3_Strategic_Planning_Minutes.pdf", file_path="/mock/Q3_Strategic_Planning_Minutes.pdf", status="processed", page_count=12, created_at=d_minus_30)
    doc2 = Document(filename="Hardware_Vendor_SLA_Update.pdf", file_path="/mock/Hardware_Vendor_SLA_Update.pdf", status="processed", page_count=5, created_at=d_minus_20)
    doc3 = Document(filename="Security_Audit_Report_2026.pdf", file_path="/mock/Security_Audit_Report_2026.pdf", status="processed", page_count=45, created_at=d_minus_5)
    
    db.add_all([doc1, doc2, doc3])
    db.commit()
    db.refresh(doc1)
    db.refresh(doc2)
    db.refresh(doc3)
    
    # Create Document Pages
    page1 = DocumentPage(document_id=doc1.id, page_number=3, text="The committee discussed the Q3 targets. Sarah Jenkins proposed shifting focus to the cloud migration initiative.")
    page2 = DocumentPage(document_id=doc2.id, page_number=1, text="Vendor notified us of a 3-week delay in shipments due to supply chain issues. Marcus suggested renegotiating the SLA.")
    page3 = DocumentPage(document_id=doc3.id, page_number=14, text="Critical vulnerability found in legacy authentication module. Elena recommended immediate deprecation.")
    db.add_all([page1, page2, page3])
    db.commit()

    # Create People
    p1 = Person(name="Sarah Jenkins", role="VP of Engineering", description="Leads the cloud migration strategy.")
    p2 = Person(name="Marcus Chen", role="Procurement Director", description="Manages hardware vendor relationships.")
    p3 = Person(name="Elena Rostova", role="CISO", description="Chief Information Security Officer.")
    p4 = Person(name="David Miller", role="CTO", description="Oversees all technical operations.")
    db.add_all([p1, p2, p3, p4])
    db.commit()

    # Create Events
    e1 = Event(title="Cloud Strategy Kickoff", event_date=d_minus_30, description="Initial planning for migrating core services to the cloud.")
    e2 = Event(title="Hardware Supply Chain Disruption", event_date=d_minus_25, description="Global chip shortage impacted primary vendor shipments.")
    e3 = Event(title="Annual Security Audit", event_date=d_minus_15, description="Third-party penetration testing and infrastructure review.")
    db.add_all([e1, e2, e3])
    db.commit()
    
    # Create Meetings
    m1 = Meeting(title="Q3 Strategic Planning", meeting_date=d_minus_30, description="Quarterly planning session to align departmental goals.")
    m2 = Meeting(title="Emergency Vendor Review", meeting_date=d_minus_20, description="Review of SLA breaches by primary hardware vendor.")
    m3 = Meeting(title="Security Remediation Sync", meeting_date=d_minus_2, description="Review of audit findings and prioritization of fixes.")
    db.add_all([m1, m2, m3])
    db.commit()
    
    # Create Decisions
    dec1 = Decision(title="Prioritize Cloud Migration", decision_date=d_minus_30, reason="Needed to scale infrastructure dynamically for Q4 product launches.", action="Shifted 40% of engineering resources to Cloud Platform team.", impact="Delayed legacy feature updates.", confidence=0.95, status="implemented")
    dec2 = Decision(title="Renegotiate Vendor SLA", decision_date=d_minus_20, reason="3-week shipment delays breached existing contract terms.", action="Initiated penalty clause and sought secondary vendors.", impact="Secured 15% discount on delayed shipments.", confidence=0.88, status="active")
    dec3 = Decision(title="Deprecate Legacy Auth Module", decision_date=d_minus_2, reason="Critical vulnerability exposed user session tokens.", action="Forced migration to OAuth2.0 for all enterprise clients.", impact="Required 48 hours of emergency downtime.", confidence=0.98, status="implemented")
    db.add_all([dec1, dec2, dec3])
    db.commit()
    
    # Create Evidence Links
    ev1 = Evidence(document_id=doc1.id, page_number=3, snippet="The committee resolved to prioritize the cloud migration initiative, shifting engineering resources immediately to ensure readiness for Q4.", entity_type="decision", entity_id=dec1.id, confidence=0.95)
    ev2 = Evidence(document_id=doc2.id, page_number=1, snippet="Due to the 3-week delay, Marcus proposed initiating the SLA penalty clause. The motion was approved unanimously.", entity_type="decision", entity_id=dec2.id, confidence=0.88)
    ev3 = Evidence(document_id=doc3.id, page_number=14, snippet="Given the severity of the legacy auth vulnerability (CVSS 9.8), Elena mandated an immediate deprecation timeline.", entity_type="decision", entity_id=dec3.id, confidence=0.98)
    db.add_all([ev1, ev2, ev3])
    db.commit()

    # Create Relationships
    # Cloud Migration DNA
    r1 = Relationship(source_type="event", source_id=e1.id, target_type="decision", target_id=dec1.id, relationship_type="triggered")
    r2 = Relationship(source_type="meeting", source_id=m1.id, target_type="decision", target_id=dec1.id, relationship_type="resulted_in")
    r3 = Relationship(source_type="person", source_id=p1.id, target_type="meeting", target_id=m1.id, relationship_type="participated_in")
    r4 = Relationship(source_type="person", source_id=p4.id, target_type="meeting", target_id=m1.id, relationship_type="participated_in")

    # Vendor SLA DNA
    r5 = Relationship(source_type="event", source_id=e2.id, target_type="decision", target_id=dec2.id, relationship_type="triggered")
    r6 = Relationship(source_type="meeting", source_id=m2.id, target_type="decision", target_id=dec2.id, relationship_type="resulted_in")
    r7 = Relationship(source_type="person", source_id=p2.id, target_type="meeting", target_id=m2.id, relationship_type="participated_in")
    
    # Security DNA
    r8 = Relationship(source_type="event", source_id=e3.id, target_type="decision", target_id=dec3.id, relationship_type="triggered")
    r9 = Relationship(source_type="meeting", source_id=m3.id, target_type="decision", target_id=dec3.id, relationship_type="resulted_in")
    r10 = Relationship(source_type="person", source_id=p3.id, target_type="meeting", target_id=m3.id, relationship_type="participated_in")
    r11 = Relationship(source_type="person", source_id=p4.id, target_type="meeting", target_id=m3.id, relationship_type="participated_in")

    db.add_all([r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11])
    db.commit()

    print("Database seeded successfully with relationships!")
    db.close()

if __name__ == "__main__":
    seed_db()
