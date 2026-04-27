"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";
import ThemeToggle from "@/components/ThemeToggle";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border-x border-b border-border/50 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-3xl"></div>
        <div className="p-8 pb-10">

          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
              <p className="text-foreground/60 mb-6">If your email is registered in our secure mapping, a recovery link has been dispatched to your inbox.</p>
              <Link href="/login" className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/20 transition-all">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Reset Password</h2>
              <p className="text-foreground/60 text-center mb-8">Enter your registered email address</p>

              {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 text-rose-400 rounded-xl text-sm">{error}</div>}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-6 text-center text-foreground/60 text-sm">
                Remembered your password? <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Log In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
