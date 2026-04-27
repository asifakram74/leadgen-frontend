"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { setProfile } from "@/store/slices/userSlice";
import { userService } from "@/services/userService";
import { Loader2 } from "lucide-react";

const protectedRoutes = ["/leads", "/profile", "/users"];
const authRoutes = ["/login", "/register", "/forgot-password"];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const profile = useAppSelector((state) => state.user.profile);
  
  // Strict check for redux-persist rehydration
  const isRehydrated = useAppSelector((state: any) => state._persist?.rehydrated);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DO NOTHING until rehydration is complete
    if (!isRehydrated) return;

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    
    // ─── A to Z Handshake: Auto-sync Redux from LocalStorage ─────
    const rawToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const rawRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;

    if (rawToken && !isAuthenticated) {
      console.log("[Guard] Syncing Redux state from LocalStorage...");
      import("@/store/slices/authSlice").then(({ setCredentials }) => {
          dispatch(setCredentials({
            token: rawToken,
            role: rawRole || "user"
          }));
      });
      // We stop here for this tick to allow the state update to apply
      return;
    }

    const trulyAuthenticated = isAuthenticated || !!rawToken;

    if (!trulyAuthenticated && isProtectedRoute) {
      router.replace("/login");
      return;
    }

    // ─── Hydrate Redux profile on page load if missing ───────────────
    if (trulyAuthenticated && (token || rawToken) && !profile) {
      setLoading(true);
      userService.getProfile()
        .then((data) => dispatch(setProfile(data)))
        .catch((err) => {
          console.error("[RouteGuard] Profile sync failed:", err);
          if (err.response?.status === 401) {
             dispatch(logout());
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [pathname, isRehydrated, isAuthenticated, token, profile, router, dispatch]);

  // Show loader until rehydration is complete OR if fetching profile
  const needsLoader = !isRehydrated || (loading && protectedRoutes.some((route) => pathname.startsWith(route)));

  if (needsLoader) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            <Loader2 className="absolute inset-4 w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 animate-pulse">Establishing Secure Uplink</p>
        <p className="mt-2 text-[9px] font-bold text-foreground/30 uppercase tracking-widest italic tracking-[0.2em]">Syncing Matrix Records...</p>
      </div>
    );
  }

  return <>{children}</>;
}
