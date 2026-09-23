from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import AskRequest, AskResponse
from ..services.retrieval_service import answer_memory_question

router = APIRouter()

@router.post("", response_model=AskResponse)
def ask_memory(request: AskRequest, db: Session = Depends(get_db)):
    from ..models import ChatSession, ChatMessage
    
    # Handle session
    if request.conversation_id:
        session = db.query(ChatSession).filter(ChatSession.id == request.conversation_id).first()
        if not session:
            session = ChatSession(id=request.conversation_id)
            db.add(session)
            db.commit()
    else:
        session = ChatSession()
        db.add(session)
        db.commit()
        db.refresh(session)
        
    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", message=request.message)
    db.add(user_msg)
    db.commit()
    
    # Retrieve history for context
    history = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at).all()
    history_list = [{"role": h.role, "content": h.message} for h in history]
    
    # Generate response
    response_data = answer_memory_question(db, request.message, history_list)
    
    # Save AI message
    ai_msg = ChatMessage(session_id=session.id, role="assistant", message=response_data["answer"])
    db.add(ai_msg)
    db.commit()
    
    response_data["conversation_id"] = session.id
    
    return response_data
