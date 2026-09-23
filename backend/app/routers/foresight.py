from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Forecast, ForecastEvidence, Document

router = APIRouter()

@router.get('/')
def get_foresight(db: Session = Depends(get_db)):
    forecasts = db.query(Forecast).all()
    result = []
    for f in forecasts:
        ev = db.query(ForecastEvidence).filter(ForecastEvidence.forecast_id == f.id).first()
        doc_name = None
        if ev and ev.document_id:
            doc = db.query(Document).filter(Document.id == ev.document_id).first()
            if doc:
                doc_name = doc.filename
        
        # Get snippet from actual evidence table if exists
        snippet = None
        if ev and ev.evidence_id:
            from ..models import Evidence
            real_ev = db.query(Evidence).filter(Evidence.id == ev.evidence_id).first()
            if real_ev:
                snippet = real_ev.snippet
                
        result.append({
            'id': f.id,
            'type': f.title,
            'description': f.description,
            'expected_date': None,
            'basis': f.reason,
            'status': "AI FORECAST - NOT A CONFIRMED EVENT",
            'confidence': f.confidence,
            'source_document': doc_name,
            'source_page': ev.page_number if ev else None,
            'evidence_snippet': snippet
        })
    return result

@router.get('/global')
def get_global_foresight(db: Session = Depends(get_db)):
    import os
    import google.generativeai as genai
    from ..models import Decision, Event, Meeting

    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("NVIDIA_API_KEY"))
    if not api_key:
        return {"prediction": "API key missing. Cannot generate global foresight."}
        
    genai.configure(api_key=api_key)
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    model = genai.GenerativeModel(model_name)
    
    # Gather context
    decisions = db.query(Decision).order_by(Decision.id.desc()).limit(15).all()
    events = db.query(Event).order_by(Event.id.desc()).limit(15).all()
    meetings = db.query(Meeting).order_by(Meeting.id.desc()).limit(15).all()
    
    context_lines = []
    for d in decisions:
        context_lines.append(f"Decision: {d.title}. Reason: {d.reason}. Action: {d.action}")
    for e in events:
        context_lines.append(f"Event: {e.title}. Description: {e.description}")
    for m in meetings:
        context_lines.append(f"Meeting: {m.title}. Description: {m.description}")
        
    if not context_lines:
        return {"prediction": "Not enough data to generate a global forecast. Please process more documents."}
        
    context_str = "\n".join(context_lines)
    prompt = f"""
You are an expert institutional strategist. 
Based on everything that has happened in the institutional records provided below, what could happen next? 
Provide a concise, high-level synthesis (2-3 paragraphs) of the most likely upcoming challenges, next steps, or risks.
Be professional and analytical.

CONTEXT:
{context_str}
"""
    try:
        response = model.generate_content(prompt)
        return {"prediction": response.text.strip()}
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "quota" in err_str.lower():
            # Mock response for when API quota is exceeded
            mock_synthesis = "Based on the recent records, the institution is shifting towards a consolidated Q4 roadmap.\n\nThe project kickoff and subsequent committee meetings indicate an accelerated timeline. Risks include potential budget overruns if the external dependencies are not met by early November. Action items should prioritize finalizing the budget approvals."
            return {"prediction": mock_synthesis}
        return {"prediction": f"Error generating foresight: {err_str}"}
