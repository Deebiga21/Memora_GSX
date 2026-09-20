import { FileText, ArrowLeft, ExternalLink, Network, Calendar, Video, CheckCircle2, Search, Maximize2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEvidence } from "../services/api";

export default function EvidenceViewer() {
  const { id } = useParams();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For MVP, we simulate fetching evidence if ID is missing or fails
    getEvidence(Number(id) || 1)
      .then(setEvidence)
      .catch(() => {
        // Fallback mock data for the MVP workflow demonstration
        setEvidence({
          id: 1,
          document: "Committee_Meeting.pdf",
          page: 3,
          extract: "Due to the hardware testing delay, the project committee has agreed that the original testing schedule could not be completed. The project deadline is hereby extended to September 20th.",
          confidence: 94,
          related_decision: "Project Deadline Extended",
          related_event: "Hardware Testing Delay",
          related_meeting: "Project Committee Meeting"
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col pb-4">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-4">
            <Link to={-1 as any} className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-500 hover:text-slate-900 bg-slate-50 transition-colors">
               <ArrowLeft size={16} />
            </Link>
            <div>
               <h1 className="text-xl font-bold text-[#0a192f] leading-tight">Evidence Trace</h1>
               <p className="text-xs font-medium text-slate-500">Source Verification</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-md text-xs font-bold">
               <CheckCircle2 size={14} /> AI Verified
            </span>
         </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">
         
         {/* LEFT: Document Viewer (Simulated PDF rendering) */}
         <div className="flex-1 bg-slate-200/50 rounded-xl border border-slate-200 overflow-hidden flex flex-col relative shadow-inner">
            <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
               <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FileText size={16} className="text-blue-500" />
                  {evidence.document}
               </div>
               <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span>Page {evidence.page} of 12</span>
                  <div className="flex items-center gap-2">
                     <button className="p-1 hover:text-slate-900"><Search size={14}/></button>
                     <button className="p-1 hover:text-slate-900"><Maximize2 size={14}/></button>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
               {/* Mock PDF Page */}
               <div className="w-full max-w-2xl bg-white shadow-xl min-h-[800px] p-12 relative border border-slate-200">
                  
                  {/* Document Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-8 text-center">
                     <h2 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-widest">Project Committee</h2>
                     <p className="text-sm font-serif text-slate-500 mt-1">Meeting Minutes - August 12, 2026</p>
                  </div>

                  {/* Document Content */}
                  <div className="space-y-6 font-serif text-slate-700 leading-relaxed text-justify">
                     <p>The meeting was called to order at 10:00 AM. Attendance included Arun Kumar (Project Lead), Priya (Operations), and Ravi (Hardware Engineering).</p>
                     <p>Ravi provided an update on the current status of the Phase 2 hardware integration. It was noted that vendor shipments for critical components were delayed by 14 days, creating a cascading effect on the QA timeline.</p>
                     
                     {/* Highlighted Evidence */}
                     <div className="bg-yellow-200/40 border-l-4 border-yellow-400 p-2 -mx-3 my-4 rounded-r relative group cursor-pointer">
                        <div className="absolute -left-12 top-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                           <Network size={14}/>
                        </div>
                        <p className="font-medium text-slate-900">
                           Due to the hardware testing delay, the project committee has agreed that the original testing schedule could not be completed. The project deadline is hereby extended to September 20th.
                        </p>
                     </div>

                     <p>Priya noted that this extension will require updating the client communication strategy. Arun will draft the revised timeline and share it with the external stakeholders by EOD.</p>
                     <p>Meeting adjourned at 11:30 AM.</p>
                  </div>

               </div>
            </div>
         </div>

         {/* RIGHT: Evidence Details */}
         <div className="w-[400px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-[#0a192f] text-sm uppercase tracking-wider">Extraction Details</h3>
            </div>
            
            <div className="p-6 space-y-8 overflow-auto flex-1">
               
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Search size={12}/> Exact Match
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed">
                     "{evidence.extract}"
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</div>
                     <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-md text-sm border border-green-200">
                        {evidence.confidence}%
                     </span>
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Page</div>
                     <div className="text-sm font-bold text-slate-800">{evidence.page}</div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 space-y-5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mapped Relationships</div>
                  
                  <div className="space-y-3">
                     <div className="flex gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                        <Network size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                           <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Supports Decision</div>
                           <Link to="/decisions/1/trace" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                              {evidence.related_decision}
                           </Link>
                        </div>
                     </div>

                     <div className="flex gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100/50">
                        <Calendar size={16} className="text-purple-500 shrink-0 mt-0.5" />
                        <div>
                           <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-0.5">Detected Event</div>
                           <div className="text-sm font-semibold text-slate-800">
                              {evidence.related_event}
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                        <Video size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                           <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Context Meeting</div>
                           <div className="text-sm font-semibold text-slate-800">
                              {evidence.related_meeting}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50">
               <button className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  View Full Document <ExternalLink size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
