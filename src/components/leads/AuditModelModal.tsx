"use client";

import { useState } from "react";
import { 
  X, Brain, Crown, Sparkles, Loader2, Info
} from "lucide-react";
import ModelSelector from "./ModelSelector";

interface AuditModelModalProps {
  lead: any;
  onClose: () => void;
  onConfirm: (modelId: string) => void;
  isAuditing?: boolean;
}

export default function AuditModelModal({ lead, onClose, onConfirm, isAuditing }: AuditModelModalProps) {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-preview-05-20");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Hub</span>
            </div>
            <h2 className="text-2xl font-black text-foreground leading-tight">Configure AI Audit</h2>
            <p className="text-xs font-bold text-muted-foreground mt-1 truncate max-w-[280px]">Lead: {lead.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Select Brain Engine</label>
            <ModelSelector 
              selectedModel={selectedModel} 
              onSelect={setSelectedModel} 
              disabled={isAuditing}
            />
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-primary/70 leading-relaxed">
              Choosing <span className="text-primary font-black">Gemini 2.5 Flash</span> is recommended — it's the fastest and most capable model available. Switch to <span className="text-primary font-black">Gemini 2.5 Pro</span> for maximum depth.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2">
          <button
            onClick={() => onConfirm(selectedModel)}
            disabled={isAuditing}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synchronizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Launch AI Audit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
