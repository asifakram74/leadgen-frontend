"use client";

import { Target, ShieldCheck, Download, BarChart3 } from "lucide-react";

interface StatsGridProps {
  stats: { total: number; trustworthy: number; csvUrl?: string; jsonUrl?: string } | null;
  handleDownload: (url: string, filename: string) => void;
  category: string;
  location: string;
  loading?: boolean;
}

export default function StatsGrid({ stats, handleDownload, category, location }: StatsGridProps) {
  if (!stats || stats.total === 0) return null;
  const downloadName = `${category}_in_${location}`.replace(/\s+/g, "_").toLowerCase();

  return (
    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Extraction Intelligence
        </h2>
        
        <div className="flex gap-3">
          {stats.csvUrl && (
            <button
              onClick={() => handleDownload(stats.csvUrl!, `${downloadName}.csv`)}
              className="px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-sm font-bold border border-primary/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
          {stats.jsonUrl && (
            <button
              onClick={() => handleDownload(stats.jsonUrl!, `${downloadName}.json`)}
              className="px-5 py-2.5 bg-muted/40 hover:bg-muted text-foreground rounded-xl text-sm font-bold border border-border transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="premium-glass p-8 rounded-3xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">Total Leads Discovered</p>
            <h3 className="text-5xl font-black text-foreground">{stats.total}</h3>
          </div>
          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl text-primary shadow-xl shadow-primary/10 flex-shrink-0">
             <Target className="w-8 h-8" />
           </div>
        </div>

        <div className="premium-glass p-8 rounded-3xl flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">High-Trust Profiles</p>
            <h3 className="text-5xl font-black text-emerald-400">{stats.trustworthy}</h3>
          </div>
          <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-2xl text-emerald-400 shadow-xl shadow-emerald-500/10 flex-shrink-0">
             <ShieldCheck className="w-8 h-8" />
           </div>
        </div>
      </div>
    </div>
  );
}
