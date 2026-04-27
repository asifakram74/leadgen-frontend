import React from "react";
import { History, X, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";

interface FloatingNavProps {
  loading: boolean;
  hasResults: boolean;
  isFilterOpen: boolean;
  setIsFilterOpen: (val: boolean) => void;
  setIsArchiveOpen: (val: boolean) => void;
}

export default function FloatingNav({
  loading,
  hasResults,
  isFilterOpen,
  setIsFilterOpen,
  setIsArchiveOpen
}: FloatingNavProps) {
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <>
      {/* Floating Chips Nav */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] flex flex-col gap-2 items-end">
        {/* Vault Trigger */}
        <button 
          onClick={() => setIsArchiveOpen(true)} 
          className="bg-primary/95 text-primary-foreground py-6 px-3 rounded-l-3xl shadow-2xl hover:bg-primary transition-all group flex flex-col items-center gap-3 border border-white/20 active:scale-95"
        >
          <History className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
          <span className="[writing-mode:vertical-lr] font-black uppercase tracking-widest text-[10px]">Vault</span>
        </button>

        {/* Filter Trigger */}
        <button 
          onClick={() => !loading && hasResults && setIsFilterOpen(!isFilterOpen)} 
          disabled={loading || !hasResults}
          className={`${(loading || !hasResults) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'} ${isFilterOpen ? 'bg-indigo-600' : 'bg-indigo-500/90'} text-white py-6 px-3 rounded-l-3xl shadow-2xl transition-all group flex flex-col items-center gap-3 border border-white/20 active:scale-95`}
        >
          {isFilterOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5 group-hover:rotate-90 transition-transform" />}
          <span className="[writing-mode:vertical-lr] font-black uppercase tracking-widest text-[10px]">{isFilterOpen ? 'Close' : 'Filter'}</span>
        </button>
      </div>

      {/* Floating Scroll Nav */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-[90]">
        <button onClick={scrollToTop} className="w-12 h-12 bg-primary/95 text-primary-foreground rounded-full shadow-xl flex justify-center items-center backdrop-blur-md border border-white/20 hover:-translate-y-1 transition-all"><ChevronUp /></button>
        <button onClick={scrollToBottom} className="w-12 h-12 bg-primary/95 text-primary-foreground rounded-full shadow-xl flex justify-center items-center backdrop-blur-md border border-white/20 hover:translate-y-1 transition-all"><ChevronDown /></button>
      </div>
    </>
  );
}
