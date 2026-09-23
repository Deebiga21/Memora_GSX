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
    if keywords:
        dec_conds = [or_(Decision.title.ilike(f"%{kw}%"), Decision.reason.ilike(f"%{kw}%")) for kw in keywords]
        for d in db.query(Decision).filter(or_(*dec_conds)).all():
            context.append(f"Decision [{d.id}]: {d.title}. Reason: {d.reason}")
            
        # Keyword search across events
        evt_conds = [or_(Event.title.ilike(f"%{kw}%"), Event.description.ilike(f"%{kw}%")) for kw in keywords]
        for e in db.query(Event).filter(or_(*evt_conds)).all():
            context.append(f"Event [{e.id}]: {e.title}. {e.description}")
            
        # Keyword search across meetings
        mtg_conds = [or_(Meeting.title.ilike(f"%{kw}%"), Meeting.description.ilike(f"%{kw}%")) for kw in keywords]
        for m in db.query(Meeting).filter(or_(*mtg_conds)).all():
            context.append(f"Meeting [{m.id}]: {m.title}. {m.description}")
            
        # Keyword search across projects
        proj_conds = [or_(Project.title.ilike(f"%{kw}%"), Project.description.ilike(f"%{kw}%")) for kw in keywords]
        for p in db.query(Project).filter(or_(*proj_conds)).all():
            context.append(f"Project [{p.id}]: {p.title}. {p.description}")
            
        # Keyword search across people
        person_conds = [or_(Person.name.ilike(f"%{kw}%"), Person.role.ilike(f"%{kw}%")) for kw in keywords]
        for p in db.query(Person).filter(or_(*person_conds)).all():
            context.append(f"Person [{p.id}]: {p.name}. Role: {p.role}")
            
        # Keyword search across evidence
        ev_conds = [Evidence.snippet.ilike(f"%{kw}%") for kw in keywords]
        for ev in db.query(Evidence).filter(or_(*ev_conds)).all():
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
        
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if not nvidia_key and not gemini_key:
        return {"answer": "API key missing.", "decision": "", "evidence": [], "confidence": 0.0, "related_decisions": [], "related_events": [], "related_people": []}
    
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
        if nvidia_key:
            from openai import OpenAI
            client = OpenAI(
              base_url = "https://integrate.api.nvidia.com/v1",
              api_key = nvidia_key
            )
            completion = client.chat.completions.create(
              model="deepseek-ai/deepseek-v4.1-flash",
              messages=[{"role":"user","content":prompt}],
              temperature=0.2,
              max_tokens=2048,
            )
            content = completion.choices[0].message.content
        elif gemini_key:
            genai.configure(api_key=gemini_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            content = response.text
        else:
            return empty_resp
            
        if content:
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            parsed = QAAIResponse.model_validate_json(content)
            
            evidence_list = []
            rel_decisions = []
            
            rel_people = []
            
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
                        
            # Find people mentioned in the answer
            all_people = db.query(Person).all()
            for p in all_people:
                if p.name.lower() in parsed.answer.lower():
                    rel_people.append({"id": p.id, "name": p.name})
                    
            if parsed.is_factual and "INSUFFICIENT_EVIDENCE" in parsed.answer:
                parsed.answer = "I could not find sufficient evidence in the available institutional records."
                
            return {
                "answer": parsed.answer,
                "confidence": parsed.confidence,
                "decision": parsed.decision,
                "evidence": evidence_list,
                "related_decisions": rel_decisions,
                "related_events": [],
                "related_people": rel_people
            }
    except Exception as e:
        err_msg = str(e)
        print(f"QA Error: {err_msg}")
        if "API key not valid" in err_msg:
            return {"answer": "Error: GEMINI_API_KEY is missing or invalid in your .env file. Please add a valid Google Gemini API key.", "decision": "", "evidence": [], "confidence": 0.0, "related_decisions": [], "related_events": [], "related_people": []}
        if "429" in err_msg or "quota" in err_msg.lower():
            # Fallback for Q&A when rate limited
            if context:
                # Try to extract a simple answer from the top context
                fallback_answer = "This is a mocked response due to API quota limits. Based on the documents, "
                top_context = context[0]
                if "Decision" in top_context:
                    fallback_answer += "a decision was made regarding: " + top_context.split("Reason:")[-1].strip()
                elif "Event" in top_context or "Meeting" in top_context:
                    fallback_answer += "the committee met recently to discuss the project roadmap and budget approvals."
                elif "Evidence" in top_context:
                    fallback_answer += top_context.split(":")[-1].strip()
                else:
                    fallback_answer += "relevant information was found but cannot be fully synthesized without AI."
                    
                return {
                    "answer": fallback_answer,
                    "decision": "",
                    "evidence": [{"document": "Mocked Document", "page": 1, "snippet": "Mocked context due to rate limit"}],
                    "confidence": 0.8,
                    "related_decisions": [],
                    "related_events": [],
                    "related_people": []
                }
            else:
                return {
                    "answer": "This is a mocked response due to API quota limits. No relevant context was found in the database.", 
                    "decision": "", 
                    "evidence": [], 
                    "confidence": 0.0, 
                    "related_decisions": [], 
                    "related_events": [], 
                    "related_people": []
                }
        
    return empty_resp
