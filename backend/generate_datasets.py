import os
import sys

# Ensure datasets directory exists
os.makedirs("../datasets", exist_ok=True)

try:
    from fpdf import FPDF
except ImportError:
    print("fpdf not installed.")
    sys.exit(1)

def create_committee_meeting():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Project Committee Meeting Minutes", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    
    pdf.cell(200, 10, txt="Date: August 12, 2026", ln=True)
    pdf.cell(200, 10, txt="Location: NovaTech Institute HQ - Room A", ln=True)
    pdf.cell(200, 10, txt="Participants: Arun Kumar (Project Lead), Priya (Project Coordinator)", ln=True)
    pdf.ln(10)
    
    # Page 1 content
    content1 = (
        "1. Opening Remarks\n"
        "Arun Kumar opened the meeting at 9:00 AM, discussing the overall progress of the Q3 deliverables. "
        "Priya noted that most software engineering tasks were on track.\n\n"
        "2. Hardware Vendor Update\n"
        "The team discussed the recent communication from our primary hardware vendor. "
        "A global supply chain disruption has caused delays in the shipping of the necessary testing rigs."
    )
    pdf.multi_cell(0, 10, txt=content1)
    
    # Page 2
    pdf.add_page()
    content2 = (
        "3. Impact Analysis\n"
        "Because the hardware testing rigs will not arrive for another 3 weeks, Priya highlighted that "
        "the scheduled integration testing phase cannot proceed. Without this testing, the product cannot "
        "be certified for the planned September 1 launch.\n\n"
        "Arun Kumar presented two options: skip full integration testing (high risk), or delay the launch."
    )
    pdf.multi_cell(0, 10, txt=content2)
    
    # Page 3 - The crucial decision page
    pdf.add_page()
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="4. Final Decision on Project Timeline", ln=True)
    pdf.set_font("Arial", size=12)
    content3 = (
        "After reviewing the risks, the committee unanimously agreed that safety and reliability are paramount. "
        "Due to the hardware testing delay, Arun Kumar proposed extending the project deadline.\n\n"
        "DECISION: The project deadline is officially extended to September 20, 2026.\n"
        "This additional time will be used to complete the required hardware integration testing once the rigs arrive. "
        "The marketing team will be notified immediately to adjust the campaign schedule."
    )
    pdf.multi_cell(0, 10, txt=content3)
    
    pdf.output("../datasets/Committee_Meeting.pdf")
    print("Created Committee_Meeting.pdf")

def create_security_audit():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Annual Security Audit Report 2026", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    
    pdf.cell(200, 10, txt="Date: September 2, 2026", ln=True)
    pdf.cell(200, 10, txt="Lead Auditor: Elena Rostova (CISO)", ln=True)
    pdf.ln(10)
    
    content = (
        "Executive Summary\n"
        "The annual security audit was conducted by the internal Red Team across all primary infrastructure. "
        "Overall compliance is at 94%. However, one critical vulnerability was discovered in the legacy authentication module.\n\n"
        "Finding 1: Legacy Auth Module Vulnerability (CVSS 9.8)\n"
        "The v1.0 authentication service is susceptible to a token bypass attack. An attacker could theoretically "
        "forge session cookies for administrative accounts.\n\n"
        "Remediation Decision\n"
        "Given the severity of the vulnerability, Elena Rostova mandated an immediate deprecation timeline. "
        "The legacy auth module will be completely deprecated by September 15, 2026. All clients will be forced "
        "to migrate to the OAuth2.0 standard. This will require 48 hours of emergency maintenance downtime this weekend."
    )
    pdf.multi_cell(0, 10, txt=content)
    
    pdf.output("../datasets/Security_Audit_Report.pdf")
    print("Created Security_Audit_Report.pdf")

if __name__ == "__main__":
    create_committee_meeting()
    create_security_audit()

def create_cit_meeting():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="CIT Meeting Minutes", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    
    pdf.cell(200, 10, txt="Date: September 15, 2026", ln=True)
    pdf.cell(200, 10, txt="Location: Main Campus - Room 101", ln=True)
    pdf.cell(200, 10, txt="Participants: Arun, Priya, CIT Committee Members", ln=True)
    pdf.ln(10)
    
    content = (
        "1. Opening Remarks\n"
        "The CIT committee discussed the integration of new technologies into the curriculum.\n\n"
        "2. Infrastructure Update\n"
        "The team reviewed the current lab equipment and identified areas for upgrade.\n\n"
        "3. Next Steps\n"
        "- Finalize the budget for the new hardware by next week.\n"
        "- Schedule follow-up meetings with vendors."
    )
    pdf.multi_cell(0, 10, txt=content)
    pdf.output("../datasets/cit_meeting_notes.pdf")
    print("Created cit_meeting_notes.pdf")

def create_deeps_project():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Deeps Project Update", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    
    pdf.cell(200, 10, txt="Date: September 18, 2026", ln=True)
    pdf.cell(200, 10, txt="Project: Deeps Initiative", ln=True)
    pdf.cell(200, 10, txt="Lead: Priya", ln=True)
    pdf.ln(10)
    
    content = (
        "Progress Report\n"
        "- Phase 1 of the Deeps project has been completed successfully.\n"
        "- Data collection from the primary sources is ongoing.\n\n"
        "Blockers\n"
        "- Minor delays in data validation due to server maintenance.\n\n"
        "Action Items\n"
        "- Coordinate with the IT team to resolve server issues.\n"
        "- Prepare the preliminary data analysis report."
    )
    pdf.multi_cell(0, 10, txt=content)
    pdf.output("../datasets/deeps_project_update.pdf")
    print("Created deeps_project_update.pdf")

def create_sriram_review():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Technical Review with Sriram", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    
    pdf.cell(200, 10, txt="Date: September 20, 2026", ln=True)
    pdf.cell(200, 10, txt="Reviewer: Sriram", ln=True)
    pdf.cell(200, 10, txt="Focus Area: Backend Architecture", ln=True)
    pdf.ln(10)
    
    content = (
        "System Architecture Review\n"
        "Sriram reviewed the current backend architecture and suggested implementing a microservices approach for better scalability.\n\n"
        "Security Audit Findings\n"
        "- Recommended updating the authentication middleware.\n"
        "- Suggested regular vulnerability scanning for all endpoints.\n\n"
        "Conclusion\n"
        "The team will begin drafting a transition plan based on Sriram's recommendations over the next two sprints."
    )
    pdf.multi_cell(0, 10, txt=content)
    pdf.output("../datasets/sriram_technical_review.pdf")
    print("Created sriram_technical_review.pdf")

if __name__ == "__main__":
    create_committee_meeting()
    create_security_audit()
    create_cit_meeting()
    create_deeps_project()
    create_sriram_review()
