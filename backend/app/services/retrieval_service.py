import os
import re
import json
from typing import Dict, Any, List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models import Evidence, Event, Decision, Meeting, Person, Document, Project
import google.generativeai as genai

class QAAIResponse(BaseModel):
    is_factual: bool
    answer: str
    confidence: float
    decision: str = ""
    evidence_ids: List[int] = []

def get_keywords(text: str) -> List[str]:
    words = re.findall(r'\b\w{4,}\b', text.lower())
    stop_words = {"what", "when", "where", "which", "who", "whom", "whose", "why", "how", "that", "this", "these", "those", "does", "did", "was", "were", "been"}
    return [w for w in words if w not in stop_words]

def retrieve_relevant_context(db: Session, question: str):
    keywords = get_keywords(question)
    if not keywords:
        return []

    context = []
    
    # Keyword search across decisions
    dec_query = db.query(Decision)
    for kw in keywords:
        dec_query = dec_query.filter(or_(Decision.title.ilike(f"%{kw}%"), Decision.reason.ilike(f"%{kw}%")))
    for d in dec_query.all():
        context.append(f"Decision [{d.id}]: {d.title}. Reason: {d.reason}")
        
    # Keyword search across events
    evt_query = db.query(Event)
    for kw in keywords:
        evt_query = evt_query.filter(or_(Event.title.ilike(f"%{kw}%"), Event.description.ilike(f"%{kw}%")))
    for e in evt_query.all():
        context.append(f"Event [{e.id}]: {e.title}. {e.description}")
        
    # Keyword search across meetings
    mtg_query = db.query(Meeting)
    for kw in keywords:
        mtg_query = mtg_query.filter(or_(Meeting.title.ilike(f"%{kw}%"), Meeting.description.ilike(f"%{kw}%")))
    for m in mtg_query.all():
        context.append(f"Meeting [{m.id}]: {m.title}. {m.description}")
        
    # Keyword search across projects
    proj_query = db.query(Project)
    for kw in keywords:
        proj_query = proj_query.filter(or_(Project.title.ilike(f"%{kw}%"), Project.description.ilike(f"%{kw}%")))
    for p in proj_query.all():
        context.append(f"Project [{p.id}]: {p.title}. {p.description}")
        
    # Keyword search across evidence
    ev_query = db.query(Evidence)
    for kw in keywords:
        ev_query = ev_query.filter(Evidence.snippet.ilike(f"%{kw}%"))
    for ev in ev_query.all():
        doc = db.query(Document).filter(Document.id == ev.document_id).first()
        doc_name = doc.filename if doc else "Unknown"
        context.append(f"Evidence [{ev.id}] from Document '{doc_name}' Page {ev.page_number} (Entity {ev.entity_type} {ev.entity_id}): {ev.snippet}")
        
    return context

