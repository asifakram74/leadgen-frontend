"use client";

import { Sparkles } from "lucide-react";

export default function LeadsHeader() {
  return (
    <div className="relative pt-0 pb-2 text-center space-y-6">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-1000">
        <Sparkles className="w-4 h-4" />
        Next-Gen Extraction Engine
      </div>
      
      <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <span className="text-gradient">Leads Intelligence</span>
        <br />
        <span className="bg-gradient-to-r from-primary via-purple-400 to-rose-400 bg-clip-text text-transparent">Command Center</span>
      </h1>
      
      <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        Deploy deep-crawling extractors to capture high-intent business leads. 
        Engineered for precision, speed, and intelligence.
      </p>
    </div>
  );
}
