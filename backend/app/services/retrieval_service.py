import os
import re
import json
from typing import Dict, Any, List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models import Evidence, Event, Decision, Meeting, Person, Document
import google.generativeai as genai

class QAAIResponse(BaseModel):
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
        
    # Keyword search across evidence
    ev_query = db.query(Evidence)
    for kw in keywords:
        ev_query = ev_query.filter(Evidence.snippet.ilike(f"%{kw}%"))
    for ev in ev_query.all():
        context.append(f"Evidence [{ev.id}] (Entity {ev.entity_type} {ev.entity_id}): {ev.snippet}")
        
    return context

def answer_memory_question(db: Session, question: str) -> Dict[str, Any]:
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

    prompt = f"""
You are MEMORA's intelligent institutional memory assistant.
You are a helpful chatbot interacting directly with a user.

Available Documents (Datasets) in the system: {doc_names}

Follow these rules:
1. If the user asks a conversational question (e.g. "Hello", "How are you", "What can you do?", "What datasets are available?"), reply conversationally and naturally as an AI assistant. You can list the available documents.
2. If the user asks a factual question about institutional memory, answer using ONLY the supplied EVIDENCE CONTEXT below. Do not invent facts.
3. If the user asks a specific factual question and the evidence is insufficient to answer it, explicitly state exactly: "I could not find sufficient evidence in the available institutional records."

When answering factual questions based on evidence, identify WHAT happened, WHY it happened, WHO was involved, WHEN it happened, and WHAT decision followed. Supply the evidence IDs used.

EXPECTED JSON FORMAT (Always return JSON):
{{
    "answer": "...",
    "confidence": 0.9,
    "decision": "...",
    "evidence_ids": [1, 2]
}}

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
                        "document": doc.filename if doc else "Unknown",
                        "page": ev.page_number,
                        "snippet": ev.snippet
                    })
                    if ev.entity_type == "decision":
                        d = db.query(Decision).filter(Decision.id == ev.entity_id).first()
                        if d: rel_decisions.append({"id": d.id, "title": d.title})
                    
            if "sufficient evidence" in parsed.answer.lower() and "could not find" in parsed.answer.lower():
                return empty_resp
                
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
        print(f"QA Error: {str(e)}")
        
    return empty_resp
