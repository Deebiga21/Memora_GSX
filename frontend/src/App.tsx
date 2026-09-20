import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DocumentIntelligence from "./pages/DocumentIntelligence";
import DocumentDetail from "./pages/DocumentDetail";
import InstitutionalMemory from "./pages/InstitutionalMemory";
import Decisions from "./pages/Decisions";
import DecisionDNA from "./pages/DecisionDNA";
import DecisionTimeline from "./pages/DecisionTimeline";
import AskMemory from "./pages/AskMemory";
import EvidenceViewer from "./pages/EvidenceViewer";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Foresight from "./pages/Foresight";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentIntelligence />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/memory" element={<InstitutionalMemory />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/decisions/:id/trace" element={<DecisionDNA />} />
          <Route path="/timeline" element={<DecisionTimeline />} />
          <Route path="/foresight" element={<Foresight />} />
          <Route path="/ask" element={<AskMemory />} />
          <Route path="/evidence" element={<Navigate to="/evidence/1" replace />} />
          <Route path="/evidence/:id" element={<EvidenceViewer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

