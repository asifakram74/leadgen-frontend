"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldAlert, LogOut, MapPin, User as UserIcon, Layers, LogIn, UserPlus, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAppSelector, useAppDispatch } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { getMediaUrl } from "@/lib/api";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { token, role } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Live profile data from Redux — updates immediately after profile picture/name change
  const profile = useAppSelector((state) => state.user.profile);

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    
    // ─── Cookie Bridge: Clear server-side token ─────────────────────
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    
    dispatch(logout());
    toast.success("Signed out", {
      description: "Session terminated safely.",
    });
    window.location.href = "/login";
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdmin = role === "super_admin" || role === "admin";

  const navLinks = [
    { name: "Leads Center", href: "/leads", icon: Layers },
    ...(isAdmin ? [{ name: "Users", href: "/users", icon: ShieldAlert }] : []),
  ];

  // Avatar: shows profile picture if available, otherwise initials, otherwise icon
  const AvatarDisplay = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const dim = size === "md" ? "w-10 h-10 text-base" : "w-8 h-8 text-xs";
    const picUrl = profile?.profile_picture_url ? getMediaUrl(profile.profile_picture_url) : null;
    const initials = profile
      ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
      : "";

    return (
      <div className={`${dim} rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-300 group-hover:border-primary group-hover:ring-4 group-hover:ring-primary/10`}>
        {picUrl ? (
          <img src={picUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : initials ? (
          <span className="font-black text-indigo-400">{initials}</span>
        ) : (
          <UserIcon className="w-4 h-4 text-indigo-400" />
        )}
      </div>
    );
  };

  return (
    <nav className="w-full bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        <Link href="/" className="flex items-center gap-3 group text-foreground">
          <div className="bg-gradient-to-tr from-primary to-violet-500 p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black font-heading tracking-tight text-foreground">LeadStation Pro</span>
        </Link>

        {/* Mobile Toggle */}
        <div className="flex items-center md:hidden gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8">
            {token && navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 text-sm font-bold flex items-center gap-2 transition-all group ${isActive
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${isActive
                      ? "text-primary shadow-sm"
                      : "text-foreground/60 group-hover:text-primary"
                      }`}
                  />

                  {link.name}

                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                  />
                </Link>
              );
            })}

            {/* Desktop Profile Link */}
            {token && profile && (
              <Link
                href="/profile"
                className={`relative py-2 text-sm font-bold flex items-center gap-3 transition-all group ${pathname === "/profile"
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                  }`}
              >
                <AvatarDisplay size="sm" />

                <span className="hidden md:block transition-colors">
                  {profile.first_name} {profile.last_name}
                </span>

                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-300 ${pathname === "/profile"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                    }`}
                />
              </Link>
            )}
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {token ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="bg-card hover:bg-rose-500/10 text-foreground/70 hover:text-rose-500 border border-border hover:border-rose-500/50 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group"
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <>
                  <Link href="/login" className="text-foreground/60 hover:text-foreground text-sm font-bold transition-all">
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2 group"
                  >
                    <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Join Pro
                  </Link>
                </>
              )
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-border md:hidden animate-in slide-in-from-top-4 duration-200 z-50 overflow-hidden">
            <div className="px-6 py-8 space-y-6">
              {token ? (
                <>
                  {/* Mobile profile summary */}
                  {profile && (
                    <Link href="/profile" className="flex items-center gap-4 p-4 bg-foreground/5 rounded-2xl border border-border group transition-all active:scale-[0.98]">
                      <AvatarDisplay size="md" />
                      <div>
                        <p className="font-black text-foreground group-hover:text-primary transition-colors">{profile.first_name} {profile.last_name}</p>
                        <p className="text-xs text-foreground/40 font-medium">{profile.email}</p>
                      </div>
                    </Link>
                  )}
                  <div className="space-y-4">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? "bg-primary/10 text-primary" : "text-foreground/60 hover:bg-foreground/5"
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-bold">{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="pt-6 border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 p-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                !isAuthPage && (
                  <div className="space-y-4">
                    <Link href="/login" className="block w-full text-center py-4 text-foreground/60 font-bold hover:bg-foreground/5 rounded-2xl transition-all">
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20"
                    >
                      Join Pro Network
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
