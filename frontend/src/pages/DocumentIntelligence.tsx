import { FileText, Upload, Trash2, CheckCircle2, AlertCircle, Loader2, Eye, BrainCircuit } from "lucide-react";
import { useState, useEffect } from "react";
import { getDocuments, uploadDocument, processDocument, deleteDocument } from "../services/api";

export default function DocumentIntelligence() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [processStep, setProcessStep] = useState(0);

  const steps = [
    "Uploading...",
    "Extracting pages...",
    "Understanding content...",
    "Finding people...",
    "Finding events...",
    "Finding meetings...",
    "Reconstructing decisions...",
    "Linking evidence...",
    "Memory created"
  ];

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = () => {
    getDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const res = await uploadDocument(file);
        setDocuments([res, ...documents]);
        handleProcess(res.id);
      } catch (err) {
        console.error(err);
        alert("Upload failed.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleProcess = async (id: number) => {
    setProcessingId(id);
    setProcessStep(1); // Start simulated processing steps
    
    // Simulate processing UI updates
    const interval = setInterval(() => {
       setProcessStep(prev => {
          if (prev >= steps.length - 1) {
             clearInterval(interval);
             return prev;
          }
          return prev + 1;
       });
    }, 1200);

    try {
      await processDocument(id);
      fetchDocs();
    } catch (err) {
      console.error("Processing failed", err);
    } finally {
      setTimeout(() => {
        setProcessingId(null);
        setProcessStep(0);
      }, steps.length * 1200 + 1000);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this document and all extracted memory associated with it?")) {
      try {
        await deleteDocument(id);
        fetchDocs();
      } catch (err) {
        console.error("Deletion failed", err);
        alert("Deletion failed.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0a192f] mb-1">Document Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium">Upload institutional records to extract decisions and map contextual memory.</p>
        </div>
        <div className="flex items-center gap-3 relative">
           <input 
             type="file" 
             id="file-upload" 
             className="hidden" 
             onChange={handleFileUpload} 
             disabled={uploading || processingId !== null} 
           />
           <label 
             htmlFor="file-upload" 
             className={`flex items-center gap-2 px-6 py-2.5 bg-[#4F75FF] text-white rounded-md text-sm font-bold shadow-sm transition-colors cursor-pointer ${uploading || processingId !== null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
           >
             {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
             {uploading ? "Uploading..." : "Upload Document"}
           </label>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {processingId !== null && (
          <div className="bg-blue-50 border-b border-blue-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                 <BrainCircuit size={20} className={processStep < steps.length - 1 ? "animate-pulse" : ""} />
              </div>
              <div>
                <h3 className="font-bold text-[#0a192f] text-sm mb-1">AI Processing Active</h3>
                <div className="text-sm text-blue-700 font-medium">{steps[processStep]}</div>
              </div>
            </div>
            <div className="w-64">
              <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                 <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${(processStep / (steps.length - 1)) * 100}%` }}></div>
              </div>
              <div className="text-right text-xs font-bold text-blue-600">
                {Math.round((processStep / (steps.length - 1)) * 100)}%
              </div>
            </div>
          </div>
        )}

        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
               Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-16 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FileText size={24} className="text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-[#0a192f] mb-1">No records uploaded</h3>
               <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">Start by uploading PDF documents containing institutional decisions, meeting minutes, or reports.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Filename</th>
                    <th className="px-6 py-4">Uploaded</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Entities</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-slate-400" />
                          <span className="font-semibold text-slate-900">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {processingId === doc.id ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded border border-blue-100 text-xs">
                             <Loader2 size={12} className="animate-spin" /> Processing
                          </span>
                        ) : (doc.status === 'processed' || doc.status === 'completed') ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded border border-green-100 text-xs">
                             <CheckCircle2 size={12} /> Processed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded border border-amber-100 text-xs">
                             <AlertCircle size={12} /> Needs Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {(doc.status === 'processed' || doc.status === 'completed') ? "Found" : "-"}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <a href={`http://localhost:8000/documents/${doc.id}/file`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Document">
                             <Eye size={16} />
                           </a>
                           <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
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
