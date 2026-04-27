"use client";
import React, { useState } from "react";
import { Mail, Lock, ArrowRight, User as UserIcon, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

import { authService } from "@/services/authService";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-500/10 min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10 relative">
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Join the Leads Network</h1>
          <p className="text-foreground/60">Secure your competitive intelligence advantage.</p>
        </div>

        {success ? (
          <div className="bg-card/50 backdrop-blur-xl border-x border-b border-border p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center space-y-6 animate-in fade-in zoom-in duration-500 flex flex-col">
            <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mt-4">
              <Mail className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check Your Inbox</h2>
            <p className="text-foreground/60 leading-relaxed">
              We have dispatched a secure identity token to your email. Please click the link in your inbox to activate your account and start scraping.
            </p>
            <div className="pt-4">
              <Link href="/login" className="inline-block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                Proceed to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/50 backdrop-blur-xl border-x border-b border-border p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
            <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>

            {error && (
              <div className="mb-6 mt-4 bg-rose-500/10 border border-rose-500/50 text-rose-400 text-sm p-4 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className={`grid grid-cols-2 gap-4 mb-5 ${!error ? 'mt-4' : ''}`}>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-background/50 border border-border text-foreground rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="John"
                    required
                  />
                  <UserIcon className="w-4 h-4 text-foreground/40 absolute left-3.5 top-3.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-background/50 border border-border text-foreground rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Doe"
                    required
                  />
                  <UserIcon className="w-4 h-4 text-foreground/40 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background/50 border border-border text-foreground rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                    required
                  />
                  <Mail className="w-4 h-4 text-foreground/40 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-foreground/40 absolute left-3.5 top-3.5 z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-background/50 border border-border text-foreground rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-foreground/40 hover:text-foreground transition-colors z-10">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-foreground/40 absolute left-3.5 top-3.5 z-10" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-background/50 border border-border text-foreground rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-foreground/40 hover:text-foreground transition-colors z-10">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 mt-8 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-foreground/50 text-sm">
          Already a certified member?{" "}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
