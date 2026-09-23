import { Link, useNavigate } from "react-router-dom";
import { BrainCircuit, FileText, Calendar, Users, Network, Search, ArrowRight, Zap, Globe } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import LiquidGlassCluster from "../components/LiquidGlassCluster";
import ParticleDrift from "../components/ParticleDrift";
import { updateProfile, getProfile } from "../services/api";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    getProfile().then(p => {
      if (p && p.name) setUsername(p.name);
    }).catch(console.error);
  }, []);

  const handleStart = async () => {
    if (username.trim()) {
      try {
        await updateProfile({ name: username });
      } catch (e) {
        console.error(e);
      }
    }
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20 relative">
      
      {/* FLOATING NAVBAR (Dark Pill Style) */}
      <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 border border-white/10 rounded-full px-6 py-4 flex items-center justify-between w-[95%] max-w-6xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 pl-2">
          <Globe className="text-white" size={20} />
          <span className="text-lg font-bold tracking-widest text-white">MEMORA</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-xs font-semibold uppercase tracking-widest">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
          <a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-white hidden sm:block transition-colors">Sign Up</button>
          <Link to="/dashboard" className="px-6 py-2 bg-white/10 border border-white/20 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-white/20 transition-colors">
            Login
          </Link>
        </div>
      </nav>

      {/* VIDEO HERO SECTION */}
      <section className="relative pt-40 pb-32 px-8 min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'contrast(1.2) brightness(1.1) saturate(1.2) blur(0px)' }}
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>

        {/* Hero Content */}
        <div className="text-center z-20 mt-16 relative w-full max-w-4xl mx-auto flex flex-col items-center">
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl md:text-8xl lg:text-[120px] font-serif tracking-tight text-white leading-none mb-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          >
            Remember it <span className="italic font-light">all</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md relative mb-16 shadow-2xl"
          >
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username" 
              className="w-full bg-black/40 border border-white/20 rounded-full py-4 pl-6 pr-40 text-white placeholder-gray-400 focus:outline-none focus:border-white/50 backdrop-blur-xl shadow-inner"
            />
            <button onClick={handleStart} className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-md text-sm font-bold">
              Get Started <ArrowRight size={16} className="ml-1" strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>
        
        {/* Bottom Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-12 z-20"
        >
          <button className="px-8 py-3 rounded-full bg-black/60 border border-white/20 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors backdrop-blur-md shadow-2xl">
            Read the manifesto
          </button>
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="features" className="py-24 px-8 bg-[#0a0a0a] relative z-10 border-b border-white/5 overflow-hidden">
        
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen">
          <LiquidGlassCluster background="#0a0a0a" backdrop={{ type: "None" }} speed={20} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-white mb-6">How it works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">From raw documents to an interconnected institutional memory.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute left-8 top-8 bottom-8 w-[2px] bg-gradient-to-b from-white/20 via-white/10 to-transparent z-0"></div>

            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/20 text-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">1</div>
              <div className="pt-2">
                <h3 className="text-2xl font-semibold mb-3">Extract</h3>
                <p className="text-gray-400 leading-relaxed">It reads the document page by page and preserves the page number.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/20 text-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">2</div>
              <div className="pt-2">
                <h3 className="text-2xl font-semibold mb-3">Understand</h3>
                <p className="text-gray-400 leading-relaxed">AI identifies important information such as people, events, meetings, decisions, actions and outcomes.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/20 text-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">3</div>
              <div className="pt-2">
                <h3 className="text-2xl font-semibold mb-3">Evidence</h3>
                <p className="text-gray-400 leading-relaxed">Every extracted piece of information is linked back to the original document, exact page and supporting text.</p>
              </div>
            </div>
            
            {/* Step 5 */}
            <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/20 text-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">5</div>
              <div className="pt-2">
                <h3 className="text-2xl font-semibold mb-3">Remember</h3>
                <p className="text-gray-400 leading-relaxed">All of this is stored in the database, so the information remains available even after the user leaves the page or uploads another document.</p>
              </div>
            </div>

            {/* Step 4 (Spans 2 columns if grid, or just wide) */}
            <div className="flex flex-col md:flex-row gap-6 items-start relative z-10 md:col-span-2 mt-8 md:mt-0">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/20 text-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">4</div>
              <div className="pt-2 w-full">
                <h3 className="text-2xl font-semibold mb-3">Connect</h3>
                <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl">MEMORA then connects information across documents to form a unified graph of knowledge.</p>
                
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-3xl flex flex-col md:flex-row items-center gap-4 shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                   <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-center shadow-lg backdrop-blur-sm z-10 whitespace-nowrap">Hardware Testing Issue</div>
                   <ArrowRight className="rotate-90 md:rotate-0 text-gray-600 shrink-0 z-10" size={18} />
                   <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-center shadow-lg backdrop-blur-sm z-10 whitespace-nowrap">Committee Meeting</div>
                   <ArrowRight className="rotate-90 md:rotate-0 text-gray-600 shrink-0 z-10" size={18} />
                   <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-center shadow-lg backdrop-blur-sm z-10 whitespace-nowrap">People involved</div>
                   <ArrowRight className="rotate-90 md:rotate-0 text-gray-600 shrink-0 z-10" size={18} />
                   <div className="px-5 py-3 bg-white/10 border border-white/30 rounded-xl text-sm font-bold text-center text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-sm z-10 whitespace-nowrap">Deadline Extension Decision</div>
                   <ArrowRight className="rotate-90 md:rotate-0 text-gray-600 shrink-0 z-10" size={18} />
                   <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-center shadow-lg backdrop-blur-sm z-10 whitespace-nowrap">Final Action</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* THE TOOLKIT / INTERFACE (Skeuomorphic Theme) */}
      <section className="pt-24 pb-32 px-8 relative z-10 min-h-screen overflow-hidden" style={{ backgroundColor: "#201D19" }}>
        
        {/* ParticleDrift Background */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none mix-blend-screen">
          <ParticleDrift 
             background="#201D19" 
             baseColor="#DFCEB6" 
             accentColor="#83633F" 
             density={100} 
             speed={20}
             hover={200}
          />
        </div>

        {/* Background Paper Texture / Grid Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-full opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: "linear-gradient(0deg, rgba(223,206,182,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(223,206,182,0.1) 1px, transparent 1px)",
               backgroundSize: "40px 40px"
             }}>
        </div>

        <div className="max-w-5xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-normal tracking-wide mb-6 text-[#F4EFE6]" style={{ fontFamily: "Georgia, serif" }}>Your institutional toolkit</h2>
          <p className="text-sm text-[#C9AD8A] max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
            From scattered documents, through AI extraction, and into connected memory. <br className="hidden md:block" /> MEMORA brings clarity to the messy middle of decision tracking.
          </p>
        </div>

        {/* Tabbed UI Showcase */}
        <div className="max-w-5xl mx-auto px-4 font-sans relative z-10">
          
          {/* Full-width Tabs Container */}
          <div className="w-full bg-[#2C2A28] border border-[#5A544A] shadow-[0_5px_15px_rgba(0,0,0,0.4)] rounded-full py-4 flex justify-center gap-12 md:gap-20 mb-8 relative overflow-hidden">
            <button className="flex items-center gap-2 text-sm font-semibold text-[#2C2A28] bg-[#DFCEB6] px-6 py-1.5 rounded-full shadow-inner relative z-10">
              <Users size={16} /> Ingest
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-[#A18A68] hover:text-[#DFCEB6] transition-colors">
              <Network size={16} /> Extract
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-[#A18A68] hover:text-[#DFCEB6] transition-colors">
              <Globe size={16} /> Connect
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-[#A18A68] hover:text-[#DFCEB6] transition-colors">
              <BrainCircuit size={16} /> Make it real
            </button>
          </div>

          {/* App UI Mockup (Skeuomorphic) */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch pb-16 h-full md:h-[450px]">
            
            {/* Left Sidebar Mock */}
            <div className="w-full md:w-64 bg-[#2C2A28] rounded-3xl border border-[#5A544A] p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#A18A68] mb-2 px-1 uppercase tracking-wider">
                <span>Layers / Entities</span>
                <span>+</span>
              </div>
              
              <div className="bg-[#34322F] p-4 rounded-2xl border border-[#5A544A] flex items-center justify-between group cursor-pointer shadow-inner relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#EADBB9] border border-[#C9AD8A] text-[#2C2A28] flex items-center justify-center shadow-sm"><Users size={14}/></div>
                  <div>
                    <div className="text-sm font-bold text-[#F4EFE6]">People</div>
                    <div className="text-[10px] text-[#A18A68] font-medium">12 Nodes</div>
                  </div>
                </div>
                {/* Mini Graph */}
                <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="opacity-60 relative z-10">
                  <path d="M0 15 Q 10 5, 20 15 T 40 5" stroke="#DFCEB6" strokeWidth="2" fill="none" />
                </svg>
              </div>

              <div className="bg-[#34322F] p-4 rounded-2xl border border-[#5A544A] flex items-center justify-between group cursor-pointer shadow-inner mt-2 relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#EADBB9] border border-[#C9AD8A] text-[#2C2A28] flex items-center justify-center shadow-sm"><Calendar size={14}/></div>
                  <div>
                    <div className="text-sm font-bold text-[#F4EFE6]">Events</div>
                    <div className="text-[10px] text-[#A18A68] font-medium">5 Nodes</div>
                  </div>
                </div>
                {/* Mini Graph */}
                <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="opacity-60 relative z-10">
                  <path d="M0 10 Q 10 15, 20 5 T 40 10" stroke="#DFCEB6" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>

            {/* Center Canvas */}
            <div className="flex-1 rounded-3xl relative overflow-hidden bg-[#2C2A28] border border-[#5A544A] shadow-2xl flex flex-col items-center p-12">
               
               {/* Decorative background grid inside canvas */}
               <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      backgroundImage: "linear-gradient(0deg, #DFCEB6 1px, transparent 1px), linear-gradient(90deg, #DFCEB6 1px, transparent 1px)",
                      backgroundSize: "20px 20px"
                    }}>
               </div>
               
               <div className="absolute top-6 right-6 text-[#A18A68]"><ArrowRight size={18}/></div>
               
               <div className="w-full max-w-sm relative z-10 flex flex-col h-full justify-center">
                 <div className="text-center mb-10">
                   <h3 className="text-2xl font-normal text-[#F4EFE6] mb-2" style={{ fontFamily: "Georgia, serif" }}>Project Deadline Extended</h3>
                   <p className="text-[10px] text-[#A18A68] uppercase tracking-widest font-bold">Decision Traceability Graph</p>
                 </div>
                 
                 <div className="space-y-4 relative">
                   {/* Connecting Line */}
                   <div className="absolute left-[34px] top-10 bottom-10 w-[2px] bg-[#5A544A] z-0"></div>

                   <div className="bg-[#34322F] border border-[#5A544A] p-4 rounded-2xl shadow-lg flex items-center gap-4 relative z-10">
                     <div className="w-14 h-14 bg-[#DFCEB6] text-[#2C2A28] flex items-center justify-center rounded-full border border-[#C9AD8A] shadow-inner">
                       <Zap size={22} className="fill-[#2C2A28]"/>
                     </div>
                     <div>
                       <div className="text-[9px] font-bold text-[#A18A68] uppercase tracking-wider mb-0.5">TRIGGER</div>
                       <div className="text-sm font-bold text-[#F4EFE6]">Hardware Testing Delay</div>
                     </div>
                   </div>
                   
                   <div className="bg-[#34322F] border border-[#5A544A] p-4 rounded-2xl shadow-lg flex items-center gap-4 relative z-10">
                     <div className="w-14 h-14 bg-[#EADBB9] text-[#2C2A28] flex items-center justify-center rounded-full border border-[#C9AD8A] shadow-inner">
                       <FileText size={22}/>
                     </div>
                     <div>
                       <div className="text-[9px] font-bold text-[#A18A68] uppercase tracking-wider mb-0.5">EVIDENCE</div>
                       <div className="text-sm font-bold text-[#F4EFE6]">Project Deadline Extended</div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Right Sidebar Mock */}
            <div className="w-full md:w-72 bg-[#2C2A28] rounded-3xl border border-[#5A544A] p-5 shadow-2xl flex flex-col gap-4">
              <div className="text-[10px] font-bold text-[#A18A68] mb-1 px-1 uppercase tracking-wider">Modify / Ask</div>
              
              <div className="bg-[#EADBB9] p-5 rounded-2xl border border-[#C9AD8A] shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] mb-2 relative overflow-hidden" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}>
                <div className="text-[9px] text-[#8C7A5E] mb-3 font-bold uppercase tracking-wider">Prompt</div>
                <div className="text-sm text-[#38342B] mb-8 font-semibold leading-relaxed">Why was the project deadline extended?</div>
                
                <button className="w-full py-3 rounded-xl text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
                        style={{ backgroundColor: "#2C2A28", color: "#DFCEB6" }}>
                  Generate
                </button>
              </div>

              <div className="text-[10px] font-bold text-[#A18A68] mb-1 mt-2 px-1 uppercase tracking-wider">Actions</div>
              <div className="space-y-1">
                <button className="w-full text-left px-4 py-3 text-xs text-[#DFCEB6] font-medium hover:bg-[#34322F] rounded-xl flex items-center gap-3 transition-colors"><Network size={14}/> View Graph</button>
                <button className="w-full text-left px-4 py-3 text-xs text-[#DFCEB6] font-medium hover:bg-[#34322F] rounded-xl flex items-center gap-3 transition-colors"><FileText size={14}/> Read Source</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] text-gray-600 py-16 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-gray-500" size={20} />
              <span className="text-lg font-bold tracking-tight text-gray-300">MEMORA</span>
            </div>
            <p className="text-sm max-w-sm">Remember what happened. Understand why. Trace every decision.</p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            <a href="#" className="hover:text-gray-300 transition-colors">Features</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Pricing</a>
            <a href="#" className="hover:text-gray-300 transition-colors">About</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
