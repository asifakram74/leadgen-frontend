"use client";

import Link from "next/link";
import { MoveLeft, Compass, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-indigo-500/10 flex-1 flex items-center justify-center p-6 bg-background relative overflow-hidden py-20">
      {/* Decorative Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full premium-glass rounded-[2.5rem] p-12 border-2 border-black/20 dark:border-white/20 text-center space-y-8 shadow-2xl relative">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto animate-bounce duration-[3000ms]">
          <Compass className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black font-heading tracking-tight text-foreground uppercase">404 Error</h1>
          <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Coordinate Mismatch Detected</p>
        </div>

        <p className="text-sm text-foreground/40 leading-relaxed font-medium">
          The intelligence record or interface you are looking for does not exist in our current database index. You may have navigated beyond the perimeter.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="w-full py-4 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
          >
            <MoveLeft className="w-4 h-4" />
            Return to Core Console
          </Link>
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-2 text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em]">
            <ShieldAlert className="w-3 h-3" />
            LeadStation Monitoring Active
          </div>
        </div>
      </div>
    </main>
  );
}
