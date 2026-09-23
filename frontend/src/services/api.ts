import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

export const getHealth = async () => (await api.get("/health")).data;
export const getDashboardStats = async () => (await api.get("/api/dashboard/stats")).data;
export const getTimeline = async () => (await api.get("/api/dashboard/timeline")).data;
export const getRecentActivity = async () => (await api.get("/api/dashboard/recent")).data;

// Documents
export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return (await api.post("/api/documents/upload", formData)).data;
};
export const getDocuments = async () => (await api.get("/api/documents")).data;
export const getDocument = async (id: number) => (await api.get(`/api/documents/${id}`)).data;
export const getDocumentDetail = async (id: number) => (await api.get(`/api/documents/${id}/detail`)).data;
export const processDocument = async (id: number) => (await api.post(`/api/documents/${id}/process`)).data;
export const deleteDocument = async (id: number) => {
  const res = await api.delete(`/api/documents/${id}`);
  return res.data;
};

export const getExtractedFlow = async (id: number) => {
  const res = await api.get(`/api/documents/${id}/extracted_flow`);
  return res.data;
};

// Memory
export const getPeople = async () => (await api.get("/api/people")).data;
export const getEvents = async () => (await api.get("/api/events")).data;
export const getMeetings = async () => (await api.get("/api/meetings")).data;
export const getGlobalGraph = async () => (await api.get("/api/graph")).data;

// Decisions
export const getDecisions = async () => (await api.get("/api/decisions")).data;
export const getDecisionTrace = async (id: number) => (await api.get(`/api/decisions/${id}/trace`)).data;

// Foresight
export const getForesight = async () => (await api.get("/api/foresight")).data;
export const getGlobalForesight = async () => (await api.get("/api/foresight/global")).data;

// Ask
export const askMemory = async (message: string, conversation_id: number | null = null) => (await api.post("/api/ask", { message, conversation_id })).data;
export const getEvidence = async (id: number) => (await api.get(`/api/evidence/${id}`)).data;
export const searchMemory = async (q: string) => {
  const data = (await api.get(`/api/search?q=${q}`)).data;
  // Flatten backend search response for global search dropdown
  const results: any[] = [];
  if (data.documents) data.documents.forEach((d: any) => results.push({ type: 'Document', title: d.filename, id: d.id }));
  if (data.decisions) data.decisions.forEach((d: any) => results.push({ type: 'Decision', title: d.title, id: d.id }));
  if (data.events) data.events.forEach((e: any) => results.push({ type: 'Event', title: e.title, id: e.id }));
  if (data.meetings) data.meetings.forEach((m: any) => results.push({ type: 'Meeting', title: m.title, id: m.id }));
  if (data.people) data.people.forEach((p: any) => results.push({ type: 'Person', title: p.name, id: p.id }));
  return results;
};

export const getProfile = async () => (await api.get('/api/profile')).data;
export const updateProfile = async (data: any) => (await api.put('/api/profile', data)).data;
export const getSettings = async () => (await api.get('/api/settings')).data;
export const updateSettings = async (data: any) => (await api.put('/api/settings', data)).data;

