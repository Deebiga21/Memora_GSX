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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A18A68]"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col pb-4">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-4">
            <Link to={-1 as any} className="p-2 border border-[#5A544A] rounded-lg hover:bg-[#34322F] text-[#8C7A5E] hover:text-[#F4EFE6] bg-[#2C2A28] transition-colors">
               <ArrowLeft size={16} />
            </Link>
            <div>
               <h1 className="text-xl font-bold text-[#F4EFE6] leading-tight">Evidence Trace</h1>
               <p className="text-xs font-medium text-[#8C7A5E]">Source Verification</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#201D19] border border-[#5A544A] text-[#A18A68] rounded-md text-xs font-bold">
               <CheckCircle2 size={14} /> AI Verified
            </span>
         </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">
         
         {/* LEFT: Document Viewer (Simulated PDF rendering) */}
         <div className="flex-1 bg-[#201D19] rounded-xl border border-[#5A544A] overflow-hidden flex flex-col relative shadow-inner">
            <div className="h-12 bg-[#2C2A28] border-b border-[#5A544A] flex items-center justify-between px-4 z-10">
               <div className="flex items-center gap-2 text-sm font-bold text-[#F4EFE6]">
                  <FileText size={16} className="text-[#A18A68]" />
                  {evidence.document}
               </div>
               <div className="flex items-center gap-4 text-xs font-medium text-[#8C7A5E]">
                  <span>Page {evidence.page} of 12</span>
                  <div className="flex items-center gap-2">
                     <button className="p-1 hover:text-[#F4EFE6]"><Search size={14}/></button>
                     <button className="p-1 hover:text-[#F4EFE6]"><Maximize2 size={14}/></button>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
               {/* Mock PDF Page */}
               <div className="w-full max-w-2xl bg-[#2C2A28] shadow-xl min-h-[800px] p-12 relative border border-[#5A544A]">
                  
                  {/* Document Header */}
                  <div className="border-b-2 border-[#83633F] pb-4 mb-8 text-center">
                     <h2 className="text-2xl font-serif font-bold text-[#F4EFE6] uppercase tracking-widest">Project Committee</h2>
                     <p className="text-sm font-serif text-[#8C7A5E] mt-1">Meeting Minutes - August 12, 2026</p>
                  </div>

                  {/* Document Content */}
                  <div className="space-y-6 font-serif text-[#F4EFE6] leading-relaxed text-justify">
                     <p>The meeting was called to order at 10:00 AM. Attendance included Arun Kumar (Project Lead), Priya (Operations), and Ravi (Hardware Engineering).</p>
                     <p>Ravi provided an update on the current status of the Phase 2 hardware integration. It was noted that vendor shipments for critical components were delayed by 14 days, creating a cascading effect on the QA timeline.</p>
                     
                     {/* Highlighted Evidence */}
                     <div className="bg-[#DFCEB6]/30 border-l-4 border-[#83633F] p-2 -mx-3 my-4 rounded-r relative group cursor-pointer">
                        <div className="absolute -left-12 top-1 w-8 h-8 bg-[#34322F] text-[#F4EFE6] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                           <Network size={14}/>
                        </div>
                        <p className="font-medium text-[#F4EFE6]">
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
         <div className="w-[400px] bg-[#2C2A28] rounded-xl border border-[#5A544A] shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#3D3A35] bg-[#201D19]">
               <h3 className="font-bold text-[#F4EFE6] text-sm uppercase tracking-wider">Extraction Details</h3>
            </div>
            
            <div className="p-6 space-y-8 overflow-auto flex-1">
               
               <div>
                  <div className="text-[10px] font-black text-[#8C7A5E] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Search size={12}/> Exact Match
                  </div>
                  <div className="bg-[#34322F] p-4 rounded-lg border border-[#5A544A] text-sm font-medium text-[#F4EFE6] leading-relaxed">
                     "{evidence.extract}"
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <div className="text-[10px] font-black text-[#8C7A5E] uppercase tracking-widest mb-1">Confidence</div>
                     <span className="px-2.5 py-1 bg-[#201D19] text-[#A18A68] font-bold rounded-md text-sm border border-[#5A544A]">
                        {evidence.confidence}%
                     </span>
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-[#8C7A5E] uppercase tracking-widest mb-1">Page</div>
                     <div className="text-sm font-bold text-[#F4EFE6]">{evidence.page}</div>
                  </div>
               </div>

               <div className="pt-6 border-t border-[#3D3A35] space-y-5">
                  <div className="text-[10px] font-black text-[#8C7A5E] uppercase tracking-widest mb-2">Mapped Relationships</div>
                  
                  <div className="space-y-3">
                     <div className="flex gap-3 p-3 bg-[#34322F] rounded-lg border border-[#3D3A35]">
                        <Network size={16} className="text-[#A18A68] shrink-0 mt-0.5" />
                        <div>
                           <div className="text-[10px] font-bold text-[#A18A68] uppercase tracking-wider mb-0.5">Supports Decision</div>
                           <Link to="/decisions/1/trace" className="text-sm font-bold text-[#F4EFE6] hover:text-[#A18A68] transition-colors">
                              {evidence.related_decision}
                           </Link>
                        </div>
                     </div>

                     <div className="flex gap-3 p-3 bg-[#34322F] rounded-lg border border-[#3D3A35]">
                        <Calendar size={16} className="text-[#A18A68] shrink-0 mt-0.5" />
                        <div>
                           <div className="text-[10px] font-bold text-[#A18A68] uppercase tracking-wider mb-0.5">Detected Event</div>
                           <div className="text-sm font-semibold text-[#F4EFE6]">
                              {evidence.related_event}
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3 p-3 bg-[#34322F] rounded-lg border border-[#3D3A35]">
                        <Video size={16} className="text-[#A18A68] shrink-0 mt-0.5" />
                        <div>
                           <div className="text-[10px] font-bold text-[#A18A68] uppercase tracking-wider mb-0.5">Context Meeting</div>
                           <div className="text-sm font-semibold text-[#F4EFE6]">
                              {evidence.related_meeting}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
            
            <div className="p-4 border-t border-[#3D3A35] bg-[#201D19]">
               <button className="w-full py-2.5 bg-[#2C2A28] border border-[#5A544A] text-[#F4EFE6] rounded-lg text-sm font-bold hover:bg-[#34322F] transition-colors flex items-center justify-center gap-2 shadow-sm">
                  View Full Document <ExternalLink size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
