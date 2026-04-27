import React from "react";
import { History, X } from "lucide-react";
import HistoryTable from "@/components/leads/HistoryTable";

interface VaultSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  handleDownload: (url: string, filename: string) => void;
  setItemToDelete: (id: number) => void;
  handleViewHistory: (task: any) => void;
  isAdmin?: boolean;
  scope?: "mine" | "all";
  setScope?: (scope: "mine" | "all") => void;
  role?: string;
}

export default function VaultSidebar({
  isOpen,
  onClose,
  history,
  handleDownload,
  setItemToDelete,
  handleViewHistory,
  isAdmin,
  scope,
  setScope,
  role
}: VaultSidebarProps) {
  return (
    <div className={`fixed inset-0 z-[9999] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-background/40 backdrop-blur-md transition-opacity duration-700" onClick={onClose}></div>
      <aside className={`absolute right-0 top-0 h-full w-full max-w-[500px] bg-card/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <History className="text-indigo-500 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Extraction Vault</h2>
                <p className="text-[10px] font-bold text-foreground/40 tracking-tighter uppercase">Cloud History Sync</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all active:scale-90"><X /></button>
          </div>

          {/* Admin Tabs */}
          {isAdmin && setScope && role === "super_admin" && (
            <div className="px-8 py-4 bg-white/5 flex gap-2">
              <button 
                onClick={() => setScope("mine")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${scope === "mine" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-foreground/60 hover:bg-white/10'}`}
              >
                Mine
              </button>
              <button 
                onClick={() => setScope("all")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${scope === "all" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-foreground/60 hover:bg-white/10'}`}
              >
                All Users
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <HistoryTable 
              history={history} 
              handleDownload={handleDownload} 
              onDelete={setItemToDelete} 
              onView={handleViewHistory} 
              isOpen={true} 
              onToggle={() => { }} 
              minimal={true} 
              showUser={scope === "all"}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
