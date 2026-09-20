from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import AskRequest, AskResponse
from ..services.retrieval_service import answer_memory_question

router = APIRouter()

@router.post("", response_model=AskResponse)
def ask_memory(request: AskRequest, db: Session = Depends(get_db)):
    return answer_memory_question(db, request.question)
