"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { authService } from "@/services/authService";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { setProfile } from "@/store/slices/userSlice";
import ThemeToggle from "@/components/ThemeToggle";

function LoginComponent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReset = searchParams.get("reset") === "success";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login({
        email: email,
        password: password
      });

      console.log("[Login] Credentials received. Finalizing handshake...");
      
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);

      // ─── Cookie Bridge: Set token for Server-Side Checks ───────────
      document.cookie = `token=${data.access_token}; Path=/; SameSite=Lax; Max-Age=2592000`; // 30 days
      
      dispatch(setCredentials({
        token: data.access_token,
        role: data.user.role
      }));

      // Immediately populate Redux state with user data 
      dispatch(setProfile(data.user));

      // A tiny delay to allow flush-to-disk before navigation
      setTimeout(() => {
        console.log("[Login] Handshake finalized. Navigating to leads...");
        router.push("/leads");
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-500/10 min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border-x border-b border-gray-300 dark:border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-3xl"></div>
        <div className="p-8 pb-10">

          <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Welcome to Leads Intelligence Center</h2>
          <p className="text-foreground/60 text-center mb-8">Login to access your Leads Intelligence</p>

          {isReset && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Credentials patched successfully!
            </div>
          )}

          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 text-rose-400 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
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
            <div>
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-foreground/70">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[18px] text-foreground/40 hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-foreground/60 text-sm">
            Don't have an account? <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>}>
      <LoginComponent />
    </Suspense>
  );
}
