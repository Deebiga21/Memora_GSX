import { Search, BrainCircuit, FileText, Calendar, Users, Network, ArrowRight, ShieldCheck, CornerDownRight, Mic, Volume2, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { askMemory, getDashboardStats } from "../services/api";
import { Link } from "react-router-dom";

export default function AskMemory() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEmptyDB, setIsEmptyDB] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    getDashboardStats().then((stats: any) => {
      if (stats.documents === 0 || stats.total_documents === 0 || stats.processed_documents === 0) {
        setIsEmptyDB(true);
      } else if (!stats.total_documents && stats.documents === 0) {
        setIsEmptyDB(true);
      } else if (stats.total_documents === 0) {
         setIsEmptyDB(true);
      }
    }).catch(console.error);
  }, []);

  const [wasSpoken, setWasSpoken] = useState(false);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => {
      setIsListening(true);
      setWasSpoken(true);
    };
    recognition.onresult = (e: any) => {
      setQuery(e.results[0][0].transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const toggleSpeak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!window.speechSynthesis) {
        alert("Voice output is not supported in this browser.");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    
    const currentQuery = query;
    const shouldSpeakResponse = wasSpoken;
    
    setQuery("");
    setLoading(true);
    setWasSpoken(false); // reset for next time
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    
    try {
      // Map messages to history expected by backend
      const history = messages.map(m => ({ role: m.role, content: m.role === 'user' ? m.content : m.answer }));
      const res = await askMemory(currentQuery, history);
      if (res.answer === "I could not find sufficient evidence in the available institutional records.") {
        setMessages(prev => [...prev, { role: "ai", error: res.answer }]);
        if (shouldSpeakResponse) toggleSpeak(res.answer);
      } else {
        setMessages(prev => [...prev, { role: "ai", ...res }]);
        if (shouldSpeakResponse) toggleSpeak(res.answer);
      }
    } catch (err) {
      console.error(err);
      const errMsg = "An error occurred while connecting to the AI memory engine.";
      setMessages(prev => [...prev, { role: "ai", error: errMsg }]);
      if (shouldSpeakResponse) toggleSpeak(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col pb-4 font-sans text-[#F4EFE6]">
      
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 mb-10 px-4">
          <div className="w-16 h-16 bg-[#2C2A28] border border-[#5A544A] rounded-2xl flex items-center justify-center mb-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
             <BrainCircuit size={32} className="text-[#DFCEB6]" />
          </div>
          <h1 className="text-4xl font-bold text-[#F4EFE6] tracking-tight drop-shadow-md">Ask Your Institutional Memory</h1>
          <p className="text-lg text-[#A18A68] font-medium max-w-2xl mx-auto">Ask questions about what happened, why it happened, and trace the exact documents used as evidence.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] bg-[#DFCEB6] text-[#2C2A28] rounded-2xl rounded-tr-sm px-6 py-4 shadow-md text-lg font-medium">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-[90%]">
                    {msg.error ? (
                       <div className="bg-[#34322F] border border-[#3D3A35] rounded-2xl p-6 shadow-xl flex items-center gap-4 text-left">
                          <div className="w-10 h-10 bg-[#201D19] rounded-full flex items-center justify-center text-[#DFCEB6] flex-shrink-0">
                             <Search size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#F4EFE6]">No evidence found</h3>
                            <p className="text-[#A18A68] text-sm">{msg.error}</p>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div className="bg-[#34322F] border border-[#5A544A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-2 h-full bg-[#83633F]"></div>
                             
                             <div className="flex justify-between items-start mb-4">
                               <div className="flex items-center gap-2">
                                  <ShieldCheck size={16} className="text-[#DFCEB6]" />
                                  <span className="text-[11px] font-black text-[#DFCEB6] uppercase tracking-widest">Grounded AI Answer</span>
                                  
                                  <button onClick={() => toggleSpeak(msg.answer)} className="ml-4 p-1 rounded-md hover:bg-[#3D3A35] text-[#8C7A5E] hover:text-[#DFCEB6] transition-colors flex items-center gap-1.5 text-[10px] font-bold">
                                    {isSpeaking ? <><Square size={10}/> Stop</> : <><Volume2 size={12}/> Speak</>}
                                  </button>
                               </div>
                               {msg.confidence && (
                                 <div className="bg-[#2C2A28] text-[#F4EFE6] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#5A544A] shadow-sm">
                                   {(msg.confidence * 100).toFixed(0)}% Confidence
                                 </div>
                               )}
                             </div>
                             
                             <p className="text-lg text-[#F4EFE6] font-semibold leading-relaxed mb-6">
                               "{msg.answer}"
                             </p>
                             
                             {msg.related_decisions?.length > 0 && (
                               <div className="bg-[#201D19] border border-[#3D3A35] rounded-xl p-4 shadow-inner">
                                  <div className="text-[9px] font-black text-[#8C7A5E] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                     <Network size={12}/> Related Decisions
                                  </div>
                                  <div className="space-y-1.5">
                                    {msg.related_decisions.map((d: any, i: number) => (
                                      <Link key={i} to={`/decisions/${d.id}/trace`} className="block text-sm font-bold text-[#DFCEB6] hover:text-[#F4EFE6] transition-colors underline decoration-[#83633F] underline-offset-4">
                                        {d.title}
                                      </Link>
                                    ))}
                                  </div>
                               </div>
                             )}
                          </div>

                          {msg.evidence?.length > 0 && (
                            <div className="space-y-2 pl-4 border-l-2 border-[#83633F]">
                              <h3 className="text-xs font-bold text-[#A18A68] flex items-center gap-1.5"><FileText size={12} /> Supporting Evidence Sources</h3>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {msg.evidence.map((ev: any, i: number) => (
                                  <Link to={`/documents/${ev.document_id}`} key={i} className="min-w-[280px] bg-[#2C2A28] border border-[#5A544A] rounded-xl p-4 shadow-md shrink-0 hover:bg-[#3D3A35] transition-colors block">
                                     <div className="text-[9px] font-black text-[#A18A68] uppercase tracking-widest mb-1.5">
                                        Source {i + 1} • Page {ev.page}
                                     </div>
                                     <div className="text-xs font-bold text-[#F4EFE6] mb-1 truncate">{ev.document}</div>
                                     <div className="text-[10px] text-[#8C7A5E] italic line-clamp-3 leading-relaxed">
                                        "{ev.snippet}"
                                     </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                       </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#34322F] border border-[#5A544A] rounded-2xl rounded-tl-sm px-6 py-4 flex items-center gap-3">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#DFCEB6]"></div>
                   <div className="text-[#A18A68] text-sm font-medium">Synthesizing institutional knowledge...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="px-4 pt-2">
        <form onSubmit={handleAsk} className="relative max-w-4xl mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about the datasets..." 
            className="w-full pl-6 pr-32 py-4 bg-[#2C2A28] border border-[#5A544A] rounded-2xl text-base text-[#F4EFE6] font-medium focus:outline-none focus:border-[#83633F] focus:ring-4 focus:ring-[#83633F]/20 transition-all shadow-inner placeholder:text-[#A18A68]"
          />
          <button 
            type="button"
            onClick={startListening}
            className={`absolute inset-y-2 right-[100px] px-2 rounded-xl flex items-center transition-colors ${isListening ? 'bg-[#3D3A35] text-[#DFCEB6] animate-pulse' : 'bg-transparent text-[#8C7A5E] hover:bg-[#3D3A35] hover:text-[#DFCEB6]'}`}
          >
            <Mic size={18} />
          </button>
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute inset-y-2 right-2 px-5 bg-[#EADBB9] text-[#2C2A28] rounded-xl font-bold text-sm hover:bg-[#DFCEB6] border border-[#83633F] transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