def answer_memory_question(db: Session, question: str, history: List[dict] = None) -> Dict[str, Any]:
    q_lower = question.strip().lower()
    if q_lower in ["hi", "hello", "hey", "who are you", "what can you do"]:
        docs = db.query(Document).all()
        doc_names = ", ".join([f"'{d.filename}'" for d in docs]) if docs else "no documents yet"
        return {
            "answer": f"Hello! I am MEMORA, your intelligent institutional memory assistant. I am currently indexing {doc_names}. Feel free to ask me questions about the decisions, events, or people in these records!",
            "confidence": 1.0,
            "decision": "",
            "evidence": [],
            "related_decisions": [],
            "related_events": [],
            "related_people": []
        }
        
    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("NVIDIA_API_KEY"))
    if not api_key:
        return {"answer": "API key missing.", "decision": "", "evidence": [], "confidence": 0.0, "related_decisions": [], "related_events": [], "related_people": []}
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    context = retrieve_relevant_context(db, question)
    
    # If no context found by keyword, fallback to a limit query just in case it's a general question
    if not context:
        for d in db.query(Decision).limit(10).all(): context.append(f"Decision [{d.id}]: {d.title}. Reason: {d.reason}")
        for ev in db.query(Evidence).limit(10).all(): context.append(f"Evidence [{ev.id}]: {ev.snippet}")

    # Fetch all document names so the chatbot knows what datasets are available
    docs = db.query(Document).all()
    doc_names = ", ".join([d.filename for d in docs]) if docs else "None"
    
    hist_str = ""
    if history:
        hist_str = "CONVERSATION HISTORY:\n" + "\n".join([f"{'User' if m['role']=='user' else 'Assistant'}: {m['content']}" for m in history[-5:]])

    prompt = f"""
You are MEMORA, an intelligent, conversational institutional memory assistant.
You MUST be friendly and conversational when the user greets you or asks about your capabilities.

Available Documents (Datasets) in the system: {doc_names}

Follow these rules strictly:
1. Determine if the user's query is a FACTUAL question about the documents (e.g., "What was the decision?", "Who attended?"). Set "is_factual" to true.
2. If it is a conversational query, greeting, or incomplete thought (e.g., "Hi", "how", "what can you do?"), set "is_factual" to false. Reply warmly as MEMORA, and tell them you can answer questions based on the datasets.
3. If "is_factual" is true, answer using ONLY the supplied EVIDENCE CONTEXT below. Do not invent facts.
4. If "is_factual" is true AND you cannot find the answer in the context, explicitly state exactly: "INSUFFICIENT_EVIDENCE" in the answer field.

When answering factual questions based on evidence, identify WHAT happened, WHY it happened, WHO was involved, WHEN it happened, and WHAT decision followed. Supply the evidence IDs used.

EXPECTED JSON FORMAT (Always return JSON):
{{
    "is_factual": true,
    "answer": "...",
    "confidence": 0.9,
    "decision": "...",
    "evidence_ids": [1, 2]
}}

{hist_str}

EVIDENCE CONTEXT:
{chr(10).join(context)}

USER MESSAGE:
{question}
"""
    
    empty_resp = {"answer": "I could not find sufficient evidence in the available institutional records.", "decision": "", "evidence": [], "confidence": 0.0, "related_decisions": [], "related_events": [], "related_people": []}
    
    try:
        response = model.generate_content(prompt)
        content = response.text
        if content:
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            parsed = QAAIResponse.model_validate_json(content)
            
            evidence_list = []
            rel_decisions = []
            
            for ev_id in parsed.evidence_ids:
                ev = db.query(Evidence).filter(Evidence.id == ev_id).first()
                if ev:
                    doc = db.query(Document).filter(Document.id == ev.document_id).first()
                    evidence_list.append({
                        "document_id": doc.id if doc else None,
                        "document": doc.filename if doc else "Unknown",
                        "page": ev.page_number,
                        "snippet": ev.snippet
                    })
                    if ev.entity_type == "decision":
                        d = db.query(Decision).filter(Decision.id == ev.entity_id).first()
                        if d: rel_decisions.append({"id": d.id, "title": d.title})
                    
            if parsed.is_factual and "INSUFFICIENT_EVIDENCE" in parsed.answer:
                parsed.answer = "I could not find sufficient evidence in the available institutional records."
                
            return {
                "answer": parsed.answer,
                "confidence": parsed.confidence,
                "decision": parsed.decision,
                "evidence": evidence_list,
                "related_decisions": rel_decisions,
                "related_events": [],
                "related_people": []
            }
    except Exception as e:
        err_msg = str(e)
        print(f"QA Error: {err_msg}")
        if "API key not valid" in err_msg:
            return {"answer": "Error: GEMINI_API_KEY is missing or invalid in your .env file. Please add a valid Google Gemini API key.", "decision": "", "evidence": [], "confidence": 0.0, "related_decisions": [], "related_events": [], "related_people": []}
        
    return empty_resp
