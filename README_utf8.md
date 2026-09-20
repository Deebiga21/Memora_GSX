# MEMORA MVP

"An AI-powered institutional memory and decision traceability platform."

This repository contains the foundational code for MEMORA. It includes a modern React frontend with all 8 core interface screens built precisely to spec.

## Core Cognitive Pipeline

MEMORA operates on an 8-step flow:
1. **UPLOAD A PDF** - Ingest raw institutional records.
2. **UNDERSTAND THE PDF** - Read and process text page by page.
3. **EXTRACT ITS INFORMATION** - AI identifies people, events, meetings, and actions.
4. **SAVE IT AS MEMORY** - Persist extracted entities to the database.
5. **CONNECT IT WITH OTHER DOCUMENTS** - Form relationships across the entire dataset.
6. **BUILD DECISIONS/TIMELINE** - Visually trace the chronological journey of a decision.
7. **ANSWER QUESTIONS FROM THAT MEMORY** - Use the RAG engine to find grounded answers.
8. **FORECAST POSSIBLE NEXT DEVELOPMENTS** - Predict risks, deadlines, and required actions based on past memory.

## Project Structure
- `frontend/` - React frontend powered by Vite, Tailwind CSS, Framer Motion, and Recharts.
- `backend/` - Initial directory structure for the FastAPI backend.

## How to Run the Frontend

1. Open a terminal.
2. Navigate to the frontend directory: `cd d:\GSX\memora\frontend`
3. Start the development server: `npm run dev`
4. Open the displayed local URL (typically `http://localhost:5173`) in your browser to explore the interfaces.

### Implemented Pages:
- **Landing Page:** (`/`) - Features abstract decision DNA graph.
- **Dashboard:** (`/dashboard`) - Analytics, recent decisions, and institutional timeline.
- **Document Intelligence:** (`/documents`) - Document processing UI.
- **Institutional Memory:** (`/memory`) - Search and filter people, events, and a knowledge graph mock.
- **Decision DNA:** (`/decisions`) - Interactive node graph showing the journey of a decision.
- **Decision Timeline:** (`/timeline`) - Chronological representation of events.
- **Ask Memory:** (`/ask`) - RAG interface for finding grounded answers.
- **Evidence Viewer:** (`/evidence`) - Mock document viewer highlighting decision evidence.

