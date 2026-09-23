import { Upload, Search, MoreVertical, ArrowRight, User, MapPin, Hash, FileText, Link2, Share2, Network, BrainCircuit, Calendar } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getDashboardStats, uploadDocument, processDocument, getExtractedFlow, getDocuments, askMemory, getProfile } from "../services/api";



export default function DocumentIntelligence() {
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [counts, setCounts] = useState({ documents: 0, people: 0, events: 0, meetings: 0, decisions: 0, evidence: 0, memory_nodes: 0 });
  const [extractedData, setExtractedData] = useState<any>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("Month");
  const [profile, setProfile] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error);
    getDashboardStats().then(res => {
      if (res && res.counts) setCounts(res.counts);
    }).catch(() => {});
    
    getDocuments().then(res => {
      if (res) setRecentDocs(res.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setActiveFile(file);
      setExtractedData(null);
      startProcessing(file);
    }
  };

  const startProcessing = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(10);
    setStatusMessage("Uploading document...");
    setLogs([]);
    
    try {
      // Step 1: Upload
      const res = await uploadDocument(file);
      setUploadProgress(40);
      setStatusMessage("AI extracting entities...");
      
      setLogs([
        `[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] INFO - Upload successful.`,
        `[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] INFO - Commencing AI text extraction and analysis for [${file.name}]...`
      ]);

      // Step 2: Process (AI extraction)
      await processDocument(res.id);
      setUploadProgress(80);
      setStatusMessage("Building memory graph...");
      
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] INFO - AI Extraction complete. Fetching data flow...`]);

      // Step 3: Fetch extracted flow
      const flow = await getExtractedFlow(res.id);
      setExtractedData(flow);
      setUploadProgress(100);
      setStatusMessage("Complete!");
      
      const stats = await getDashboardStats();
      if (stats && stats.counts) setCounts(stats.counts);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Unknown error";
      setStatusMessage(`PROCESSING FAILED - ${errMsg}`);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ERROR - Stage: Gemini extraction. Reason: ${errMsg}`]);
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      if (uploadProgress === 100) {
        setStatusMessage("");
        setUploadProgress(0);
      }
    }, 4000);
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = { role: "user", content: chatInput, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    
    try {
      const res = await askMemory(userMsg.content, conversationId);
      // Backend returns AskResponse
      // Note: we'd ideally set conversationId if the backend returns it, but for now we'll just keep the session context
      const aiMsg = { 
        role: "assistant", 
        content: res.answer,
        evidence: res.evidence,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-[#F4EFE6] font-sans h-full flex flex-col pb-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-normal tracking-wide mb-1" style={{ fontFamily: "Georgia, serif" }}>Welcome to the Extraction Lab, Deepika.</h1>
          <p className="text-sm text-[#A18A68]">Total memory indexed: {counts.memory_nodes || 0} nodes | Recent surge detected.</p>
        </div>
        <div className="flex gap-2 bg-[#34322F] border border-[#5A544A] p-1 rounded-full text-xs font-semibold">
           <button onClick={() => setTimeFilter("Week")} className={`px-4 py-1.5 rounded-full transition-colors ${timeFilter === 'Week' ? 'bg-[#DFCEB6] text-[#2C2A28] shadow-sm' : 'hover:text-white'}`}>Week</button>
           <button onClick={() => setTimeFilter("Month")} className={`px-4 py-1.5 rounded-full transition-colors ${timeFilter === 'Month' ? 'bg-[#DFCEB6] text-[#2C2A28] shadow-sm' : 'hover:text-white'}`}>Month</button>
           <button onClick={() => setTimeFilter("Year")} className={`px-4 py-1.5 rounded-full transition-colors ${timeFilter === 'Year' ? 'bg-[#DFCEB6] text-[#2C2A28] shadow-sm' : 'hover:text-white'}`}>Year</button>
        </div>
      </div>

      {/* TOP PANELS (WORKFLOW) */}
      <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
         
         {/* PANEL 1: Upload */}
         <div className="border border-[#5A544A] rounded-2xl p-6 bg-[#2C2A28] w-full lg:w-[280px] h-[280px] shadow-[0_0_20px_rgba(223,206,182,0.03)] relative flex flex-col justify-center items-center">
            
            <div className="absolute inset-4 rounded-xl border border-[#A18A68]/30 shadow-[inset_0_0_30px_rgba(223,206,182,0.1)] pointer-events-none"></div>

            <input type="file" id="pdf-upload" className="hidden" onChange={handleFileUpload} accept=".pdf" />
            
            <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center cursor-pointer group z-10 w-full mb-4">
               <div className="w-16 h-16 rounded-xl bg-[#3D3A35] border border-[#83633F] flex items-center justify-center mb-3 shadow-[0_5px_15px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform">
                 <Upload className="text-[#DFCEB6]" size={28} />
               </div>
               <span className="text-sm font-bold text-[#F4EFE6] tracking-wide">Upload PDF</span>
            </label>

            <div className="text-center z-10 w-full px-4">
               <div className="text-[11px] text-[#A18A68] uppercase tracking-widest font-semibold mb-1">Active Project:</div>
               <div className="text-sm font-medium text-[#DFCEB6] truncate bg-[#201D19] px-3 py-1.5 rounded border border-[#3D3A35]">
                 {activeFile ? `[${activeFile.name}]` : "[No active document]"}
               </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-6 left-6 right-6">
               <div className="w-full h-1.5 bg-[#201D19] rounded-full overflow-hidden border border-[#3D3A35]">
                  <div className="h-full bg-[#DFCEB6] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
               </div>
               <div className="flex justify-between items-center text-[10px] text-[#A18A68] font-bold mt-1 gap-2">
                  <span className="truncate" title={statusMessage}>{statusMessage}</span>
                  <span className="shrink-0">{uploadProgress}%</span>
               </div>
            </div>
         </div>

         <div className="text-[#5A544A] hidden lg:block"><ArrowRight strokeWidth={1.5} /></div>

         {/* PANEL 2: EXTRACT */}
         <div className={`border ${isProcessing && uploadProgress >= 40 && uploadProgress < 80 ? 'border-[#DFCEB6] shadow-[0_0_15px_rgba(223,206,182,0.15)] ring-1 ring-[#DFCEB6]' : 'border-[#5A544A] shadow-lg'} rounded-2xl p-6 bg-[#2C2A28] flex-1 h-[280px] flex flex-col w-full transition-all duration-500`}>
            <div className="flex justify-between items-center mb-5">
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#F4EFE6]">UNDERSTAND, EXTRACT, & INDEX</h3>
               <MoreVertical size={16} className="text-[#A18A68]" />
            </div>

            <div className="flex gap-4 h-full">
               {/* Entities Column */}
               <div className="flex-1 border border-[#3D3A35] bg-[#201D19] rounded-xl p-3 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs text-[#A18A68] font-semibold flex items-center gap-2">
                        AI Entities Extracted
                        {!extractedData && isProcessing && uploadProgress >= 40 && (
                           <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#34d399]"></div>
                              active
                           </span>
                        )}
                     </span>
                     <MoreVertical size={14} className="text-[#5A544A]" />
                  </div>

                  <div className="space-y-2 overflow-y-auto pr-1 scrollbar-thin flex-1">
                     {!extractedData && isProcessing && uploadProgress >= 40 ? (
                        <div className="flex flex-col gap-3 mt-1">
                           <div className="text-[#8C7A5E] animate-pulse font-sans italic text-xs pl-1 mb-1">Extracting AI entities...</div>
                           <div className="h-7 bg-[#34322F] rounded border border-[#5A544A] animate-pulse"></div>
                           <div className="h-7 bg-[#34322F] rounded border border-[#5A544A] animate-pulse"></div>
                           <div className="h-7 bg-[#34322F] rounded border border-[#5A544A] animate-pulse"></div>
                           <div className="h-7 bg-[#34322F] rounded border border-[#5A544A] animate-pulse"></div>
                        </div>
                     ) : (
                        <>
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-xs text-[#EADBB9] bg-[#34322F] px-2 py-1.5 rounded border border-[#5A544A]">
                                 <User size={14} /> Persons ({extractedData?.people?.length || 0})
                              </div>
                              {extractedData?.people?.map((p: any, i: number) => (
                                 <div key={`p-${i}`} className="text-[10px] text-[#A18A68] pl-6 truncate">- {p.name}</div>
                              ))}
                           </div>
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-xs text-[#EADBB9] bg-[#34322F] px-2 py-1.5 rounded border border-[#5A544A]">
                                 <Calendar size={14} /> Events ({extractedData?.flow?.filter((f: any) => f.type === 'Event').length || 0})
                              </div>
                              {extractedData?.flow?.filter((f: any) => f.type === 'Event').map((e: any, i: number) => (
                                 <div key={`e-${i}`} className="text-[10px] text-[#A18A68] pl-6 truncate">- {e.title}</div>
                              ))}
                           </div>
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-xs text-[#EADBB9] bg-[#34322F] px-2 py-1.5 rounded border border-[#5A544A]">
                                 <Network size={14} /> Meetings ({extractedData?.flow?.filter((f: any) => f.type === 'Meeting').length || 0})
                              </div>
                              {extractedData?.flow?.filter((f: any) => f.type === 'Meeting').map((m: any, i: number) => (
                                 <div key={`m-${i}`} className="text-[10px] text-[#A18A68] pl-6 truncate">- {m.title}</div>
                              ))}
                           </div>
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-xs text-[#EADBB9] bg-[#34322F] px-2 py-1.5 rounded border border-[#5A544A]">
                                 <Network size={14} /> Decisions ({extractedData?.flow?.filter((f: any) => f.type === 'Decision').length || 0})
                              </div>
                              {extractedData?.flow?.filter((f: any) => f.type === 'Decision').map((d: any, i: number) => (
                                 <div key={`d-${i}`} className="text-[10px] text-[#A18A68] pl-6 truncate">- {d.title}</div>
                              ))}
                           </div>
                        </>
                     )}
                  </div>
               </div>

               {/* Concept Map Column */}
               <div className="flex-1 border border-[#3D3A35] bg-[#201D19] rounded-xl p-3 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs text-[#A18A68] font-semibold">Concept Map</span>
                     <MoreVertical size={14} className="text-[#5A544A]" />
                  </div>
                  <div className="relative w-full h-32 flex items-center justify-center">
                     {!extractedData && isProcessing && uploadProgress >= 40 ? (
                        <div className="absolute inset-0 flex items-center justify-center opacity-80 scale-90">
                           {/* Mockup of a complex concept map */}
                           <svg viewBox="0 0 200 120" className="w-full h-full text-[#A18A68]">
                              <defs>
                                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 6 2, 0 4" fill="#5A544A" />
                                </marker>
                              </defs>
                              <line x1="100" y1="60" x2="60" y2="30" stroke="#5A544A" strokeWidth="0.5" markerEnd="url(#arrowhead)"/>
                              <line x1="100" y1="60" x2="140" y2="30" stroke="#5A544A" strokeWidth="0.5" markerEnd="url(#arrowhead)"/>
                              <line x1="100" y1="60" x2="40" y2="70" stroke="#5A544A" strokeWidth="0.5" markerEnd="url(#arrowhead)"/>
                              <line x1="100" y1="60" x2="160" y2="60" stroke="#5A544A" strokeWidth="0.5" markerEnd="url(#arrowhead)"/>
                              <line x1="100" y1="60" x2="70" y2="100" stroke="#5A544A" strokeWidth="0.5" markerEnd="url(#arrowhead)"/>
                              <line x1="100" y1="60" x2="130" y2="100" stroke="#5A544A" strokeWidth="0.5" markerEnd="url(#arrowhead)"/>
                              <line x1="60" y1="30" x2="40" y2="70" stroke="#5A544A" strokeWidth="0.5" strokeDasharray="1,2" markerEnd="url(#arrowhead)"/>
                              <line x1="140" y1="30" x2="160" y2="60" stroke="#5A544A" strokeWidth="0.5" strokeDasharray="1,2" markerEnd="url(#arrowhead)"/>
                              
                              <circle cx="100" cy="60" r="8" fill="#34322F" stroke="#83633F" strokeWidth="1"/>
                              <text x="100" y="62" fontSize="6" fill="#DFCEB6" textAnchor="middle" dominantBaseline="middle">JD</text>

                              <rect x="45" y="24" width="30" height="12" rx="6" fill="#34322F" stroke="#5A544A" strokeWidth="0.5"/>
                              <text x="60" y="31" fontSize="5" fill="#EADBB9" textAnchor="middle">People</text>

                              <rect x="125" y="24" width="30" height="12" rx="6" fill="#34322F" stroke="#5A544A" strokeWidth="0.5"/>
                              <text x="140" y="31" fontSize="5" fill="#EADBB9" textAnchor="middle">Department</text>

                              <rect x="25" y="64" width="30" height="12" rx="6" fill="#34322F" stroke="#5A544A" strokeWidth="0.5"/>
                              <text x="40" y="71" fontSize="5" fill="#EADBB9" textAnchor="middle">Places</text>

                              <rect x="145" y="54" width="30" height="12" rx="6" fill="#34322F" stroke="#5A544A" strokeWidth="0.5"/>
                              <text x="160" y="61" fontSize="5" fill="#EADBB9" textAnchor="middle">Q3 Project</text>

                              <rect x="55" y="94" width="30" height="12" rx="6" fill="#34322F" stroke="#5A544A" strokeWidth="0.5"/>
                              <text x="70" y="101" fontSize="5" fill="#EADBB9" textAnchor="middle">Q3 Budget</text>

                              <rect x="115" y="94" width="30" height="12" rx="6" fill="#34322F" stroke="#5A544A" strokeWidth="0.5"/>
                              <text x="130" y="101" fontSize="5" fill="#EADBB9" textAnchor="middle">Concept</text>

                              <text x="80" y="42" fontSize="4" fill="#8C7A5E" textAnchor="middle" transform="rotate(-36 80 42)">allocates</text>
                              <text x="120" y="42" fontSize="4" fill="#8C7A5E" textAnchor="middle" transform="rotate(36 120 42)">processes</text>
                           </svg>
                        </div>
                     ) : !extractedData?.relationships || extractedData.relationships.length === 0 ? (
                        <div className="text-[10px] text-[#5A544A] text-center w-full px-4">
                          No concept map available yet. Upload and process a document.
                        </div>
                     ) : (
                        <>
                           {extractedData.relationships.slice(0, 3).map((r: any, i: number) => (
                              <div key={i} className={`absolute ${i === 0 ? 'top-1 left-4' : i === 1 ? 'top-10 right-2' : 'bottom-2 left-1/2 -translate-x-1/2'} px-2 py-1 bg-[#34322F] border border-[#83633F] rounded-full text-[9px] text-[#DFCEB6] whitespace-nowrap z-10 shadow-md`}>
                                 {r.source.split('_')[0]} → {r.target.split('_')[0]}
                              </div>
                           ))}
                           <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                              <line x1="20%" y1="20%" x2="80%" y2="50%" stroke="#5A544A" strokeWidth="1" />
                              <line x1="80%" y1="50%" x2="50%" y2="80%" stroke="#5A544A" strokeWidth="1" />
                           </svg>
                        </>
                     )}
                  </div>
               </div>

               {/* Data Structure Column */}
               <div className="flex-1 border border-[#3D3A35] bg-[#201D19] rounded-xl p-3 overflow-y-auto scrollbar-thin">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs text-[#A18A68] font-semibold">Data Structure</span>
                     <MoreVertical size={14} className="text-[#5A544A]" />
                  </div>
                  <div className="text-[10px] text-[#EADBB9] font-mono leading-relaxed pl-1">
                     <div className="flex items-center gap-1.5 mb-1"><div className="w-1.5 h-1.5 rounded-sm bg-[#A18A68]"></div> {activeFile ? activeFile.name : 'No Document'}</div>
                     
                     {!extractedData && isProcessing && uploadProgress >= 40 ? (
                         <div className="pl-3 border-l border-[#5A544A] ml-1 flex flex-col gap-2 mt-1 py-1">
                             <div className="text-[#8C7A5E] animate-pulse font-sans italic">Extracting entities...</div>
                             <div className="w-16 h-1.5 bg-[#3D3A35] rounded animate-pulse mt-1"></div>
                             <div className="w-24 h-1.5 bg-[#3D3A35] rounded animate-pulse"></div>
                             <div className="w-20 h-1.5 bg-[#3D3A35] rounded animate-pulse"></div>
                         </div>
                     ) : !extractedData ? (
                         <div className="pl-3 border-l border-[#5A544A] ml-1 flex flex-col gap-1.5 mt-1">
                             <div className="text-[#5A544A]">Awaiting extraction...</div>
                         </div>
                     ) : (
                         <div className="pl-3 border-l border-[#5A544A] ml-1 flex flex-col gap-1.5 mt-1">
                            {extractedData.flow.map((item: any, i: number) => (
                               <div key={i} className="flex items-center gap-1.5"><div className="w-3 h-px bg-[#5A544A]"></div> <FileText size={10} className="text-[#83633F]"/> {item.title}</div>
                            ))}
                         </div>
                     )}
                  </div>
               </div>

               {/* Live Processing Log Overlay */}
               {!extractedData && isProcessing && uploadProgress >= 40 && (
                  <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] bg-[#1E1C19] border border-[#83633F] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(223,206,182,0.1)] p-4 z-50 overflow-hidden flex flex-col" style={{height: '200px'}}>
                     <h4 className="text-[10px] font-bold text-[#EADBB9] tracking-widest uppercase mb-2">Live Processing Log</h4>
                     <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin flex flex-col font-mono text-[10px] text-[#D4C4A8] gap-1 leading-tight">
                        {logs.map((log, i) => (
                           <div key={i} className="animate-in fade-in slide-in-from-bottom-1">{log}</div>
                        ))}
                        {logs.length > 0 && <div className="h-4"></div>}
                     </div>
                  </div>
               )}
            </div>
         </div>

         <div className="text-[#5A544A] hidden lg:block"><ArrowRight strokeWidth={1.5} /></div>

         {/* PANEL 3: Build & Connect */}
         <div className={`border ${isProcessing && uploadProgress >= 80 ? 'border-[#DFCEB6] shadow-[0_0_15px_rgba(223,206,182,0.15)] ring-1 ring-[#DFCEB6]' : 'border-[#5A544A] shadow-lg'} rounded-2xl p-6 bg-[#2C2A28] w-full lg:w-[320px] h-[280px] flex flex-col justify-between transition-all duration-500`}>
            <div>
               <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#F4EFE6]">Build & Connect</h3>
                  <MoreVertical size={16} className="text-[#A18A68]" />
               </div>
               <div className="bg-[#201D19] border border-[#3D3A35] rounded-xl p-3 flex justify-between items-center mb-5 shadow-inner">
                  <div className="flex items-center gap-2">
                     <FileText size={16} className="text-[#8C7A5E]"/>
                     <div>
                        <div className="text-xs font-bold text-[#F4EFE6] truncate w-24">{activeFile ? activeFile.name.substring(0, 15) + "..." : 'No Document'}</div>
                        <div className="text-[9px] text-[#A18A68] truncate w-24">{activeFile ? activeFile.name : 'Waiting for upload'}</div>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <button className="bg-[#DFCEB6] text-[#2C2A28] px-3 py-1 rounded-full text-[10px] font-bold hover:bg-[#EADBB9] transition-colors shadow-sm">Save to Memory</button>
                     {isProcessing && <div className="text-[9px] text-[#A18A68] mt-1 mr-1">Saving... {uploadProgress}%</div>}
                  </div>
               </div>

               <div className="flex justify-between text-[10px] uppercase font-bold text-[#8C7A5E] mb-2 px-1">
                  <span>Connect</span>
                  <span>Strength</span>
               </div>
               <div className="space-y-2 overflow-y-auto">
                  {recentDocs.length === 0 ? (
                     <div className="text-[10px] text-[#5A544A] text-center w-full px-4 mt-2">
                       No documents uploaded yet.
                     </div>
                  ) : (
                     recentDocs.map((doc, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-[#34322F] px-3 py-2 rounded-lg border border-[#3D3A35]">
                           <div className="flex items-center gap-2 text-[#EADBB9]"><Link2 size={12}/> [{doc.filename.length > 20 ? doc.filename.substring(0, 20) + '...' : doc.filename}]</div>
                           <div className="text-[#DFCEB6] font-mono text-[10px] flex items-center gap-1">
                              <span className={doc.status === 'processed' ? "text-green-500" : "text-yellow-500"}>{doc.status === 'processed' ? 'Processed ✓' : 'Processing...'}</span>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="text-[#5A544A] self-center my-1"><ArrowRight strokeWidth={1.5} className="rotate-90" /></div>

      {/* BOTTOM CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
         
         {/* CARD 1: Pie Chart */}
         <div className="border border-[#5A544A] rounded-2xl p-5 flex flex-col bg-[#2C2A28] h-[300px]">
            <div className="flex justify-between items-center mb-4 text-[#A18A68]">
               <div className="flex items-center gap-2 text-sm font-semibold"><Share2 size={16}/> Memory Type Distribution</div>
               <MoreVertical size={16}/>
            </div>
            <div className="flex-1 flex items-center justify-between">
               <div className="w-1/2 h-full relative -left-4">
                  {counts.memory_nodes === 0 ? (
                    <div className="text-[10px] text-[#A18A68] text-center mt-10">No memory extracted yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={[
                              { name: "People", value: counts.people, color: "#EADBB9" },
                              { name: "Events", value: counts.events, color: "#D4C4A8" },
                              { name: "Meetings", value: counts.meetings, color: "#998162" },
                              { name: "Decisions", value: counts.decisions, color: "#5A544A" }
                            ].filter(d => d.value > 0)} 
                            innerRadius={40} 
                            outerRadius={60} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                             {[
                              { name: "People", value: counts.people, color: "#EADBB9" },
                              { name: "Events", value: counts.events, color: "#D4C4A8" },
                              { name: "Meetings", value: counts.meetings, color: "#998162" },
                              { name: "Decisions", value: counts.decisions, color: "#5A544A" }
                            ].filter(d => d.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                  )}
               </div>
               <div className="w-1/2 flex flex-col justify-center gap-3 pl-2 border-l border-[#3D3A35]">
                  {[
                    { name: "People", value: counts.people, color: "#EADBB9" },
                    { name: "Events", value: counts.events, color: "#D4C4A8" },
                    { name: "Meetings", value: counts.meetings, color: "#998162" },
                    { name: "Decisions", value: counts.decisions, color: "#5A544A" }
                  ].filter(d => d.value > 0).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-semibold text-[#A18A68]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                      {item.name} ({item.value})
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* CARD 2: Timeline */}
         <div className="border border-[#5A544A] rounded-2xl p-5 flex flex-col bg-[#2C2A28] h-[300px]">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-2 text-sm font-bold text-[#A18A68]"><Calendar size={16}/> Timeline & Decisions</div>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
               {!extractedData?.flow || extractedData.flow.length === 0 ? (
                  <div className="text-[10px] text-[#5A544A] text-center w-full px-4 mt-2">
                    No timeline events extracted yet.
                  </div>
               ) : (
                  extractedData.flow.map((f: any, i: number) => (
                    <div key={`flow-${i}`} className="relative pl-6 border-l border-[#5A544A]">
                       <div className="absolute w-2.5 h-2.5 rounded-full bg-[#DFCEB6] border-2 border-[#2C2A28] -left-[5px] top-1"></div>
                       <div className="text-xs text-[#A18A68] mb-0.5">{f.date ? new Date(f.date).toLocaleDateString() : 'Unknown Date'}</div>
                       <div className="text-sm font-semibold text-[#F4EFE6]">{f.title}</div>
                       <div className="text-[11px] text-[#EADBB9]/80 mt-1">{f.description}</div>
                       {f.action && <div className="text-[10px] text-[#DFCEB6] mt-1 bg-[#34322F] inline-block px-2 py-0.5 rounded border border-[#5A544A]">Action: {f.action}</div>}
                    </div>
                  ))
               )}
            </div>
         </div>

         {/* CARD 3: Recent Queries & Ask Memory */}
         <div className="rounded-2xl p-5 flex flex-col relative overflow-hidden text-[#38342B] shadow-lg border border-[#3D3A35] bg-[#2C2A28] h-[300px]">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2 text-sm font-bold text-[#A18A68]"><BrainCircuit size={16}/> Recent Queries & Ask Memory</div>
               <button className="w-6 h-6 rounded-full bg-[#34322F] flex items-center justify-center border border-[#5A544A]"><Search size={12} className="text-[#8C7A5E]"/></button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-none pr-1 relative pb-12">
               <div className="space-y-4 mb-4">
                 {chatHistory.length === 0 ? (
                   <div className="text-[10px] text-[#5A544A] text-center w-full px-4 mt-2">
                     Ask a question about the extracted memory.
                   </div>
                 ) : (
                   chatHistory.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className="text-[10px] text-[#A18A68] mb-1">{msg.role === 'user' ? (profile?.name || 'You') : 'MEMORA'}</div>
                        <div className={`text-xs p-2 rounded-xl border ${msg.role === 'user' ? 'bg-[#34322F] border-[#5A544A] text-[#EADBB9]' : 'bg-[#EADBB9] text-[#2C2A28] border-[#D0BF9F]'}`}>
                           {msg.content}
                           {msg.evidence && msg.evidence.length > 0 && (
                             <div className="mt-2 pt-2 border-t border-[#C6B395] text-[10px] font-mono">
                               Sources: {msg.evidence.map((e: any) => e.document).join(', ')}
                             </div>
                           )}
                        </div>
                     </div>
                   ))
                 )}
                 <div ref={chatEndRef} />
               </div>
            </div>
            
            <form onSubmit={handleAskSubmit} className="absolute bottom-3 left-5 right-5 bg-[#2C2A28] pt-2">
               <div className="relative">
                  <input 
                     type="text" 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     placeholder="Ask about this memory..." 
                     className="w-full bg-[#34322F] border border-[#5A544A] rounded-full py-2.5 pl-4 pr-10 text-xs text-[#F4EFE6] focus:outline-none focus:border-[#DFCEB6] transition-colors placeholder:text-[#5A544A]"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#DFCEB6] flex items-center justify-center border border-[#C6B395]">
                     <ArrowRight size={12} className="text-[#2C2A28]"/>
                  </button>
               </div>
            </form>
         </div>

      </div>
    </div>
  );
}
