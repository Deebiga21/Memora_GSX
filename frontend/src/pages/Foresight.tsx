import { Compass, Calendar, AlertTriangle, CheckCircle2, Clock, ChevronRight, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getForesight } from '../services/api';

export default function Foresight() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getForesight()
      .then(setPredictions)
      .catch(() => setPredictions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0a192f] mb-1 flex items-center gap-3"><Compass className="text-indigo-600"/> Foresight & Predictions</h1>
          <p className="text-sm text-slate-500 font-medium">AI-inferred future events, deadlines, and risks explicitly stated in your documents.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            Analyzing institutional future...
          </div>
        ) : predictions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Compass size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0a192f] mb-1">No Future Events Detected</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Upload documents containing deadlines, planned meetings, or expected actions to see predictions here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {predictions.map((pred: any, idx: number) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-start">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {pred.type === 'UPCOMING_DEADLINE' ? <Clock size={14}/> : pred.type === 'POTENTIAL_RISK' ? <AlertTriangle size={14}/> : <Calendar size={14}/>}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0a192f] text-lg mb-1">{pred.description}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">{pred.type.replace(/_/g, ' ')}</span>
                        {pred.expected_date && <span className="text-indigo-600">{new Date(pred.expected_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="pl-11">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Basis (Why)</div>
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{pred.basis}</div>
                  </div>
                </div>
                <div className="w-full md:w-72 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Source Document</div>
                    <div className="text-xs font-bold text-slate-700 truncate" title={pred.source_document}>{pred.source_document || 'Unknown'}</div>
                    {pred.source_page && <div className="text-[10px] font-bold text-slate-500">Page {pred.source_page}</div>}
                  </div>
                  {pred.evidence_snippet && (
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Extracted Evidence</div>
                      <p className="text-[11px] text-slate-600 italic line-clamp-3">"{pred.evidence_snippet}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
