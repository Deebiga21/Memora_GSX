import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

def create_pdf(filename, title, content_lines):
    c = canvas.Canvas(filename, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, 10 * inch, title)
    
    c.setFont("Helvetica", 12)
    y = 9.5 * inch
    for line in content_lines:
        c.drawString(1 * inch, y, line)
        y -= 0.25 * inch
        if y < 1 * inch:
            c.showPage()
            c.setFont("Helvetica", 12)
            y = 10 * inch
            
    c.save()

os.makedirs(r'd:\GSX\memora\datasets', exist_ok=True)

docs = [
    {
        "filename": r"d:\GSX\memora\datasets\06_ai_cloud_migration.pdf",
        "title": "AI Cloud Migration Initiative",
        "lines": [
            "Project Lead: Sarah Jenkins",
            "Cloud Architect: David Lee",
            "Security Officer: Maria Gonzalez",
            "",
            "The AI Cloud Migration Initiative aims to move our on-premise",
            "AI workloads to the AWS cloud to improve scalability and reduce costs.",
            "The target completion date for Phase 1 is October 30, 2026."
        ]
    },
    {
        "filename": r"d:\GSX\memora\datasets\07_security_review.pdf",
        "title": "Cloud Security Review",
        "lines": [
            "Author: Maria Gonzalez",
            "Date: September 5, 2026",
            "",
            "A preliminary security review of the proposed AWS architecture",
            "highlighted potential vulnerabilities in the data encryption transit.",
            "This security compliance issue must be resolved before proceeding",
            "with the migration of sensitive student data."
        ]
    },
    {
        "filename": r"d:\GSX\memora\datasets\08_migration_meeting.pdf",
        "title": "Migration Strategy Meeting",
        "lines": [
            "Date: September 10, 2026",
            "Participants: Sarah Jenkins, David Lee, Maria Gonzalez",
            "",
            "The team discussed the security compliance issue.",
            "David Lee proposed implementing end-to-end TLS 1.3 encryption.",
            "Maria Gonzalez approved the proposed architecture changes.",
            "Sarah Jenkins noted this will delay Phase 1 by approximately two weeks."
        ]
    },
    {
        "filename": r"d:\GSX\memora\datasets\09_vendor_agreement.pdf",
        "title": "Cloud Vendor Agreement Addendum",
        "lines": [
            "Date: September 12, 2026",
            "Prepared by: Legal Team",
            "",
            "An addendum to the AWS Enterprise Agreement has been signed,",
            "incorporating the new encryption requirements and increased bandwidth.",
            "The finance department has approved the additional $15,000 cost."
        ]
    },
    {
        "filename": r"d:\GSX\memora\datasets\10_revised_timeline.pdf",
        "title": "Revised Migration Timeline Decision",
        "lines": [
            "Date: September 15, 2026",
            "Approved by: Sarah Jenkins",
            "",
            "Due to the required security upgrades, the Migration Deadline Extended",
            "decision has been finalized.",
            "The new target completion date for Phase 1 is November 15, 2026.",
            "This ensures full compliance with data protection policies."
        ]
    }
]

for doc in docs:
    create_pdf(doc['filename'], doc['title'], doc['lines'])
    print(f"Created {doc['filename']}")
