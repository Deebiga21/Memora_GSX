import { useState, useEffect } from "react";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { FileText, Calendar, Users, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getDecisionTrace } from "../services/api";

export default function DecisionDNA() {
  const { id } = useParams();
  const [trace, setTrace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getDecisionTrace(Number(id) || 1)
      .then(setTrace)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !trace) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D0BF9F]"></div>
    </div>
  );
  
  const nodes = [
    {
      id: "event",
      position: { x: 50, y: 50 },
      data: { label: <div className="p-2 w-48 text-center rounded-lg border border-[#A18A68] bg-[#2C2A28] text-[#EADBB9] font-medium"><div className="text-[10px] text-[#A18A68] font-bold tracking-wider mb-1 uppercase">Event</div>{trace.trigger_events?.[0]?.title || "Unknown Event"}</div> },
    },
    {
      id: "meeting",
      position: { x: 50, y: 150 },
      data: { label: <div className="p-2 w-48 text-center rounded-lg border border-[#A18A68] bg-[#2C2A28] text-[#EADBB9] font-medium"><div className="text-[10px] text-[#A18A68] font-bold tracking-wider mb-1 uppercase">Meeting</div>{trace.meetings?.[0]?.title || "Unknown Meeting"}</div> },
    },
    {
      id: "decision",
      position: { x: 50, y: 250 },
      data: { label: <div className="p-3 w-48 text-center rounded-lg border-2 border-[#D0BF9F] bg-[#38342B] text-[#EADBB9] font-medium shadow-[0_0_15px_rgba(208,191,159,0.2)]"><div className="text-[10px] text-[#D0BF9F] font-bold tracking-wider mb-1 uppercase">Decision</div>{trace.decision.title}</div> },
    },
    {
      id: "action",
      position: { x: 50, y: 350 },
      data: { label: <div className="p-2 w-48 text-center rounded-lg border border-[#A18A68] bg-[#2C2A28] text-[#EADBB9] font-medium"><div className="text-[10px] text-[#A18A68] font-bold tracking-wider mb-1 uppercase">Action</div>{trace.decision.action}</div> },
    },
    {
      id: "impact",
      position: { x: 50, y: 450 },
      data: { label: <div className="p-2 w-48 text-center rounded-lg border border-[#A18A68] bg-[#2C2A28] text-[#EADBB9] font-medium"><div className="text-[10px] text-[#A18A68] font-bold tracking-wider mb-1 uppercase">Impact</div>{trace.decision.impact}</div> },
    }
  ];

  const edges = [
    { id: "e1", source: "event", target: "meeting", animated: true, style: { stroke: '#A18A68', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#A18A68' } },
    { id: "e2", source: "meeting", target: "decision", animated: true, style: { stroke: '#D0BF9F', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#D0BF9F' } },
    { id: "e3", source: "decision", target: "action", animated: true, style: { stroke: '#A18A68', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#A18A68' } },
    { id: "e4", source: "action", target: "impact", animated: true, style: { stroke: '#A18A68', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#A18A68' } },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-[#EADBB9] drop-shadow-md">Decision DNA</h1>
        <p className="text-sm text-[#A18A68]">Reconstruct the complete chain of events leading to this decision.</p>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        
        {/* GRAPH PANE */}
        <div className="bg-[#2C2A28] border border-[#5A544A] rounded-2xl shadow-xl overflow-hidden relative">
           <ReactFlow nodes={nodes} edges={edges} fitView attributionPosition="bottom-right">
             <Background color="#5A544A" gap={16} />
             <Controls className="bg-[#201D19] border-[#5A544A] text-[#D0BF9F]" />
           </ReactFlow>
        </div>
        
        {/* DETAILS PANE */}
        <div className="bg-[#2C2A28] border border-[#5A544A] rounded-2xl shadow-xl p-8 overflow-y-auto relative scrollbar-thin scrollbar-thumb-[#A18A68] scrollbar-track-transparent">
          <div className="absolute top-8 right-8 bg-[#38342B] text-[#D0BF9F] px-3 py-1 rounded-full text-xs font-bold border border-[#A18A68] flex items-center gap-1 shadow-sm">
             <CheckCircle2 size={14}/> Confidence: {(trace.decision.confidence * 100).toFixed(0)}%
          </div>
          
          <div className="mb-8">
            <h2 className="text-xs font-bold text-[#A18A68] uppercase tracking-wider mb-2">Decision</h2>
            <h3 className="text-2xl font-bold text-[#EADBB9]">{trace.decision.title}</h3>
          </div>
          
          <div className="space-y-6">
             <div className="flex gap-4 items-start">
               <Calendar className="text-[#A18A68] mt-0.5" size={20} />
               <div>
                 <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mb-1">Date</div>
                 <div className="text-[#DFCEB6] font-medium">{trace.decision.date ? new Date(trace.decision.date).toLocaleDateString() : "Unknown"}</div>
               </div>
             </div>
             
             <div className="flex gap-4 items-start">
               <Users className="text-[#A18A68] mt-0.5" size={20} />
               <div>
                 <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mb-1">Involved People</div>
                 <div className="text-[#DFCEB6] font-medium">
                   {trace.people.length > 0 ? trace.people.map((p: any) => p.name).join(", ") : "Unknown"}
                 </div>
               </div>
             </div>
             
             <div className="flex gap-4 items-start">
               <Target className="text-[#A18A68] mt-0.5" size={20} />
               <div>
                 <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mb-1">Trigger Event</div>
                 <div className="text-[#DFCEB6] font-medium">{trace.trigger_events?.[0]?.title || "None"}</div>
               </div>
             </div>
             
             <div className="border-t border-[#5A544A] pt-6 mt-6">
                <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mb-3">Reasoning Context</div>
                <div className="bg-[#201D19] p-4 rounded-xl border border-[#38342B] text-[#D4C4A8] text-sm italic shadow-inner">
                  "{trace.decision.reason}"
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6 pt-4">
               <div>
                 <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mb-2">Action Taken</div>
                 <div className="text-[#DFCEB6] text-sm font-medium">{trace.decision.action}</div>
               </div>
               <div>
                 <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mb-2">Measured Impact</div>
                 <div className="text-[#DFCEB6] text-sm font-medium">{trace.decision.impact}</div>
               </div>
             </div>
             
             <div className="border-t border-[#5A544A] pt-6 mt-4">
                <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mb-3">Source Evidence</div>
                 {trace.evidence.map((ev: any, i: number) => (
                  <Link to={`/documents/${ev.document_id}`} key={i} className="flex items-center justify-between bg-[#38342B] border border-[#A18A68] p-4 rounded-xl mb-3 shadow-sm hover:bg-[#433F34] transition-colors cursor-pointer block">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-[#201D19] rounded-lg text-[#D0BF9F] border border-[#5A544A]">
                         <FileText size={20}/>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#EADBB9]">{ev.document}</div>
                        <div className="text-[11px] font-semibold text-[#A18A68] uppercase tracking-widest mt-1">Page {ev.page}</div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-[#8C7A5E]"/>
                  </Link>
                ))}
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
