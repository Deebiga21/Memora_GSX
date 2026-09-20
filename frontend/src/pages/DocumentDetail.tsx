import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Calendar, Network, Users, Video, BrainCircuit, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { getDocumentDetail } from '../services/api';

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<number>(1);
  const [highlightedSnippet, setHighlightedSnippet] = useState<string | null>(null);

  useEffect(() => {
    getDocumentDetail(Number(id))
      .then(setDoc)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const summary = useMemo(() => {
    const s = { people: 0, events: 0, meetings: 0, decisions: 0, evidence: 0 };
    if (!doc?.pages) return s;
    doc.pages.forEach((page: any) => {
      if (page.extracted_entities) {
        page.extracted_entities.forEach((ent: any) => {
          s.evidence++;
          if (ent.type === 'person') s.people++;
          if (ent.type === 'event') s.events++;
          if (ent.type === 'meeting') s.meetings++;
          if (ent.type === 'decision') s.decisions++;
        });
      }
    });
    return s;
  }, [doc]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={32} className="animate-spin text-[#A18A68]"/>
    </div>
  );

  if (!doc) return <div className="p-8 text-center text-[#8C7A5E]">Document not found</div>;

  const currentPage = doc.pages?.find((p: any) => p.page_number === activePage) || doc.pages?.[0];

  const renderText = (text: string) => {
    if (!highlightedSnippet || !text.includes(highlightedSnippet)) {
      return text;
    }
    const parts = text.split(highlightedSnippet);
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <mark className="bg-[#A18A68] text-[#201D19] px-1 rounded font-bold">
                {highlightedSnippet}
              </mark>
            )}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-[1400px] mx-auto">
      <div className="flex-shrink-0 flex items-start justify-between mb-6 pb-6 border-b border-[#5A544A]">
        <div>
          <Link to="/documents" className="text-[#A18A68] hover:text-[#F4EFE6] hover:underline flex items-center gap-1 text-sm font-bold mb-3">
            <ArrowLeft size={16}/> Back to Documents
          </Link>
          <h1 className="text-3xl font-bold text-[#F4EFE6] flex items-center gap-3">
            <FileText className="text-[#A18A68]"/> {doc.filename}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8C7A5E] font-medium">
            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(doc.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1 text-[#F4EFE6] bg-[#34322F] px-2 py-0.5 rounded border border-[#5A544A]"><CheckCircle2 size={14}/> {doc.status}</span>
            <span>{doc.pages?.length || 0} Pages Processed</span>
          </div>
          
          <div className="flex items-center gap-6 mt-4 p-3 bg-[#2C2A28] border border-[#5A544A] rounded-xl inline-flex shadow-sm">
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] text-[#8C7A5E] font-bold uppercase tracking-wider mb-1">People</span>
              <span className="text-lg font-bold text-[#F4EFE6]">{summary.people}</span>
            </div>
            <div className="w-px h-8 bg-[#5A544A]"></div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] text-[#8C7A5E] font-bold uppercase tracking-wider mb-1">Events</span>
              <span className="text-lg font-bold text-[#F4EFE6]">{summary.events}</span>
            </div>
            <div className="w-px h-8 bg-[#5A544A]"></div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] text-[#8C7A5E] font-bold uppercase tracking-wider mb-1">Meetings</span>
              <span className="text-lg font-bold text-[#F4EFE6]">{summary.meetings}</span>
            </div>
            <div className="w-px h-8 bg-[#5A544A]"></div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] text-[#8C7A5E] font-bold uppercase tracking-wider mb-1">Decisions</span>
              <span className="text-lg font-bold text-[#F4EFE6]">{summary.decisions}</span>
            </div>
            <div className="w-px h-8 bg-[#5A544A]"></div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] text-[#8C7A5E] font-bold uppercase tracking-wider mb-1">Evidence</span>
              <span className="text-lg font-bold text-[#DFCEB6]">{summary.evidence}</span>
            </div>
          </div>
        </div>
        <a href={`http://localhost:8000/documents/${doc.id}/file`} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-[#DFCEB6] hover:bg-[#EADBB9] text-[#2C2A28] rounded-lg font-bold shadow-sm transition-colors text-sm">
          View Raw PDF
        </a>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* PAGE SELECTOR & CONTENT */}
        <div className="w-2/3 flex flex-col bg-[#201D19] border border-[#5A544A] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex-shrink-0 bg-[#2C2A28] border-b border-[#3D3A35] p-2 flex overflow-x-auto gap-2 scrollbar-thin">
            {doc.pages?.map((p: any) => (
              <button 
                key={p.page_number} 
                onClick={() => {
                  setActivePage(p.page_number);
                  setHighlightedSnippet(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0 transition-colors ${activePage === p.page_number ? 'bg-[#DFCEB6] text-[#2C2A28] shadow-sm' : 'bg-[#34322F] text-[#F4EFE6] border border-[#5A544A] hover:bg-[#3D3A35]'}`}
              >
                Page {p.page_number}
              </button>
            ))}
          </div>
          <div className="flex-1 p-8 overflow-y-auto font-serif text-[#F4EFE6] leading-relaxed bg-[#201D19]">
            {currentPage ? (
              <div className="whitespace-pre-wrap">{renderText(currentPage.text)}</div>
            ) : (
              <div className="text-center text-[#8C7A5E] mt-20">No text extracted for this page.</div>
            )}
          </div>
        </div>

        {/* ENTITIES EXTRACTED FROM THIS PAGE */}
        <div className="w-1/3 bg-[#2C2A28] border border-[#5A544A] rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-[#201D19] text-[#F4EFE6] flex-shrink-0">
            <h3 className="font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <BrainCircuit size={16}/> Extracted From Page {activePage}
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {!currentPage || !currentPage.extracted_entities || currentPage.extracted_entities.length === 0 ? (
              <div className="text-center text-[#8C7A5E] mt-10 text-sm font-medium">
                No structured memory entities extracted from this page.
              </div>
            ) : (
              currentPage.extracted_entities.map((ent: any, i: number) => (
                <div key={i} className="bg-[#34322F] border border-[#5A544A] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${ent.type === 'decision' ? 'bg-purple-900 text-purple-200' : ent.type === 'meeting' ? 'bg-[#DFCEB6] text-[#2C2A28]' : ent.type === 'person' ? 'bg-emerald-900 text-emerald-200' : 'bg-[#3D3A35] text-[#F4EFE6]'}`}
                    >
                      {ent.type}
                    </span>
                    <span className="text-[10px] font-bold text-[#8C7A5E]">{(ent.confidence * 100).toFixed(0)}% Conf</span>
                  </div>
                  <h4 className="font-bold text-[#F4EFE6] text-sm mb-2">{ent.title}</h4>
                  {ent.snippet && (
                    <button 
                      onClick={() => setHighlightedSnippet(ent.snippet)}
                      className="text-left w-full text-[11px] text-[#A18A68] italic bg-[#201D19] p-2 rounded border border-[#5A544A] hover:border-[#A18A68] hover:text-[#DFCEB6] transition-colors cursor-pointer"
                      title="Click to highlight in text"
                    >
                      <div className="line-clamp-3">"{ent.snippet}"</div>
                    </button>
                  )}
                  {ent.type === 'decision' && (
                    <Link to={`/decisions/${ent.id}/trace`} className="mt-3 inline-flex text-[11px] font-bold text-[#DFCEB6] hover:underline">
                      View Decision DNA →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
