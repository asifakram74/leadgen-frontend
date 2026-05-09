import React from "react";
import { Search, Globe, CheckSquare, XSquare, Sparkles, Activity, CheckCircle2, AlertTriangle, XOctagon, Clock, Loader2, Filter, RotateCcw } from "lucide-react";
import PremiumDropdown from "@/components/ui/PremiumDropdown";

interface FilterActionBarProps {
  isFilterOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterWebsite: "all" | "yes" | "no" | "generated";
  setFilterWebsite: (val: "all" | "yes" | "no" | "generated") => void;
  filterAudit: string;
  setFilterAudit: (val: string) => void;
  onAuditAll: () => void;
  handleBulkBuild: () => void;
  isBulkAuditing: boolean;
  isBulkBuilding: boolean;
  toAuditCount: number;
  toBuildCount: number;
  bulkProgress: number;
  filteredCount: number;
}

export default function FilterActionBar({
  isFilterOpen,
  searchQuery,
  setSearchQuery,
  filterWebsite,
  setFilterWebsite,
  filterAudit,
  setFilterAudit,
  onAuditAll,
  handleBulkBuild,
  isBulkAuditing,
  isBulkBuilding,
  toAuditCount,
  toBuildCount,
  bulkProgress,
  filteredCount
}: FilterActionBarProps) {
  const isFiltering = searchQuery !== "" || filterWebsite !== "all" || filterAudit !== "all";

  return (
    <div className={`mt-12 relative z-30 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isFilterOpen ? 'max-h-[1000px] opacity-100 mb-8 overflow-visible' : 'max-h-0 opacity-0 mb-0 overflow-hidden'}`}>
      <div className="premium-glass rounded-[2.5rem] p-5 border border-white/10 shadow-2xl space-y-5">
        
        {/* Title Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
              Filtered Matrix
              {isFiltering && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold animate-in zoom-in duration-200">
                  {filteredCount}
                </span>
              )}
            </h3>
          </div>
          {isFiltering && (
            <button 
              onClick={() => {
                setSearchQuery("");
                setFilterWebsite("all");
                setFilterAudit("all");
              }}
              className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-foreground/50 hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-foreground/5 active:scale-95 animate-in fade-in duration-300"
              title="Reset Filters"
            >
              <RotateCcw className="w-3 h-3" />
              RESET
            </button>
          )}
        </div>

        {/* Smart Audit Alert */}
        {!isBulkAuditing && toAuditCount > 0 && (
          <div className="mx-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500/80">Intelligence Gap Detected</p>
                <p className="text-[9px] font-bold text-foreground/50">{toAuditCount} leads in this view are missing complete audits or had errors.</p>
              </div>
            </div>
            <button 
              onClick={onAuditAll}
              className="px-4 py-2 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-colors shadow-sm active:scale-95"
            >
              Resolve All Now
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50 group-hover:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search within matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-foreground/10 px-14 py-4 rounded-2xl outline-none text-foreground placeholder:text-foreground/40 transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-sm"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <PremiumDropdown
              value={filterWebsite}
              onChange={(val) => setFilterWebsite(val as any)}
              colorScheme="indigo"
              options={[
                { label: <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> All Assets</div>, value: "all" },
                { label: <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-500" /> With Website</div>, value: "yes" },
                { label: <div className="flex items-center gap-2"><XSquare className="w-4 h-4 text-rose-500" /> No Website</div>, value: "no" },
                { label: <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" /> AI Generated</div>, value: "generated" },
              ]}
            />
            <PremiumDropdown
              value={filterAudit}
              onChange={setFilterAudit}
              colorScheme="rose"
              options={[
                { label: <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> All Statuses</div>, value: "all" },
                { label: <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Healthy</div>, value: "healthy" },
                { label: <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Issues</div>, value: "issues" },
                { label: <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> Unreachable</div>, value: "unreachable" },
                { label: <div className="flex items-center gap-2"><XOctagon className="w-4 h-4 text-rose-500" /> Error</div>, value: "error" },
                { label: <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-500" /> Pending</div>, value: "pending" },
              ]}
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onAuditAll}
              disabled={isBulkAuditing || isBulkBuilding || toAuditCount === 0}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              {isBulkAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isBulkAuditing ? 'Auditing...' : `Audit All ${toAuditCount > 0 ? `(${toAuditCount})` : ''}`}
            </button>
            <button
              onClick={handleBulkBuild}
              disabled={isBulkAuditing || isBulkBuilding || toBuildCount === 0}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              {isBulkBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {isBulkBuilding ? 'Building...' : `Build All ${toBuildCount > 0 ? `(${toBuildCount})` : ''}`}
            </button>
          </div>
        </div>

        {/* Bulk Progress Bar */}
        {(isBulkAuditing || isBulkBuilding) && (
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                Executing Bulk Intelligence Sequence...
              </span>
              <span className="text-xs font-black text-foreground">{bulkProgress}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 ${isBulkAuditing ? 'bg-indigo-500' : 'bg-rose-500'}`}
                style={{ width: `${bulkProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
