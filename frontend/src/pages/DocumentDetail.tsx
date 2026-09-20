import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Calendar, Network, Users, Video, BrainCircuit, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { getDocumentDetail } from '../services/api';

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<number>(1);

  useEffect(() => {
    getDocumentDetail(Number(id))
      .then(setDoc)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={32} className="animate-spin text-blue-600"/>
    </div>
  );

  if (!doc) return <div className="p-8 text-center text-slate-500">Document not found</div>;

  const currentPage = doc.pages?.find((p: any) => p.page_number === activePage) || doc.pages?.[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-[1400px] mx-auto">
      <div className="flex-shrink-0 flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
        <div>
          <Link to="/documents" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-bold mb-3">
            <ArrowLeft size={16}/> Back to Documents
          </Link>
          <h1 className="text-3xl font-bold text-[#0a192f] flex items-center gap-3">
            <FileText className="text-blue-600"/> {doc.filename}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(doc.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100"><CheckCircle2 size={14}/> {doc.status}</span>
            <span>{doc.pages?.length || 0} Pages Processed</span>
          </div>
        </div>
        <a href={http://localhost:8000/documents//file} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors text-sm">
          View Raw PDF
        </a>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* PAGE SELECTOR & CONTENT */}
        <div className="w-2/3 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex-shrink-0 bg-slate-50 border-b border-slate-100 p-2 flex overflow-x-auto gap-2 scrollbar-thin">
            {doc.pages?.map((p: any) => (
              <button 
                key={p.page_number} 
                onClick={() => setActivePage(p.page_number)}
                className={px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0 transition-colors }
              >
                Page {p.page_number}
              </button>
            ))}
          </div>
          <div className="flex-1 p-8 overflow-y-auto font-serif text-slate-700 leading-relaxed bg-[#fbfbfa]">
            {currentPage ? (
              <div className="whitespace-pre-wrap">{currentPage.text}</div>
            ) : (
              <div className="text-center text-slate-400 mt-20">No text extracted for this page.</div>
            )}
          </div>
        </div>

        {/* ENTITIES EXTRACTED FROM THIS PAGE */}
        <div className="w-1/3 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-[#0a192f] text-white flex-shrink-0">
            <h3 className="font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <BrainCircuit size={16}/> Extracted From Page {activePage}
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {!currentPage || !currentPage.extracted_entities || currentPage.extracted_entities.length === 0 ? (
              <div className="text-center text-slate-400 mt-10 text-sm font-medium">
                No structured memory entities extracted from this page.
              </div>
            ) : (
              currentPage.extracted_entities.map((ent: any, i: number) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className={	ext-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded }
                    >
                      {ent.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{(ent.confidence * 100).toFixed(0)}% Conf</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{ent.title}</h4>
                  {ent.snippet && (
                    <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 line-clamp-3">
                      "{ent.snippet}"
                    </div>
                  )}
                  {ent.type === 'decision' && (
                    <Link to={/decisions//trace} className="mt-3 inline-flex text-[11px] font-bold text-blue-600 hover:underline">
                      View Decision DNA ?
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
