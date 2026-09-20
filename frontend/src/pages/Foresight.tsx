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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#5A544A] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#F4EFE6] mb-1 flex items-center gap-3"><Compass className="text-[#DFCEB6]"/> Foresight & Predictions</h1>
          <p className="text-sm text-[#A18A68] font-medium">AI-inferred future events, deadlines, and risks explicitly stated in your documents.</p>
        </div>
      </div>

      <div className="bg-[#2C2A28] border border-[#5A544A] rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-12 text-center text-[#A18A68]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83633F] mx-auto mb-4"></div>
            Analyzing institutional future...
          </div>
        ) : predictions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-[#201D19] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3D3A35]">
              <Compass size={24} className="text-[#8C7A5E]" />
            </div>
            <h3 className="text-lg font-bold text-[#F4EFE6] mb-1">No Future Events Detected</h3>
            <p className="text-[#A18A68] text-sm max-w-sm mx-auto">Process documents to generate evidence-based forecasts.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#3D3A35]">
            {predictions.map((pred: any, idx: number) => (
              <div key={idx} className="p-6 hover:bg-[#34322F] transition-colors flex flex-col md:flex-row gap-6 md:items-start">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3D3A35] border border-[#5A544A] text-[#DFCEB6] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {pred.type === 'UPCOMING_DEADLINE' ? <Clock size={14}/> : pred.type === 'POTENTIAL_RISK' ? <AlertTriangle size={14}/> : <Calendar size={14}/>}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#F4EFE6] text-lg mb-1">{pred.description}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                        <span className="px-2 py-0.5 bg-[#DFCEB6] text-[#2C2A28] rounded uppercase tracking-wider">{pred.type.replace(/_/g, ' ')}</span>
                        <span className="px-2 py-0.5 bg-[#8C7A5E] text-[#2C2A28] rounded uppercase tracking-wider">AI FORECAST / NOT A CONFIRMED EVENT</span>
                        {pred.expected_date && <span className="text-[#EADBB9]">{new Date(pred.expected_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="pl-11">
                    <div className="text-[10px] font-black text-[#8C7A5E] uppercase tracking-widest mb-1">Basis (Why)</div>
                    <div className="text-sm text-[#F4EFE6] bg-[#201D19] p-3 rounded-lg border border-[#3D3A35]">{pred.basis}</div>
                  </div>
                </div>
                <div className="w-full md:w-72 bg-[#201D19] border border-[#5A544A] rounded-xl p-4 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-[#8C7A5E] uppercase tracking-widest mb-1.5">Source Document</div>
                    <div className="text-xs font-bold text-[#F4EFE6] truncate" title={pred.source_document}>{pred.source_document || 'Unknown'}</div>
                    {pred.source_page && <div className="text-[10px] font-bold text-[#A18A68]">Page {pred.source_page}</div>}
                  </div>
                  {pred.evidence_snippet && (
                    <div>
                      <div className="text-[10px] font-black text-[#8C7A5E] uppercase tracking-widest mb-1.5">Extracted Evidence</div>
                      <p className="text-[11px] text-[#A18A68] italic line-clamp-3">"{pred.evidence_snippet}"</p>
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
