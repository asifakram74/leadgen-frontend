import { History, Download, Clock, Globe, Trash2, ChevronDown, MoreVertical, FileJson, FileSpreadsheet, Eye } from "lucide-react";
import { useState } from "react";

interface HistoryTableProps {
  history: any[];
  handleDownload: (url: string, filename: string) => void;
  onDelete: (id: number) => void;
  onView?: (job: any) => void;
  isOpen: boolean;
  onToggle: () => void;
  minimal?: boolean;
  showUser?: boolean;
}

export default function HistoryTable({ 
  history, 
  handleDownload, 
  onDelete,
  onView,
  isOpen,
  onToggle,
  minimal = false,
  showUser = false
}: HistoryTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  if (history.length === 0) return null;

  if (minimal) {
    return (
      <div className="space-y-4">
        {history.map((job) => (
          <div key={job.id} className="group bg-card/40 border border-white/5 hover:border-primary/30 rounded-[1.5rem] p-5 transition-all hover:bg-card/80 shadow-sm relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                    <Globe className="w-5 h-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground text-sm truncate uppercase tracking-tight max-w-[180px] sm:max-w-xs">
                      {job.category || job.query_string.split(" in ")[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground/60 truncate max-w-[150px]">
                        {job.location || job.query_string.split(" in ")[1] || job.query_string}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground/30" />
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    {showUser && job.user_email && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter truncate max-w-[150px]">
                          {job.user_email}
                        </span>
                      </div>
                    )}
                  </div>
              </div>
              
              <div className="relative">
                 <button 
                    onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                    className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-all"
                 >
                    <MoreVertical className="w-5 h-5" />
                 </button>

                 {openMenuId === job.id && (
                   <div className="absolute right-0 top-12 z-[100] w-48 bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                     <div className="p-1.5 space-y-1">
                        {onView && (
                          <button 
                            onClick={() => { onView(job); setOpenMenuId(null); }}
                            className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          >
                            <Eye className="w-4 h-4" /> View Leads
                          </button>
                        )}
                        <button 
                          onClick={() => { handleDownload(job.csv_url, `${job.query_string.replace(/\s+/g, "_").toLowerCase()}.csv`); setOpenMenuId(null); }}
                          className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        >
                          <FileSpreadsheet className="w-4 h-4" /> Download CSV
                        </button>
                        <button 
                          onClick={() => { handleDownload(job.json_url, `${job.query_string.replace(/\s+/g, "_").toLowerCase()}.json`); setOpenMenuId(null); }}
                          className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-muted-foreground hover:bg-white/5 transition-all"
                        >
                          <FileJson className="w-4 h-4" /> Download JSON
                        </button>
                        <div className="h-[1px] bg-white/5 mx-2 my-1"></div>
                        <button 
                          onClick={() => { onDelete(job.id); setOpenMenuId(null); }}
                          className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Job
                        </button>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="premium-glass rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 overflow-hidden">
      <div 
        className="flex items-center justify-between mb-8 cursor-pointer group/header"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover/header:scale-110 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3">
              Extraction Archive
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
              Historical Intelligence Vault
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
            Sync Active
          </span>
          <div className={`p-2 rounded-xl bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
             <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className={`accordion-grid ${isOpen ? 'accordion-grid-open' : ''}`}>
        <div className="accordion-inner">
          <div className="pt-2 animate-in fade-in duration-500">
            {/* Desktop View: Table */}
            <div className="hidden lg:block overflow-x-auto -mx-2">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="p-4">Target Definition</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Data Matrix Links</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((job: any) => (
                    <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/10">
                            <i className="fa-solid fa-earth-americas text-lg"></i>
                          </div>
                          <span className="font-black text-foreground">{job.query_string}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <i className="fa-regular fa-clock text-muted-foreground/30"></i>
                          {new Date(job.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex justify-end gap-3 transition-all duration-300">
                          <button 
                            onClick={() => handleDownload(job.csv_url, `${job.query_string.replace(/\s+/g, "_").toLowerCase()}_archive.csv`)}
                            className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border border-primary/20 shadow-lg shadow-primary/5 active:scale-95"
                          >
                            <i className="fa-solid fa-file-csv"></i> CSV
                          </button>
                          <button 
                            onClick={() => handleDownload(job.json_url, `${job.query_string.replace(/\s+/g, "_").toLowerCase()}_archive.json`)}
                            className="px-4 py-2 bg-muted/20 hover:bg-foreground text-foreground hover:text-background rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border border-border shadow-lg active:scale-95"
                          >
                            <i className="fa-solid fa-file-code"></i> JSON
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => onDelete(job.id)}
                          className="p-2.5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                          title="Eradicate Extraction"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View: Responsive Cards */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((job: any) => (
                <div key={job.id} className="bg-white/5 border border-gray-300 dark:border-white/10 p-5 rounded-3xl space-y-4 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <i className="fa-solid fa-earth-americas text-lg"></i>
                      </div>
                      <span className="font-black text-foreground text-sm line-clamp-1">{job.query_string}</span>
                    </div>
                    <button 
                      onClick={() => onDelete(job.id)}
                      className="p-2 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium px-1">
                    <i className="fa-regular fa-clock text-muted-foreground/30"></i>
                    {new Date(job.created_at).toLocaleString()}
                  </div>

                  <div className="pt-2 flex gap-2 w-full">
                    <button 
                      onClick={() => handleDownload(job.csv_url, `${job.query_string.replace(/\s+/g, "_").toLowerCase()}_archive.csv`)}
                      className="flex-1 py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-primary/20"
                    >
                      <i className="fa-solid fa-file-csv"></i> CSV
                    </button>
                    <button 
                      onClick={() => handleDownload(job.json_url, `${job.query_string.replace(/\s+/g, "_").toLowerCase()}_archive.json`)}
                      className="flex-1 py-3 bg-muted/20 text-foreground rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-border"
                    >
                      <i className="fa-solid fa-file-code"></i> JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
