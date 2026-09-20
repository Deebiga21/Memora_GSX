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
      case "Event": return <Calendar size={14} className="text-[#F4EFE6]" />;
      case "Meeting": return <Video size={14} className="text-[#F4EFE6]" />;
      case "Decision": return <Network size={14} className="text-[#2C2A28]" />;
      default: return <Clock size={14} className="text-[#A18A68]" />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case "Event": return "bg-[#3D3A35] text-[#F4EFE6] border-[#5A544A]";
      case "Meeting": return "bg-[#34322F] text-[#F4EFE6] border-[#5A544A]";
      case "Decision": return "bg-[#DFCEB6] text-[#2C2A28] border-[#83633F]";
      default: return "bg-[#201D19] text-[#A18A68] border-[#3D3A35]";
    }
  };

  const getDotColor = (type: string) => {
    switch(type) {
      case "Event": return "bg-[#DFCEB6]";
      case "Meeting": return "bg-[#A18A68]";
      case "Decision": return "bg-[#EADBB9]";
      default: return "bg-[#5A544A]";
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#5A544A] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#F4EFE6] mb-1">Institutional Timeline</h1>
          <p className="text-sm text-[#A18A68] font-medium">Reconstruct how events evolved into decisions sequentially.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap gap-3">
           {["All", "Events", "Meetings", "Decisions"].map(f => (
             <button 
               key={f} 
               onClick={() => setFilter(f)}
               className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === f ? 'bg-[#DFCEB6] text-[#2C2A28] border-[#83633F]' : 'bg-[#201D19] text-[#A18A68] border-[#5A544A] hover:border-[#83633F] hover:bg-[#34322F]'}`}
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
            className="w-full md:max-w-xs px-4 py-1.5 bg-[#201D19] border border-[#5A544A] rounded-full text-sm text-[#F4EFE6] focus:outline-none focus:border-[#83633F] placeholder-[#8C7A5E]" 
          />
        </div>
      </div>


      <div className="bg-[#2C2A28] p-8 rounded-xl border border-[#5A544A] shadow-sm relative pt-12 pb-12 min-h-[400px]">
        {/* Vertical Line */}
        <div className="absolute left-32 top-12 bottom-12 w-0.5 bg-[#5A544A]"></div>

        {loading ? (
           <div className="p-12 text-center text-[#A18A68]">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EADBB9] mx-auto mb-4"></div>
               Building timeline...
            </div>
        ) : filteredTimeline.length === 0 ? (
           <div className="p-16 text-center">
               <div className="w-16 h-16 bg-[#201D19] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#5A544A]">
                  <Clock size={24} className="text-[#8C7A5E]" />
               </div>
               <h3 className="text-lg font-bold text-[#F4EFE6] mb-1">Timeline empty</h3>
               <p className="text-[#A18A68] text-sm max-w-sm mx-auto">No records found for the selected filter.</p>
            </div>
        ) : (
          <div className="space-y-12">
            {filteredTimeline.map((item, index) => (
              <div key={index} className="flex relative group">
                {/* Date Column */}
                <div className="w-24 flex-shrink-0 text-right pr-6 pt-1">
                  <div className="text-sm font-bold text-[#F4EFE6] leading-tight">
                     {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() : "UNKNOWN"}
                  </div>
                  <div className="text-xl font-light text-[#A18A68]">
                     {item.date ? new Date(item.date).getFullYear() : ""}
                  </div>
                </div>
                
                {/* Dot */}
                <div className="absolute left-32 -ml-2.5 mt-1.5 w-5 h-5 rounded-full border-4 border-[#2C2A28] z-10 shadow-sm bg-[#2C2A28]">
                   <div className={`w-full h-full rounded-full ${getDotColor(item.type)} transition-transform group-hover:scale-125`}></div>
                </div>

                {/* Content Card */}
                <div className="pl-12 flex-1">
                  <div className={`p-5 rounded-xl border transition-shadow shadow-sm cursor-pointer border-[#3D3A35] hover:border-[#83633F] hover:shadow-md bg-[#201D19]`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-[#F4EFE6] group-hover:text-[#DFCEB6] transition-colors">{item.title}</h3>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getColor(item.type)}`}>
                        {getIcon(item.type)}
                        {item.type}
                      </span>
                    </div>
                    {item.type === 'Decision' && (
                       <Link to={`/decisions/${item.id.replace('decision_', '')}/trace`} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#EADBB9] hover:text-[#DFCEB6] transition-colors">
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
