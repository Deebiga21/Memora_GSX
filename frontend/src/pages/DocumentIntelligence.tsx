import { Upload, Search, MoreVertical, ArrowRight, User, MapPin, Hash, FileText, Link2, Share2, Network, BrainCircuit, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getDashboardStats, uploadDocument, processDocument, getExtractedFlow } from "../services/api";

const PIE_DATA = [
  { name: "Research", value: 35, color: "#EADBB9" },
  { name: "Strategy", value: 25, color: "#83633F" },
  { name: "Feedback", value: 26, color: "#C9AD8A" },
  { name: "Meeting", value: 15, color: "#5A544A" }
];

export default function DocumentIntelligence() {
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [counts, setCounts] = useState({ documents: 0, people: 0, events: 0, decisions: 0 });
  const [extractedData, setExtractedData] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(res => {
      if (res && res.counts) setCounts(res.counts);
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
    
    try {
      // Step 1: Upload
      const res = await uploadDocument(file);
      setUploadProgress(40);
      setStatusMessage("AI extracting entities...");
      
      // Step 2: Process (AI extraction)
      await processDocument(res.id);
      setUploadProgress(80);
      setStatusMessage("Building memory graph...");
      
      // Step 3: Fetch extracted flow
      const flow = await getExtractedFlow(res.id);
      setExtractedData(flow);
      setUploadProgress(100);
      setStatusMessage("Complete!");
      
      const stats = await getDashboardStats();
      if (stats && stats.counts) setCounts(stats.counts);
    } catch (err) {
      console.error(err);
      setStatusMessage("Error processing document");
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      if (uploadProgress === 100) {
        setStatusMessage("");
        setUploadProgress(0);
      }
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-[#F4EFE6] font-sans h-full flex flex-col pb-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-normal tracking-wide mb-1" style={{ fontFamily: "Georgia, serif" }}>Welcome to the Extraction Lab, Deepika.</h1>
          <p className="text-sm text-[#A18A68]">Total memory indexed: {counts.documents + counts.people + counts.events + counts.decisions} nodes | Recent surge detected.</p>
        </div>
        <div className="flex gap-2 bg-[#34322F] border border-[#5A544A] p-1 rounded-full text-xs font-semibold">
           <button className="px-4 py-1.5 rounded-full hover:text-white transition-colors">Week</button>
           <button className="px-4 py-1.5 rounded-full bg-[#DFCEB6] text-[#2C2A28] shadow-sm">Month</button>
           <button className="px-4 py-1.5 rounded-full hover:text-white transition-colors">Year</button>
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
               <div className="flex justify-between items-center text-[10px] text-[#A18A68] font-bold mt-1">
                  <span>{statusMessage}</span>
                  <span>{uploadProgress}%</span>
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
                     <span className="text-xs text-[#A18A68] font-semibold">AI Entities Extracted</span>
                     <MoreVertical size={14} className="text-[#5A544A]" />
                  </div>
                  <div className="space-y-2 overflow-y-auto pr-1 scrollbar-thin flex-1">
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
                           <Network size={14} /> Decisions ({extractedData?.flow?.filter((f: any) => f.type === 'Decision').length || 0})
                        </div>
                        {extractedData?.flow?.filter((f: any) => f.type === 'Decision').map((d: any, i: number) => (
                           <div key={`d-${i}`} className="text-[10px] text-[#A18A68] pl-6 truncate">- {d.title}</div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Concept Map Column */}
               <div className="flex-1 border border-[#3D3A35] bg-[#201D19] rounded-xl p-3 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs text-[#A18A68] font-semibold">Concept Map</span>
                     <MoreVertical size={14} className="text-[#5A544A]" />
                  </div>
                  <div className="relative w-full h-28 flex items-center justify-center">
                     {/* Miniature Graph Nodes */}
                     {extractedData?.people?.slice(0, 1).map((p: any, i: number) => (
                        <div key={i} className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#34322F] border border-[#83633F] rounded-full text-[9px] text-[#DFCEB6] whitespace-nowrap z-10 shadow-md">{p.name}</div>
                     ))}
                     {extractedData?.flow?.filter((f: any) => f.type === 'Decision').slice(0, 2).map((d: any, i: number) => (
                        <div key={`d-${i}`} className={`absolute top-12 ${i === 0 ? 'left-4' : 'right-4'} px-2 py-1 bg-[#34322F] border border-[#83633F] rounded-full text-[9px] text-[#DFCEB6] whitespace-nowrap z-10 shadow-md`}>{d.title.substring(0, 15)}</div>
                     ))}
                     
                     {/* Miniature Graph Edges */}
                     <svg className={`absolute inset-0 w-full h-full pointer-events-none ${isProcessing && uploadProgress >= 80 ? 'animate-pulse' : ''}`} style={{ zIndex: 0 }}>
                        <line x1="50%" y1="20%" x2="25%" y2="50%" stroke={isProcessing && uploadProgress >= 80 ? "#DFCEB6" : "#5A544A"} strokeWidth="1" />
                        <line x1="50%" y1="20%" x2="75%" y2="50%" stroke={isProcessing && uploadProgress >= 80 ? "#DFCEB6" : "#5A544A"} strokeWidth="1" />
                        <line x1="25%" y1="50%" x2="50%" y2="80%" stroke={isProcessing && uploadProgress >= 80 ? "#DFCEB6" : "#5A544A"} strokeWidth="1" />
                        <line x1="75%" y1="50%" x2="50%" y2="80%" stroke={isProcessing && uploadProgress >= 80 ? "#DFCEB6" : "#5A544A"} strokeWidth="1" />
                        <line x1="25%" y1="50%" x2="75%" y2="50%" stroke={isProcessing && uploadProgress >= 80 ? "#DFCEB6" : "#5A544A"} strokeWidth="1" strokeDasharray="2 2" />
                     </svg>
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
                        <div className="text-xs font-bold text-[#F4EFE6] truncate w-24">Strategic Plan...</div>
                        <div className="text-[9px] text-[#A18A68] truncate w-24">{activeFile ? activeFile.name : 'Strategic Plan 2026.pdf'}</div>
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
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs bg-[#34322F] px-3 py-2 rounded-lg border border-[#3D3A35]">
                     <div className="flex items-center gap-2 text-[#EADBB9]"><Link2 size={12}/> [Market Analysis Brief]</div>
                     <div className="text-[#DFCEB6] font-mono text-[10px] flex items-center gap-1"><Network size={10} className="text-[#83633F]"/> 85%</div>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-[#34322F] px-3 py-2 rounded-lg border border-[#3D3A35]">
                     <div className="flex items-center gap-2 text-[#EADBB9]"><Link2 size={12}/> [Q3 Board Meeting Summary]</div>
                     <div className="text-[#DFCEB6] font-mono text-[10px] flex items-center gap-1"><Network size={10} className="text-[#83633F]"/> 60%</div>
                  </div>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={PIE_DATA} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                        {PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Fake percentages overlaying the pie */}
                  <div className="absolute top-[20%] right-[10%] text-[10px] text-[#A18A68] font-bold">35%</div>
                  <div className="absolute bottom-[20%] left-[20%] text-[10px] text-[#A18A68] font-bold">26%</div>
                  <div className="absolute top-[40%] left-[10%] text-[10px] text-[#A18A68] font-bold">15%</div>
                  <div className="absolute bottom-[10%] right-[20%] text-[10px] text-[#A18A68] font-bold">25%</div>
               </div>
               <div className="w-1/2 flex flex-col justify-center gap-3 pl-2 border-l border-[#3D3A35]">
                  {PIE_DATA.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-semibold text-[#A18A68]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                      {item.name} - Key ...
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8C7A5E]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3D3A35]"></div>
                      Personal - Key Staff
                  </div>
               </div>
            </div>
         </div>

         {/* CARD 2: Timeline */}
         <div className="border border-[#5A544A] rounded-2xl p-5 flex flex-col bg-[#2C2A28] h-[300px]">
            <div className="flex justify-between items-center mb-6 text-[#A18A68]">
               <div className="flex items-center gap-2 text-sm font-semibold"><Calendar size={16}/> Timeline & Decisions</div>
               <ArrowRight size={16} className="-rotate-45" />
            </div>
            <div className="flex-1 relative">
               
               <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#5A544A] -translate-y-1/2 z-0"></div>
               
               {/* Point 1 */}
               <div className="absolute top-[35%] left-[20%] w-3 h-3 rounded-full bg-[#EADBB9] shadow-[0_0_10px_rgba(234,219,185,0.5)] z-10 -translate-x-1/2"></div>
               <div className="absolute top-[10%] left-[20%] -translate-x-1/2 text-[10px] text-[#A18A68] whitespace-nowrap text-center">
                  Target date: Q4 2026<br/>Projected review: Mar 2027
               </div>

               {/* Point 2 */}
               <div className="absolute top-[48%] left-[50%] w-3 h-3 rounded-full bg-[#DFCEB6] border-4 border-[#2C2A28] shadow-[0_0_10px_rgba(223,206,182,0.8)] z-10 -translate-x-1/2"></div>
               <div className="absolute bottom-[25%] left-[50%] -translate-x-1/2 text-[10px] text-[#A18A68] whitespace-nowrap text-center">
                  Target date: Q4 2026<br/>Projected review: Mar 2027
               </div>

               {/* Point 3 */}
               <div className="absolute top-[48%] left-[75%] w-3 h-3 rounded-full bg-[#83633F] z-10 -translate-x-1/2"></div>
               <div className="absolute top-[30%] left-[75%] -translate-x-1/2 text-[10px] text-[#A18A68] whitespace-nowrap text-center bg-[#34322F] px-2 py-1 rounded border border-[#5A544A]">
                  Projected review: Mar 2027
               </div>

               {/* Key Decisions overlay */}
               <div className="absolute bottom-2 right-2 bg-[#34322F] border border-[#5A544A] p-2.5 rounded-lg shadow-lg w-40 z-20">
                  <div className="text-[10px] font-bold text-[#EADBB9] mb-1">Key Decisions</div>
                  <ul className="text-[9px] text-[#A18A68] space-y-0.5 pl-3 list-disc">
                     <li>Implement multi-model AI</li>
                     <li>Implement ai-model AI</li>
                     <li>Implement multi-model ...</li>
                  </ul>
               </div>

            </div>
         </div>

         {/* CARD 3: Recent Queries & Ask Memory */}
         <div className="rounded-2xl p-5 flex flex-col relative overflow-hidden text-[#38342B] shadow-lg border border-[#3D3A35] bg-[#2C2A28] h-[300px]">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2 text-sm font-bold text-[#A18A68]"><BrainCircuit size={16}/> Recent Queries & Ask Memory</div>
               <button className="w-6 h-6 rounded-full bg-[#34322F] flex items-center justify-center border border-[#5A544A]"><Search size={12} className="text-[#8C7A5E]"/></button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-none pr-1 relative">
               
               <div className="p-3 rounded-xl border border-[#5A544A] bg-[#201D19] shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                     <div className="flex items-center gap-2 text-sm font-semibold text-[#DFCEB6]"><FileText size={14} className="text-[#83633F]"/> What is the target for AI revenue?</div>
                     <span className="text-[10px] text-[#8C7A5E]">08 Aug</span>
                  </div>
                  <div className="text-xs text-[#A18A68] pl-5 mt-1 line-clamp-2 leading-relaxed">
                     Context: "Strategic Plan" -&gt; represents "Strategic Plan" formulation that relies heavily...
                  </div>
               </div>

               <div className="p-3 rounded-xl border border-[#3D3A35] bg-[#201D19] shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                     <div className="flex items-center gap-2 text-sm font-semibold text-[#DFCEB6]"><FileText size={14} className="text-[#83633F]"/> What is the target of Strategic Plan?</div>
                     <span className="text-[10px] text-[#8C7A5E]">15 Nov</span>
                  </div>
                  <div className="text-xs text-[#A18A68] pl-5 mt-1 line-clamp-2 leading-relaxed">
                     Key topics: AI, Competition, head alignment mapping and implementation in a resilient...
                  </div>
               </div>

               {/* Ask Input */}
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C2A28] pt-10 pb-1 px-1">
                  <div className="flex items-center bg-[#201D19] border border-[#83633F] rounded-full p-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                     <input type="text" placeholder="ASK MEMORA about Strategic Plan 2026 or connected docs..." className="flex-1 bg-transparent border-none text-[10px] text-[#F4EFE6] px-3 focus:outline-none placeholder:text-[#8C7A5E]" />
                     <button className="w-7 h-7 rounded-full bg-[#DFCEB6] flex items-center justify-center border border-[#A18A68] hover:bg-[#EADBB9] transition-colors"><ArrowRight size={12} className="text-[#201D19]" /></button>
                  </div>
               </div>

            </div>
         </div>

      </div>
    </div>
  );
}
