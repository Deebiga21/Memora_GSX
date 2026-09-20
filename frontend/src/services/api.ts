import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

export const getHealth = async () => (await api.get("/health")).data;
export const getDashboardStats = async () => (await api.get("/dashboard/stats")).data;
export const getTimeline = async () => (await api.get("/timeline")).data;

// Documents
export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return (await api.post("/documents/upload", formData)).data;
};
export const getDocuments = async () => (await api.get("/documents")).data;
export const getDocument = async (id: number) => (await api.get(`/documents/${id}`)).data;
export const getDocumentDetail = async (id: number) => (await api.get(`/documents/${id}/detail`)).data;
export const processDocument = async (id: number) => (await api.post(`/documents/${id}/process`)).data;
export const deleteDocument = async (id: number) => {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
};

export const getExtractedFlow = async (id: number) => {
  const res = await api.get(`/documents/${id}/extracted_flow`);
  return res.data;
};

// Memory
export const getPeople = async () => (await api.get("/people")).data;
export const getEvents = async () => (await api.get("/events")).data;
export const getMeetings = async () => (await api.get("/meetings")).data;
export const getGlobalGraph = async () => (await api.get("/graph")).data;

// Decisions
export const getDecisions = async () => (await api.get("/decisions")).data;
export const getDecisionTrace = async (id: number) => (await api.get(`/decisions/${id}/trace`)).data;

// Foresight
export const getForesight = async () => (await api.get("/foresight")).data;

// Ask
export const askMemory = async (question: string, history: any[] = []) => (await api.post("/ask", { question, history })).data;
export const getEvidence = async (id: number) => (await api.get(`/evidence/${id}`)).data;
export const searchMemory = async (q: string) => {
  const data = (await api.get(`/search?q=${q}`)).data;
  // Flatten backend search response for global search dropdown
  const results: any[] = [];
  if (data.documents) data.documents.forEach((d: any) => results.push({ type: 'Document', title: d.filename, id: d.id }));
  if (data.decisions) data.decisions.forEach((d: any) => results.push({ type: 'Decision', title: d.title, id: d.id }));
  if (data.events) data.events.forEach((e: any) => results.push({ type: 'Event', title: e.title, id: e.id }));
  if (data.meetings) data.meetings.forEach((m: any) => results.push({ type: 'Meeting', title: m.title, id: m.id }));
  if (data.people) data.people.forEach((p: any) => results.push({ type: 'Person', title: p.name, id: p.id }));
  return results;
};

export const getProfile = async () => (await api.get('/profile')).data;
export const updateProfile = async (data: any) => (await api.put('/profile', data)).data;
export const getSettings = async () => (await api.get('/settings')).data;
export const updateSettings = async (data: any) => (await api.put('/settings', data)).data;

