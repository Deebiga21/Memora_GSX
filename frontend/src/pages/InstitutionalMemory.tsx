import { Users, Calendar, Video, Network, Search, Filter, Share2 } from "lucide-react";
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
          data: { label: <div className="p-2 w-32 text-center rounded-md border border-slate-300 bg-white shadow-sm text-xs font-bold text-slate-800">{n.label} <div className="text-[9px] text-slate-400 mt-1 uppercase">{n.type}</div></div> }
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0a192f] mb-1">Institutional Memory</h1>
          <p className="text-sm text-slate-500 font-medium">Explore the people, events, meetings, and decisions extracted from your records.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-700 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              } rounded-t-lg`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                {data[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
               Loading memory records...
            </div>
          ) : activeTab === 'graph' ? (
            <div className="w-full h-[600px] bg-slate-50 relative">
               {data.graph.nodes.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Share2 size={32} className="mb-4 text-slate-400" />
                    <h3 className="font-bold text-lg mb-1">Knowledge Graph Empty</h3>
                    <p className="text-sm">No connections mapped yet.</p>
                 </div>
               ) : (
                 <ReactFlow nodes={data.graph.nodes} edges={data.graph.edges} fitView>
                    <Background color="#ccc" gap={16} />
                    <Controls />
                 </ReactFlow>
               )}
            </div>
          ) : data[activeTab].length === 0 ? (
            <div className="p-16 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  {tabs.find(t => t.id === activeTab)?.icon}
               </div>
               <h3 className="text-lg font-bold text-[#0a192f] mb-1">No {activeTab} found</h3>
               <p className="text-slate-500 text-sm max-w-sm mx-auto">MEMORA hasn't extracted any {activeTab} from your documents yet. Try uploading more records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
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
                <tbody className="divide-y divide-slate-100">
                  {data[activeTab].filter((item: any) => {
                    const q = searchQuery.toLowerCase();
                    if (!q) return true;
                    const text = (item.name || item.title || item.reason || item.description || "").toLowerCase();
                    return text.includes(q);
                  }).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                      
                      {activeTab === 'people' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-600">{item.name}</td>
                          <td className="px-6 py-4 text-slate-600">{item.role || "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{item.department || "-"}</td>
                          <td className="px-6 py-4 text-slate-600 text-xs">{item.description ? item.description.substring(0, 50) + "..." : "-"}</td>
                        </>
                      )}

                      {activeTab === 'events' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-600">{item.title}</td>
                          <td className="px-6 py-4 text-slate-600">{item.event_date ? new Date(item.event_date).toLocaleDateString() : "-"}</td>
                          <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{item.description || "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{item.event_type || "-"}</td>
                        </>
                      )}

                      {activeTab === 'meetings' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-600">{item.title}</td>
                          <td className="px-6 py-4 text-slate-600">{item.meeting_date ? new Date(item.meeting_date).toLocaleDateString() : "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{item.meeting_type || "-"}</td>
                          <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{item.description || "-"}</td>
                        </>
                      )}

                      {activeTab === 'decisions' && (
                        <>
                          <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-600">{item.title}</td>
                          <td className="px-6 py-4 text-slate-600">{item.decision_date ? new Date(item.decision_date).toLocaleDateString() : "-"}</td>
                          <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{item.reason || "-"}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-50 text-green-700 font-bold rounded text-xs border border-green-100">{(item.confidence * 100).toFixed(0)}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <Link to={`/decisions/${item.id}/trace`} className="text-blue-600 font-semibold hover:underline">View DNA</Link>
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
