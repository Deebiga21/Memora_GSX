from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from .database import engine
from . import models

# Create all tables (if they don't exist)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Memora API")

# Configure CORS for frontend access
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

from .routers import documents, memory, decisions, search, dashboard, evidence, ask, profile, settings_router, foresight

app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(memory.router, prefix="", tags=["memory"]) # people, events, meetings, relationships
app.include_router(decisions.router, prefix="/decisions", tags=["decisions"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
app.include_router(ask.router, prefix="/ask", tags=["ask"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(settings_router.router, prefix="/settings", tags=["settings"])
app.include_router(foresight.router, prefix="/foresight", tags=["foresight"])
