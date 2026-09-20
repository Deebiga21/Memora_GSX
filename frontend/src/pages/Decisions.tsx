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
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0a192f] mb-1">Decision Registry</h1>
          <p className="text-sm text-slate-500 font-medium">Browse, filter, and trace every decision extracted from your institutional records.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Export Registry
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
         {["All", "Recent", "High Confidence", "Needs Review", "Traceable", "Missing Evidence"].map(filter => (
           <button key={filter} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${filter === 'All' ? 'bg-[#0a192f] text-white border-[#0a192f]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
             {filter}
           </button>
         ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search decisions by title, reason, or trigger..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
               Loading decisions...
            </div>
          ) : decisions.length === 0 ? (
            <div className="p-16 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Network size={24} className="text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-[#0a192f] mb-1">No decisions traced yet</h3>
               <p className="text-slate-500 text-sm max-w-sm mx-auto">Upload documents to extract and track institutional decisions.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {decisions.filter(d => {
                if (!searchQuery) return true;
                const text = (d.title + " " + d.reason).toLowerCase();
                return text.includes(searchQuery.toLowerCase());
              }).map((decision: any, idx: number) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-start group">
                  
                  <div className="flex-1 space-y-4">
                     <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                         <Network size={14}/>
                       </div>
                       <div>
                         <h3 className="font-bold text-[#0a192f] text-lg mb-1 group-hover:text-blue-600 transition-colors">{decision.title}</h3>
                         <div className="text-xs font-medium text-slate-500">{decision.date || "12 Aug 2026"}</div>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-11">
                       <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason (Why)</div>
                         <div className="text-sm text-slate-800 font-medium bg-slate-50/50 p-2 rounded border border-slate-100">{decision.reason || "Not specified"}</div>
                       </div>
                       <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={10}/> Action (What)</div>
                         <div className="text-sm text-slate-800 font-medium bg-blue-50/50 p-2 rounded border border-blue-50 text-blue-900">{decision.action || "Not specified"}</div>
                       </div>
                       <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Impact</div>
                         <div className="text-sm text-slate-800 font-medium bg-purple-50/50 p-2 rounded border border-purple-50 text-purple-900">{decision.impact || "Not mapped"}</div>
                       </div>
                       <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Execution Status</div>
                         <div className="text-sm font-bold uppercase tracking-wider mt-1">
                           <span className={`px-2.5 py-1 rounded-sm text-[10px] ${
                             decision.status?.toLowerCase() === 'implemented' ? 'bg-emerald-100 text-emerald-800' :
                             decision.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                             'bg-slate-100 text-slate-800'
                           }`}>
                             {decision.status || "UNKNOWN"}
                           </span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="w-full md:w-64 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                     <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</div>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded text-xs border border-green-100">{(decision.confidence * 100).toFixed(0) || "100"}%</span>
                     </div>
                     
                     <div className="space-y-2 mb-6">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Linked Context</div>
                       <div className="flex flex-wrap gap-2">
                         <span className="px-2 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded">1 Trigger</span>
                         <span className="px-2 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded">1 Meeting</span>
                         <span className="px-2 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded">1 Evidence</span>
                       </div>
                     </div>

                     <Link to={`/decisions/${decision.id}/trace`} className="w-full flex items-center justify-center gap-2 py-2 bg-[#4F75FF] text-white rounded-md text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm">
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
