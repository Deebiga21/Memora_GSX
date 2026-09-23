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
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from .routers import documents, memory, decisions, search, dashboard, evidence, ask, profile, settings_router, foresight

app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(memory.router, prefix="/api", tags=["memory"]) # people, events, meetings, relationships
app.include_router(decisions.router, prefix="/api/decisions", tags=["decisions"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(evidence.router, prefix="/api/evidence", tags=["evidence"])
app.include_router(ask.router, prefix="/api/ask", tags=["ask"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["settings"])
app.include_router(foresight.router, prefix="/api/foresight", tags=["foresight"])
