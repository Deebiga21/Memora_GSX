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

os.makedirs('sample_data', exist_ok=True)

docs = [
    {
        "filename": "sample_data/01_project_kickoff.pdf",
        "title": "Campus Smart Mobility Initiative - Kickoff",
        "lines": [
            "Project Lead: Arun Kumar",
            "Project Coordinator: Priya Sharma",
            "Technical Advisor: Ravi Menon",
            "Finance Officer: Meera Iyer",
            "",
            "The Campus Smart Mobility Initiative aims to deploy autonomous shuttles",
            "across the NovaTech Institute campus to improve student transportation.",
            "The initial project deadline is set for December 15, 2026."
        ]
    },
    {
        "filename": "sample_data/02_hardware_testing_report.pdf",
        "title": "Hardware Testing Report - Shuttles",
        "lines": [
            "Author: Ravi Menon",
            "Date: August 10, 2026",
            "",
            "During the initial hardware testing phase, a critical defect was discovered",
            "in the LiDAR sensor modules of the shuttles.",
            "This hardware testing delay will severely impact our ability to deploy",
            "the shuttles safely by the original timeline.",
            "Testing is suspended until new sensors arrive."
        ]
    },
    {
        "filename": "sample_data/03_committee_meeting.pdf",
        "title": "Project Committee Meeting Minutes",
        "lines": [
            "Date: August 12, 2026",
            "Participants: Arun Kumar, Priya Sharma, Ravi Menon, Meera Iyer",
            "",
            "The committee discussed the recent hardware testing delay.",
            "Ravi Menon explained the LiDAR sensor defect.",
            "Meera Iyer confirmed there is budget available to order replacement sensors.",
            "Arun Kumar proposed options for adjusting the project schedule to accommodate",
            "the delay."
        ]
    },
    {
        "filename": "sample_data/04_budget_review.pdf",
        "title": "Budget Review & Resource Allocation",
        "lines": [
            "Date: August 14, 2026",
            "Prepared by: Meera Iyer",
            "",
            "Following the hardware defect, emergency funds of $50,000 have been",
            "allocated to procure upgraded LiDAR sensors from a new vendor.",
            "The finance decision ensures we do not compromise on safety."
        ]
    },
    {
        "filename": "sample_data/05_project_decision.pdf",
        "title": "Final Project Decision - Schedule Update",
        "lines": [
            "Date: August 15, 2026",
            "Approved by: Arun Kumar",
            "",
            "Due to the hardware testing delay and the time required to install",
            "the new sensors, the Project Deadline Extended decision has been finalized.",
            "The new project deadline is March 1, 2027.",
            "This action provides additional testing time to ensure passenger safety,",
            "though the impact means students will not have the shuttles for the fall semester."
        ]
    }
]

for doc in docs:
    create_pdf(doc['filename'], doc['title'], doc['lines'])
    print(f"Created {doc['filename']}")
