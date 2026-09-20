import { FileText, Users, Network, Calendar, Video, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { getTimeline } from "../services/api";
import { Link } from "react-router-dom";

export default function DecisionTimeline() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getTimeline()
      .then(setTimeline)
      .catch(() => setTimeline([]))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case "Event": return <Calendar size={14} className="text-purple-600" />;
      case "Meeting": return <Video size={14} className="text-indigo-600" />;
      case "Decision": return <Network size={14} className="text-blue-600" />;
      default: return <Clock size={14} className="text-slate-600" />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case "Event": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Meeting": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Decision": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getDotColor = (type: string) => {
    switch(type) {
      case "Event": return "bg-purple-500";
      case "Meeting": return "bg-indigo-500";
      case "Decision": return "bg-blue-500";
      default: return "bg-slate-500";
    }
  };

  const filteredTimeline = timeline.filter(item => {
    let matchesFilter = true;
    if (filter !== "All") {
      matchesFilter = item.type + "s" === filter;
    }
    let matchesSearch = true;
    if (searchQuery) {
      matchesSearch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    }
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0a192f] mb-1">Institutional Timeline</h1>
          <p className="text-sm text-slate-500 font-medium">Reconstruct how events evolved into decisions sequentially.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap gap-3">
           {["All", "Events", "Meetings", "Decisions"].map(f => (
             <button 
               key={f} 
               onClick={() => setFilter(f)}
               className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === f ? 'bg-[#0a192f] text-white border-[#0a192f]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
             >
               {f}
             </button>
           ))}
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search timeline..." 
            className="w-full md:max-w-xs px-4 py-1.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>


      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative pt-12 pb-12 min-h-[400px]">
        {/* Vertical Line */}
        <div className="absolute left-32 top-12 bottom-12 w-0.5 bg-slate-200"></div>

        {loading ? (
           <div className="p-12 text-center text-slate-500">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
               Building timeline...
            </div>
        ) : filteredTimeline.length === 0 ? (
           <div className="p-16 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Clock size={24} className="text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-[#0a192f] mb-1">Timeline empty</h3>
               <p className="text-slate-500 text-sm max-w-sm mx-auto">No records found for the selected filter.</p>
            </div>
        ) : (
          <div className="space-y-12">
            {filteredTimeline.map((item, index) => (
              <div key={index} className="flex relative group">
                {/* Date Column */}
                <div className="w-24 flex-shrink-0 text-right pr-6 pt-1">
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                     {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() : "UNKNOWN"}
                  </div>
                  <div className="text-xl font-light text-slate-400">
                     {item.date ? new Date(item.date).getFullYear() : ""}
                  </div>
                </div>
                
                {/* Dot */}
                <div className="absolute left-32 -ml-2.5 mt-1.5 w-5 h-5 rounded-full border-4 border-white z-10 shadow-sm bg-white">
                   <div className={`w-full h-full rounded-full ${getDotColor(item.type)} transition-transform group-hover:scale-125`}></div>
                </div>

                {/* Content Card */}
                <div className="pl-12 flex-1">
                  <div className={`p-5 rounded-xl border transition-shadow shadow-sm cursor-pointer border-slate-100 hover:border-slate-300 hover:shadow-md bg-white`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-[#0a192f] group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getColor(item.type)}`}>
                        {getIcon(item.type)}
                        {item.type}
                      </span>
                    </div>
                    {item.type === 'Decision' && (
                       <Link to={`/decisions/${item.id.replace('decision_', '')}/trace`} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                          <Network size={14} /> View DNA Trace
                       </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
