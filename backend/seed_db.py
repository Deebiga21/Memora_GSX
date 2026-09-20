import os
from datetime import datetime, timezone
from app.database.database import SessionLocal, engine
from app.models import models

# Create tables
models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(models.Person).count() > 0:
        print("Database already seeded.")
        return
        
    print("Seeding database with demo scenario...")
    
    # 1. Documents
    doc1 = models.Document(filename="Meeting_Minutes_Aug12.pdf", page_count=12, status="Completed")
    doc2 = models.Document(filename="Project_Status_Report.pdf", page_count=8, status="Completed")
    doc3 = models.Document(filename="Hardware_Test_Report.pdf", page_count=5, status="Completed")
    db.add_all([doc1, doc2, doc3])
    db.commit()

    # 2. People
    arun = models.Person(name="Arun Kumar", role="Project Lead", organization="NovaTech")
    priya = models.Person(name="Priya", role="Project Coordinator", organization="NovaTech")
    ravi = models.Person(name="Ravi", role="Faculty Advisor", organization="NovaTech")
    db.add_all([arun, priya, ravi])
    db.commit()
    
    # 3. Events
    e1 = models.Event(title="Hardware Issue Detected", date=datetime(2026, 8, 8, tzinfo=timezone.utc), description="Testing issues identified.", event_type="Issue")
    e2 = models.Event(title="Hardware Testing Delayed", date=datetime(2026, 8, 10, tzinfo=timezone.utc), description="Testing could not be completed.", event_type="Delay")
    db.add_all([e1, e2])
    db.commit()
    
    # 4. Meetings
    m1 = models.Meeting(title="Project Committee Meeting", date=datetime(2026, 8, 12, tzinfo=timezone.utc), description="Emergency meeting to discuss delay.")
    db.add(m1)
    db.commit()
    
    # 5. Decisions
    d1 = models.Decision(title="Project Deadline Extended", date=datetime(2026, 8, 12, tzinfo=timezone.utc), 
                         description="Project deadline extended to Sep 20.",
                         reason="Testing could not be completed on schedule.",
                         action="Deadline extended to September 20.",
                         impact="Additional testing period provided.",
                         confidence=94.0)
    db.add(d1)
    db.commit()
    
    # 6. Evidence
    ev1 = models.Evidence(document_id=doc1.id, page_number=3, 
                          snippet="Due to the hardware testing delay, the committee approved an extension of the project deadline to September 20, 2026.",
                          text="Full text...", entity_type="decision", entity_id=d1.id)
    db.add(ev1)
    db.commit()
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
