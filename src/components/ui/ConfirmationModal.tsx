"use client";

import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger"
}: ConfirmationModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colorMap = {
    danger: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-indigo-500"
  };

  const borderMap = {
    danger: "border-rose-500/20 hover:border-rose-500/50",
    warning: "border-amber-500/20 hover:border-amber-500/50",
    info: "border-indigo-500/20 hover:border-indigo-500/50"
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-700 ease-out"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="bg-card/90 backdrop-blur-3xl border border-white/10 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <div className={`w-full h-1.5 ${colorMap[variant]} opacity-70`}></div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 ${colorMap[variant]}/10 rounded-2xl flex items-center justify-center`}>
              <AlertTriangle className={`w-7 h-7 ${variant === 'danger' ? 'text-rose-400' : variant === 'warning' ? 'text-amber-400' : 'text-indigo-400'}`} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-foreground/20 hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-3 mb-10">
            <h3 className="text-2xl font-black text-foreground tracking-tight">{title}</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-foreground font-bold transition-all border border-white/5 active:scale-95 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-6 py-4 rounded-2xl ${colorMap[variant]} text-white font-black shadow-lg shadow-${variant === 'danger' ? 'rose' : variant === 'warning' ? 'amber' : 'indigo'}-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
