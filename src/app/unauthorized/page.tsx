"use client";

import Link from "next/link";
import { Lock, LogIn, ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Red Alert Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-md w-full premium-glass rounded-[2.5rem] p-12 border-2 border-rose-500/20 text-center space-y-8 shadow-2xl relative">
        <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto">
          <Lock className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black font-heading tracking-tight text-foreground uppercase">Access Restricted</h1>
          <p className="text-sm font-bold text-rose-500/60 uppercase tracking-widest">Clearance Required</p>
        </div>

        <p className="text-sm text-foreground/40 leading-relaxed font-medium">
          You have attempted to enter a high-security intelligence sector without valid authentication credentials. Please identify yourself at the login portal.
        </p>

        <div className="pt-4">
          <Link 
            href="/login"
            className="w-full py-4 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Authenticate Record
          </Link>
        </div>

        <div className="pt-6 border-t border-rose-500/5">
          <div className="flex items-center justify-center gap-2 text-[9px] font-black text-rose-500/30 uppercase tracking-[0.3em]">
            <ShieldX className="w-3 h-3" />
            Security Perimeter Breach Logged
          </div>
        </div>
      </div>
    </main>
  );
}
