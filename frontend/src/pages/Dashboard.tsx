import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/api";
import { FileText, Network, Calendar, MoreVertical, ArrowUpRight, Search } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DFCEB6]"></div>
      </div>
    );
  }

  const counts = data?.counts || { documents: 0, people: 0, events: 0, meetings: 0, decisions: 0 };
  const recentDecisions = data?.recent_decisions || [];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto text-[#F4EFE6] font-sans h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-wide mb-1" style={{ fontFamily: "Georgia, serif" }}>Welcome back, Deepika</h1>
          <p className="text-sm text-[#A18A68]">Total memory indexed: {counts.documents + counts.people + counts.events + counts.decisions} nodes</p>
        </div>
        <div className="flex gap-2 bg-[#34322F] border border-[#5A544A] p-1 rounded-full text-xs font-semibold">
           <button className="px-4 py-1.5 rounded-full hover:text-white transition-colors">Week</button>
           <button className="px-4 py-1.5 rounded-full bg-[#DFCEB6] text-[#2C2A28] shadow-sm">Month</button>
           <button className="px-4 py-1.5 rounded-full hover:text-white transition-colors">Year</button>
        </div>
      </div>

      {/* TOP CHART - Knowledge Growth */}
      <div className="w-full h-64 border border-[#5A544A] rounded-2xl p-6 relative overflow-hidden bg-[#2C2A28]">
        <div className="flex justify-between items-start mb-4">
           <div>
             <div className="text-3xl font-serif mb-1">{counts.documents} Documents</div>
             <div className="text-xs text-[#A18A68]">+12.67% this month</div>
           </div>
           <div className="text-sm font-semibold text-[#DFCEB6] border border-[#DFCEB6] px-3 py-1 rounded-full bg-[#DFCEB6]/10">
              {counts.decisions} Decisions
           </div>
        </div>

        {/* Fake Line Chart */}
        <div className="absolute bottom-6 left-6 right-6 h-32 border-b border-[#5A544A]">
           <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
             <polyline points="0,80 20,60 40,90 60,30 80,50 100,20" fill="none" stroke="#DFCEB6" strokeWidth="1.5" />
             <polyline points="0,90 20,80 40,70 60,40 80,60 100,40" fill="none" stroke="#8C7A5E" strokeWidth="1" />
             {/* Data points */}
             <circle cx="60" cy="30" r="2" fill="#DFCEB6" />
             <circle cx="100" cy="20" r="2" fill="#DFCEB6" />
           </svg>
           {/* Tooltip mimic (leather block) */}
           <div className="absolute left-[30%] bottom-0 w-48 h-8 bg-[#83633F] rounded-t-md border-t border-l border-r border-[#A58257] shadow-inner flex items-center justify-center text-xs font-bold text-[#F4EFE6] tracking-widest uppercase"
                style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)" }}>
              Analysis Phase
           </div>
           {/* Bar graph mimic on the right */}
           <div className="absolute right-0 bottom-0 flex gap-1 items-end h-16">
              {[30,40,20,50,60,40,70,80,90,70,60,80,50,40,30,20].map((h, i) => (
                <div key={i} className="w-1.5 bg-[#A18A68] rounded-t-sm" style={{height: `${h}%`}}></div>
              ))}
           </div>
        </div>
      </div>

      {/* BOTTOM ROW - 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[300px]">
        
        {/* CARD 1: Memory Breakdown (Dark) */}
        <div className="border border-[#5A544A] rounded-2xl p-5 flex flex-col bg-[#2C2A28]">
           <div className="flex justify-between items-center mb-6 text-[#A18A68]">
              <div className="flex items-center gap-2 text-sm font-semibold"><Network size={16}/> Breakdown</div>
              <MoreVertical size={16}/>
           </div>
           
           <div className="flex-1 flex items-end justify-between gap-2 relative">
             {/* Background grid lines */}
             <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
                <div className="border-b border-[#5A544A] w-full"></div>
                <div className="border-b border-[#5A544A] w-full"></div>
                <div className="border-b border-[#5A544A] w-full"></div>
                <div className="border-b border-[#5A544A] w-full"></div>
             </div>

             <div className="w-full flex justify-between items-end h-40 z-10 px-2">
                <div className="w-10 bg-transparent border-2 border-[#83633F] rounded-t-md relative flex justify-center transition-all duration-1000" style={{height: `${Math.max(10, (counts.people / Math.max(1, counts.people + counts.events + counts.meetings + counts.decisions)) * 100)}%`}}>
                   <div className="absolute -bottom-6 text-[10px] text-[#A18A68]">Peo</div>
                </div>
                <div className="w-10 bg-transparent border-2 border-[#83633F] rounded-t-md relative flex justify-center transition-all duration-1000" style={{height: `${Math.max(10, (counts.events / Math.max(1, counts.people + counts.events + counts.meetings + counts.decisions)) * 100)}%`}}>
                   <div className="absolute -bottom-6 text-[10px] text-[#A18A68]">Evt</div>
                </div>
                <div className="w-10 bg-transparent border-2 border-[#83633F] rounded-t-md relative flex justify-center transition-all duration-1000" style={{height: `${Math.max(10, (counts.meetings / Math.max(1, counts.people + counts.events + counts.meetings + counts.decisions)) * 100)}%`}}>
                   <div className="absolute -bottom-6 text-[10px] text-[#A18A68]">Mtg</div>
                </div>
                <div className="w-10 bg-transparent border-2 border-[#83633F] rounded-t-md relative flex justify-center transition-all duration-1000" style={{height: `${Math.max(10, (counts.decisions / Math.max(1, counts.people + counts.events + counts.meetings + counts.decisions)) * 100)}%`}}>
                   <div className="absolute -bottom-6 text-[10px] text-[#A18A68]">Dec</div>
                </div>
             </div>
           </div>
        </div>

        {/* CARD 2: Activity Heatmap (Dark) */}
        <div className="border border-[#5A544A] rounded-2xl p-5 flex flex-col bg-[#2C2A28]">
           <div className="flex justify-between items-center mb-6 text-[#A18A68]">
              <div className="flex items-center gap-2 text-sm font-semibold"><Calendar size={16}/> Activity by time</div>
              <ArrowUpRight size={16}/>
           </div>

           <div className="flex-1 flex flex-col justify-center">
             <div className="flex text-[10px] text-[#A18A68] mb-2 pl-6 gap-[18px]">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
             </div>
             
             {['1 pm','2 pm','3 pm','4 pm'].map(time => (
               <div key={time} className="flex items-center gap-2 mb-1.5">
                 <span className="text-[10px] text-[#A18A68] w-6 text-right">{time}</span>
                 <div className="flex gap-1.5">
                   {[1,2,3,4,5,6,7].map(d => (
                     <div key={d} className={`w-6 h-6 rounded-sm ${Math.random() > 0.5 ? 'bg-[#D4C4A8]' : Math.random() > 0.5 ? 'bg-[#998162]' : 'bg-[#50493E]'}`}></div>
                   ))}
                 </div>
               </div>
             ))}
             <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-[#A18A68]">
               Less <div className="w-2 h-2 bg-[#50493E] mx-1"></div><div className="w-2 h-2 bg-[#998162]"></div><div className="w-2 h-2 bg-[#D4C4A8] mr-1"></div> More
             </div>
           </div>
        </div>

        {/* CARD 3: Recent Memory (Light Beige Card) */}
        <div className="rounded-2xl p-5 flex flex-col relative overflow-hidden text-[#38342B] shadow-lg border border-[#D0BF9F]"
             style={{ backgroundColor: "#EADBB9", backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}>
           
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-sm font-bold"><FileText size={16}/> Recent memory</div>
              <button className="w-6 h-6 rounded-full bg-[#DFCEB6] flex items-center justify-center border border-[#C6B395]"><Search size={12}/></button>
           </div>

           <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#C6B395] scrollbar-track-transparent">
              
              {recentDecisions.map((dec: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-[#D8C7A3] bg-[#E3D2AD]/50 hover:bg-[#D8C7A3] transition-colors cursor-pointer shadow-sm">
                   <div className="flex items-center gap-3">
                     <Network size={14} className="text-[#8C7A5E]"/>
                     <span className="text-sm font-semibold truncate w-24">{dec.title}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="px-2 py-0.5 rounded-full bg-[#C6B395] text-[10px] font-bold uppercase tracking-wider text-[#38342B]">Decision</span>
                     <span className="text-xs font-medium text-[#8C7A5E] w-12 text-right">{dec.date ? new Date(dec.date).getDate() : '12'} Aug</span>
                     <MoreVertical size={14} className="text-[#8C7A5E]"/>
                   </div>
                </div>
              ))}
              
              {/* Fake documents to fill space matching the image */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#D8C7A3] bg-[#E3D2AD]/50 hover:bg-[#D8C7A3] transition-colors cursor-pointer shadow-sm">
                 <div className="flex items-center gap-3">
                   <FileText size={14} className="text-[#8C7A5E]"/>
                   <span className="text-sm font-semibold truncate w-24">Strategic_Plan.pdf</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="px-2 py-0.5 rounded-full bg-[#C6B395] text-[10px] font-bold uppercase tracking-wider text-[#38342B]">Document</span>
                   <span className="text-xs font-medium text-[#8C7A5E] w-12 text-right">08 Aug</span>
                   <MoreVertical size={14} className="text-[#8C7A5E]"/>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
