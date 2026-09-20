from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from .database import engine
from .models import Base
from .routers import documents, memory, decisions, evidence, search, ask, dashboard, profile, settings_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MEMORA API", description="Intelligent Institutional Memory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(memory.router, tags=["Memory"])
app.include_router(decisions.router, prefix="/decisions", tags=["Decisions"])
app.include_router(evidence.router, prefix="/evidence", tags=["Evidence"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(ask.router, prefix="/ask", tags=["Ask"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(settings_router.router, prefix="/settings", tags=["Settings"])
