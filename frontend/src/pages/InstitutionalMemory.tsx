import { Users, Calendar, Video, Network, Search, Filter, Share2, X } from "lucide-react";
import { useState, useEffect } from "react";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { getPeople, getEvents, getMeetings, getDecisions, getGlobalGraph } from "../services/api";
import { Link } from "react-router-dom";

export default function InstitutionalMemory() {
  const [activeTab, setActiveTab] = useState("graph");
  const [data, setData] = useState<any>({ people: [], events: [], meetings: [], decisions: [], graph: {nodes: [], edges: []} });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      getPeople().catch(() => []),
      getEvents().catch(() => []),
      getMeetings().catch(() => []),
      getDecisions().catch(() => []),
      getGlobalGraph().catch(() => ({nodes: [], edges: []}))
    ]).then(([people, events, meetings, decisions, graph]) => {
      
      // Layout graph nodes roughly in a circle/grid if they don't have positions
      const positionedNodes = graph.nodes.map((n: any, i: number) => {
        const radius = 250;
        const angle = (i / graph.nodes.length) * 2 * Math.PI;
        return {
          id: n.id,
          position: { x: Math.cos(angle) * radius + 300, y: Math.sin(angle) * radius + 300 },
          data: { label: <div className="p-2 w-32 text-center rounded-md border border-[#5A544A] bg-[#2C2A28] shadow-sm text-xs font-bold text-[#F4EFE6]">{n.label} <div className="text-[9px] text-[#A18A68] mt-1 uppercase">{n.type}</div></div> }
        };
      });
      
      const styledEdges = graph.edges.map((e: any) => ({
        ...e,
        animated: true,
        style: { stroke: '#A18A68' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A18A68' }
      }));

      setData({ people, events, meetings, decisions, graph: { nodes: positionedNodes, edges: styledEdges } });
      setLoading(false);
    });
  }, []);

  const tabs = [
    { id: "graph", label: "Knowledge Graph", icon: <Share2 size={16} /> },
    { id: "people", label: "People", icon: <Users size={16} /> },
    { id: "events", label: "Events", icon: <Calendar size={16} /> },
    { id: "meetings", label: "Meetings", icon: <Video size={16} /> },
    { id: "decisions", label: "Decisions", icon: <Network size={16} /> },
  ];
  
  const toggleFilter = (f: string) => {
    if (activeFilters.includes(f)) {
      setActiveFilters(activeFilters.filter(i => i !== f));
    } else {
      setActiveFilters([...activeFilters, f]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#5A544A] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#F4EFE6] mb-1">Institutional Memory</h1>
          <p className="text-sm text-[#A18A68] font-medium">Explore the people, events, meetings, and decisions extracted from your records.</p>
        </div>
      </div>

      <div className="bg-[#2C2A28] border border-[#5A544A] rounded-xl shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-[#5A544A] bg-[#201D19] px-2 pt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-[#83633F] text-[#F4EFE6] bg-[#2C2A28]' 
                  : 'border-transparent text-[#A18A68] hover:text-[#F4EFE6] hover:bg-[#34322F]/50'
              } rounded-t-lg`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-[#DFCEB6] text-[#2C2A28]' : 'bg-[#34322F] text-[#A18A68]'}`}>
                {activeTab === 'graph' ? data.graph.nodes.length : (data[tab.id]?.length || 0)}
              </span>
            </button>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-[#3D3A35] flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A18A68]" size={16} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-10 pr-4 py-2 bg-[#201D19] border border-[#5A544A] rounded-lg text-sm text-[#F4EFE6] focus:outline-none focus:border-[#83633F] focus:ring-1 focus:ring-[#83633F] transition-shadow placeholder-[#A18A68]" />
            </div>
            <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-2 px-4 py-2 border border-[#5A544A] text-[#F4EFE6] rounded-lg text-sm font-medium hover:bg-[#34322F] transition-colors ${showFilter ? 'bg-[#34322F]' : ''}`}>
              <Filter size={16} />
              Filter
            </button>
          </div>
          {showFilter && (
            <div className="flex gap-2 p-2 bg-[#201D19] rounded-lg border border-[#3D3A35]">
              {['Recent', 'High Confidence', 'Needs Review'].map(f => (
                <button 
                  key={f}
                  onClick={() => toggleFilter(f)}
                  className={`px-3 py-1 text-xs rounded-full border ${activeFilters.includes(f) ? 'bg-[#DFCEB6] text-[#2C2A28] border-[#DFCEB6]' : 'bg-[#2C2A28] text-[#A18A68] border-[#5A544A]'}`}>
                  {f} {activeFilters.includes(f) && <X size={10} className="inline ml-1"/>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-[#A18A68]">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83633F] mx-auto mb-4"></div>
               Loading memory records...
            </div>
          ) : activeTab === 'graph' ? (
            <div className="w-full h-[600px] bg-[#201D19] relative">
               {data.graph.nodes.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-[#A18A68]">
                    <Share2 size={32} className="mb-4 text-[#8C7A5E]" />
                    <h3 className="font-bold text-lg mb-1">Knowledge Graph Empty</h3>
                    <p className="text-sm">No connections mapped yet.</p>
                 </div>
               ) : (
                 <ReactFlow nodes={data.graph.nodes} edges={data.graph.edges} fitView>
                    <Background color="#5A544A" gap={16} />
                    <Controls />
                 </ReactFlow>
               )}
            </div>
          ) : data[activeTab].length === 0 ? (
            <div className="p-16 text-center">
               <div className="w-16 h-16 bg-[#34322F] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3D3A35]">
                  {tabs.find(t => t.id === activeTab)?.icon}
               </div>
               <h3 className="text-lg font-bold text-[#F4EFE6] mb-1">No {activeTab} found</h3>
               <p className="text-[#A18A68] text-sm max-w-sm mx-auto">MEMORA hasn't extracted any {activeTab} from your documents yet. Try uploading more records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#201D19]/50 text-[#8C7A5E] font-bold uppercase tracking-wider text-[10px] border-b border-[#3D3A35]">
                  {activeTab === 'people' && (
                    <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Department</th><th className="px-6 py-4">Description</th></tr>
                  )}
                  {activeTab === 'events' && (
                    <tr><th className="px-6 py-4">Event</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Description</th><th className="px-6 py-4">Type</th></tr>
                  )}
                  {activeTab === 'meetings' && (
                    <tr><th className="px-6 py-4">Meeting</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Description</th></tr>
                  )}
                  {activeTab === 'decisions' && (
                    <tr><th className="px-6 py-4">Decision</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Reason</th><th className="px-6 py-4">Confidence</th><th className="px-6 py-4">Action</th></tr>
                  )}
                </thead>
                <tbody className="divide-y divide-[#3D3A35]">
                  {data[activeTab].filter((item: any) => {
                    const q = searchQuery.toLowerCase();
                    if (q) {
                      const text = (item.name || item.title || item.reason || item.description || "").toLowerCase();
                      if (!text.includes(q)) return false;
                    }
                    if (activeFilters.includes('Recent')) {
                      const date = new Date(item.decision_date || item.event_date || item.meeting_date || Date.now());
                      const now = new Date();
                      if ((now.getTime() - date.getTime()) > 30 * 24 * 60 * 60 * 1000) return false;
                    }
                    if (activeFilters.includes('High Confidence') && activeTab === 'decisions') {
                      if ((item.confidence || 1) < 0.9) return false;
                    }
                    if (activeFilters.includes('Needs Review') && activeTab === 'decisions') {
                      if ((item.confidence || 1) >= 0.7) return false;
                    }
                    return true;
                  }).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#34322F] transition-colors cursor-pointer group">
                      
                      {activeTab === 'people' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-[#F4EFE6] group-hover:text-[#DFCEB6]">{item.name}</td>
                          <td className="px-6 py-4 text-[#A18A68]">{item.role || "Role not specified"}</td>
                          <td className="px-6 py-4 text-[#A18A68]">{item.department || "No department mapped"}</td>
                          <td className="px-6 py-4 text-[#A18A68] text-xs">{item.description ? item.description.substring(0, 50) + "..." : "Available in detailed view"}</td>
                        </>
                      )}

                      {activeTab === 'events' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-[#F4EFE6] group-hover:text-[#DFCEB6]">{item.title}</td>
                          <td className="px-6 py-4 text-[#A18A68]">{item.event_date ? new Date(item.event_date).toLocaleDateString() : ""}</td>
                          <td className="px-6 py-4 text-[#A18A68] max-w-xs truncate">{item.description || "Refer to linked document"}</td>
                          <td className="px-6 py-4 text-[#A18A68]">{item.event_type || "General Event"}</td>
                        </>
                      )}

                      {activeTab === 'meetings' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-[#F4EFE6] group-hover:text-[#DFCEB6]">{item.title}</td>
                          <td className="px-6 py-4 text-[#A18A68]">{item.meeting_date ? new Date(item.meeting_date).toLocaleDateString() : ""}</td>
                          <td className="px-6 py-4 text-[#A18A68]">{item.meeting_type || "General Meeting"}</td>
                          <td className="px-6 py-4 text-[#A18A68] max-w-xs truncate">{item.description || "Summary not generated"}</td>
                        </>
                      )}

                      {activeTab === 'decisions' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-[#F4EFE6] group-hover:text-[#DFCEB6]">{item.title}</td>
                          <td className="px-6 py-4 text-[#A18A68]">{item.decision_date ? new Date(item.decision_date).toLocaleDateString() : ""}</td>
                          <td className="px-6 py-4 text-[#A18A68] max-w-xs truncate">{item.reason || "Under analysis"}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-[#34322F] text-[#DFCEB6] font-bold rounded text-xs border border-[#5A544A]">{(item.confidence * 100).toFixed(0)}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <Link to={`/decisions/${item.id}/trace`} className="text-[#EADBB9] font-semibold hover:underline">View DNA</Link>
                          </td>
                        </>
                      )}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
