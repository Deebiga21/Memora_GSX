import { Network, Search, Filter, ChevronRight, FileText, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { getDecisions } from "../services/api";
import { Link } from "react-router-dom";

export default function Decisions() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getDecisions()
      .then(setDecisions)
      .catch(() => setDecisions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#5A544A] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#F4EFE6] mb-1">Decision Registry</h1>
          <p className="text-sm text-[#8C7A5E] font-medium">Browse, filter, and trace every decision extracted from your institutional records.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-[#201D19] border border-[#5A544A] rounded-md text-sm font-semibold text-[#F4EFE6] hover:bg-[#2C2A28] transition-colors shadow-md">
             Export Registry
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
         {["All", "Recent", "High Confidence", "Needs Review", "Traceable", "Missing Evidence"].map(filter => (
           <button key={filter} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${filter === 'All' ? 'bg-[#DFCEB6] text-[#2C2A28] border-[#DFCEB6]' : 'bg-[#2C2A28] text-[#A18A68] border-[#3D3A35] hover:border-[#83633F] hover:bg-[#34322F]'}`}>
             {filter}
           </button>
         ))}
      </div>

      <div className="bg-[#201D19] border border-[#5A544A] rounded-xl shadow-md overflow-hidden">
        
        {/* Search */}
        <div className="p-4 border-b border-[#3D3A35] flex gap-4 bg-[#2C2A28]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A18A68]" size={16} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search decisions by title, reason, or trigger..." className="w-full pl-10 pr-4 py-2.5 bg-[#201D19] border border-[#5A544A] rounded-lg text-sm font-medium text-[#F4EFE6] focus:outline-none focus:border-[#83633F] focus:ring-1 focus:ring-[#83633F] transition-shadow placeholder:text-[#A18A68]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#201D19] border border-[#5A544A] text-[#A18A68] rounded-lg text-sm font-bold hover:bg-[#34322F] transition-colors shadow-sm">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-[#8C7A5E]">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#DFCEB6] mx-auto mb-4"></div>
               Loading decisions...
            </div>
          ) : decisions.length === 0 ? (
            <div className="p-16 text-center">
               <div className="w-16 h-16 bg-[#2C2A28] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3D3A35]">
                  <Network size={24} className="text-[#8C7A5E]" />
               </div>
               <h3 className="text-lg font-bold text-[#F4EFE6] mb-1">No decisions traced yet</h3>
               <p className="text-[#8C7A5E] text-sm max-w-sm mx-auto">Upload documents to extract and track institutional decisions.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#3D3A35]">
              {decisions.filter(d => {
                if (!searchQuery) return true;
                const text = (d.title + " " + d.reason).toLowerCase();
                return text.includes(searchQuery.toLowerCase());
              }).map((decision: any, idx: number) => (
                <div key={idx} className="p-6 hover:bg-[#2C2A28] transition-colors flex flex-col md:flex-row gap-6 md:items-start group">
                  
                  <div className="flex-1 space-y-4">
                     <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#34322F] border border-[#5A544A] text-[#DFCEB6] flex items-center justify-center flex-shrink-0 mt-0.5">
                         <Network size={14}/>
                       </div>
                       <div>
                         <h3 className="font-bold text-[#F4EFE6] text-lg mb-1 group-hover:text-[#EADBB9] transition-colors">{decision.title}</h3>
                         <div className="text-xs font-medium text-[#8C7A5E]">{decision.decision_date ? new Date(decision.decision_date).toLocaleDateString() : "Not specified"}</div>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-11">
                       <div>
                         <div className="text-[10px] font-black text-[#A18A68] uppercase tracking-widest mb-1">Reason (Why)</div>
                         <div className="text-sm text-[#F4EFE6] font-medium bg-[#2C2A28] p-2 rounded border border-[#3D3A35]">{decision.reason || "Not specified"}</div>
                       </div>
                       <div>
                         <div className="text-[10px] font-black text-[#A18A68] uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={10}/> Action (What)</div>
                         <div className="text-sm font-medium bg-[#34322F] p-2 rounded border border-[#5A544A] text-[#DFCEB6]">{decision.action || "Not specified"}</div>
                       </div>
                       <div>
                         <div className="text-[10px] font-black text-[#A18A68] uppercase tracking-widest mb-1">Expected Impact</div>
                         <div className="text-sm font-medium bg-[#34322F] p-2 rounded border border-[#5A544A] text-[#DFCEB6]">{decision.impact || "Not mapped"}</div>
                       </div>
                       <div>
                         <div className="text-[10px] font-black text-[#A18A68] uppercase tracking-widest mb-1">Execution Status</div>
                         <div className="text-sm font-bold uppercase tracking-wider mt-1">
                           <span className={`px-2.5 py-1 rounded-sm text-[10px] ${
                             decision.status?.toLowerCase() === 'implemented' ? 'bg-[#EADBB9] text-[#201D19]' :
                             decision.status?.toLowerCase() === 'rejected' ? 'bg-[#2C2A28] text-[#8C7A5E] border border-[#5A544A]' :
                             'bg-[#3D3A35] text-[#A18A68]'
                           }`}>
                             {decision.status || "UNKNOWN"}
                           </span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="w-full md:w-64 bg-[#2C2A28] border border-[#5A544A] rounded-xl p-4 shadow-md space-y-4">
                     <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-black text-[#A18A68] uppercase tracking-widest">Confidence</div>
                        <span className="px-2 py-0.5 bg-[#3D3A35] text-[#DFCEB6] font-bold rounded text-xs border border-[#83633F]">{(decision.confidence * 100).toFixed(0) || "100"}%</span>
                     </div>
                     
                     <div className="space-y-2 mb-6">
                       <div className="text-[10px] font-black text-[#A18A68] uppercase tracking-widest mb-1.5">Linked Context</div>
                       <div className="flex flex-wrap gap-2">
                         <span className="px-2 py-1 bg-[#3D3A35] border border-[#5A544A] text-[10px] font-bold text-[#F4EFE6] rounded">Trace Available</span>
                       </div>
                     </div>

                     <Link to={`/decisions/${decision.id}/trace`} className="w-full flex items-center justify-center gap-2 py-2 bg-[#DFCEB6] text-[#2C2A28] rounded-md text-xs font-bold hover:bg-[#EADBB9] transition-colors shadow-sm">
                        View Decision DNA <ChevronRight size={14}/>
                     </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
