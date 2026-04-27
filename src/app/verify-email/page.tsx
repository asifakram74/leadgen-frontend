"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Home } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }
    
    const verifyToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://leadbackend.onlinetoolpot.com";
        const res = await fetch(`${apiUrl}/auth/verify-email?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.detail || "Token verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
      }
    };
    
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border-x border-b border-border/50 rounded-3xl p-10 shadow-2xl relative overflow-hidden text-center flex flex-col">
        <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>
        
        {status === "loading" && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-white">Verifying Network...</h2>
            <p className="text-slate-400">Please wait while we validate your secure identity token.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white">Identity Verified</h2>
            <p className="text-slate-400 leading-relaxed">{message}</p>
            <div className="pt-4">
              <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                Access Leads Center
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-400">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white">Secure Link Expired</h2>
            <p className="text-rose-400/80 leading-relaxed">{message}</p>
            <div className="pt-4">
              <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Home className="w-4 h-4" /> Return to Genesis
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-700" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
