"use client";

import { useState } from "react";
import { Info, Clock, Star, ShieldCheck, MapPin, ExternalLink, Map as MapIcon, Link as LinkIcon, Smartphone, Loader2, Sparkles, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface ScrapedResult {
  id: string;
  place_id: string;
  name: string;
  rating: string;
  reviews: string;
  address: string;
  website: string;
  emails: string;
  social_links: string;
  whatsapp: string;
  maps_url: string;
  is_trustworthy: string;
  operating_status: string;
  open_hours: string;
  phone?: string;
  // AI Fields
  ai_status?: string;
  ai_reason?: string;
  ai_report?: string;
  generated_url?: string;
}

export default function LeadCard({ item }: { item: ScrapedResult }) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [newUrl, setNewUrl] = useState(item.generated_url);
  const [liveUrl, setLiveUrl] = useState<string | undefined>();

  const isTrustworthy = item.is_trustworthy === "Trustworthy";

  // Logic for UI states
  const hasWebsite = !!item.website;
  const isHealthy = item.ai_status === "Healthy";
  const hasIssues = item.ai_status === "Issues";

  const handleBuild = async () => {
    try {
      setIsBuilding(true);
      const res = await api.post("/api/builder/generate", {
        job_uuid: item.id,
        place_id: item.id, 
        name: item.name,
        category: "Business",
        address: item.address,
        phone: item.phone,
        email: item.emails?.split(',')[0],
        rating: item.rating,
        reviews: item.reviews,
        website: item.website || "",
        ai_report: item.ai_report || "N/A"
      });

      if (res.data.url) {
        setNewUrl(res.data.url);
        setLiveUrl(res.data.live_url || res.data.url);
      }
    } catch (err) {
      console.error("AI Builder Error:", err);
      // alert("Failed to build website. Check backend logs or API key.");
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDownloadSource = async () => {
    if (!newUrl) return;
    try {
      // Clean up newUrl to ensure it's a relative path from storage/sites if needed
      let cleanPath = newUrl;

      // If newUrl is a full URL (e.g. from generated_url), strip the domain to get the reference
      if (cleanPath.includes('onlinetoolpot.com')) {
        // Extract the folder name if it's a subdomain
        const match = cleanPath.match(/https?:\/\/([^.]+)\.onlinetoolpot\.com/);
        if (match) {
          cleanPath = `/storage/${match[1]}/index.html`;
        }
      }

      // Ensure we don't double up /storage/sites
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://leadgenbackend.onlinetoolpot.com").replace(/\/$/, "");

      // Smart Merge: If path has /storage/sites and base doesn't, we are good.
      // If path doesn't have it, we might need to add it.
      let finalPath = cleanPath;
      if (!finalPath.startsWith('http') && !finalPath.includes('/storage/')) {
        finalPath = `/storage/${finalPath.startsWith('/') ? finalPath.slice(1) : finalPath}`;
      }

      const fetchUrl = finalPath.startsWith('http')
        ? finalPath
        : `${baseUrl}${finalPath.startsWith('/') ? '' : '/'}${finalPath}`;

      console.log("[LeadCard] Downloading source from:", fetchUrl);
      const response = await fetch(fetchUrl);
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.name.replace(/\s+/g, '-').toLowerCase()}-website.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handlePreviewSource = () => {
    if (!newUrl) return;

    try {
      let cleanPath = newUrl;

      // If it's a full subdomain URL, use it directly
      if (cleanPath.includes("onlinetoolpot.com")) {
        window.open(cleanPath, "_blank", "noopener,noreferrer");
        return;
      }

      let baseUrl = (
        process.env.NEXT_PUBLIC_API_URL ||
        "https://leadgenbackend.onlinetoolpot.com"
      ).replace(/\/$/, "");

      let finalPath = cleanPath;

      if (
        !finalPath.startsWith("http") &&
        !finalPath.includes("/storage/")
      ) {
        finalPath = `/storage/${finalPath.startsWith("/") ? finalPath.slice(1) : finalPath
          }`;
      }

      const fetchUrl = finalPath.startsWith("http")
        ? finalPath
        : `${baseUrl}${finalPath.startsWith("/") ? "" : "/"}${finalPath}`;

      console.log("[LeadCard] Opening preview:", fetchUrl);

      window.open(fetchUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("Preview failed", e);
    }
  };

  // Email helper
  const getEmailConfig = (email: string) => {
    const e = email.toLowerCase().trim();
    if (e.includes("gmail.com")) return { icon: "fa-brands fa-google", color: "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20", label: "Gmail" };
    if (e.includes("outlook.com") || e.includes("hotmail.com") || e.includes("live.com")) return { icon: "fa-brands fa-microsoft", color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20", label: "Outlook" };
    if (e.includes("yahoo.com")) return { icon: "fa-brands fa-yahoo", color: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20", label: "Yahoo" };
    return { icon: "fa-solid fa-envelope", color: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20", label: "Mail" };
  };

  return (
    <div className={`cursor-pointer relative premium-glass group hover:border-primary/50 rounded-3xl p-6 transition-all shadow-xl hover:-translate-y-2 flex flex-col h-full duration-500 ${hasIssues ? 'border-rose-500/30' : ''}`}>
      {/* AI Intelligence Badge */}
      {item.ai_status && (
        <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border shadow-sm z-20 flex items-center gap-1.5 ${isHealthy ? 'bg-emerald-500/90 text-white border-emerald-400' :
          hasIssues ? 'bg-rose-500/90 text-white border-rose-400' : 'bg-muted text-muted-foreground border-white/10'
          }`}>
          {isHealthy ? <Sparkles className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          AI Audit: {item.ai_status}
        </div>
      )}

      {/* Decorative Aura */}
      {isTrustworthy && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl -z-10 rounded-full" />
      )}

      {/* Card Header */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-xl font-black text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          {isTrustworthy && (
            <div
              className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform cursor-help"
              title="Verified: High Trust Stakeholder"
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl text-xs font-black border border-amber-500/20 w-fit">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          {item.rating || "N/A"} <span className="text-amber-500/40 text-[10px] font-bold">({item.reviews || 0})</span>
        </div>
      </div>

      {/* Contact Matrix */}
      <div className="flex-grow space-y-4">
        {/* Address */}
        <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl bg-primary/20 border-2 shadow-inner hover:border-primary/40 transition-all group/row shadow-sm">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5 transition-transform" />
          <span className="text-sm text-foreground leading-relaxed font-semibold line-clamp-2">{item.address || "Location Vector Unknown"}</span>
        </div>

        {/* Phone Number - Defensive Check */}
        {(item.phone || (item as any).phone_number) && (
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl bg-primary/20 border-2 shadow-inner hover:border-primary/40">
            <Smartphone className="w-5 h-5 text-primary shrink-0 transition-transform" />
            <span className="text-sm text-foreground font-bold">{item.phone || (item as any).phone_number}</span>
          </div>
        )}

        {/* Status & Hours */}
        {/* {(item.operating_status || item.open_hours) && (
          <div className="p-4 rounded-2xl bg-primary/5 border-2 border-primary/20 space-y-3 shadow-inner hover:border-primary/40">
            {item.operating_status && (
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground font-bold">
                  {item.operating_status}
                </span>
              </div>
            )}
            {item.open_hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-[10px] font-bold text-foreground/80 leading-relaxed italic line-clamp-2">
                  {item.open_hours}
                </span>
              </div>
            )} 
          </div>
        )} */}

        {/* AI Reason (Small Tip) */}
        {/* {hasIssues && item.ai_reason && (
          <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-[10px] text-rose-400 font-bold leading-relaxed">
            <Info className="w-3 h-3 inline mr-1 mb-0.5" />
            {item.ai_reason}
          </div>
        )} */}

        {/* Interaction Bar (Socials + Email Icon) */}
        {(item.whatsapp || item.social_links || item.emails) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {/* WhatsApp */}
            {item.whatsapp && (
              <a
                href={`https://wa.me/${item.whatsapp.replace(/\+/g, '').replace(/\s+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-lg"
                title="WhatsApp Business"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
              </a>
            )}

            {/* Email Icon-Only Display */}
            {item.emails && (
              <a
                href={`mailto:${item.emails.split(',')[0].trim()}`}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-lg ${getEmailConfig(item.emails.split(',')[0]).color}`}
                title={`${getEmailConfig(item.emails.split(',')[0]).label}: ${item.emails.split(',')[0].trim()}`}
              >
                <i className={`${getEmailConfig(item.emails.split(',')[0]).icon} text-lg`}></i>
              </a>
            )}

            {/* Social Icons */}
            {item.social_links && item.social_links.split(',').map((link, idx) => {
              const url = link.trim().toLowerCase();
              if (!url) return null;

              let iconClass = "fa-solid fa-link";
              let label = "Social";
              let colorClass = "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20";

              if (url.includes('facebook.com')) { iconClass = "fa-brands fa-facebook-f"; label = "Facebook"; colorClass = "bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20"; }
              else if (url.includes('instagram.com')) { iconClass = "fa-brands fa-instagram"; label = "Instagram"; colorClass = "bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20"; }
              else if (url.includes('twitter.com') || url.includes('x.com')) { iconClass = "fa-brands fa-x-twitter"; label = "Twitter"; colorClass = "bg-sky-400/10 border-sky-400/20 text-sky-400 hover:bg-sky-400/20"; }
              else if (url.includes('linkedin.com')) { iconClass = "fa-brands fa-linkedin-in"; label = "LinkedIn"; colorClass = "bg-blue-700/10 border-blue-700/20 text-blue-400 hover:bg-blue-700/20"; }
              else if (url.includes('tiktok.com')) { iconClass = "fa-brands fa-tiktok"; label = "TikTok"; colorClass = "bg-neutral-800 border-white/10 text-white hover:bg-neutral-700"; }
              else if (url.includes('youtube.com')) { iconClass = "fa-brands fa-youtube"; label = "YouTube"; colorClass = "bg-rose-600/10 border-rose-600/20 text-rose-400 hover:bg-rose-600/20"; }

              return (
                <a
                  key={`social-${idx}`}
                  href={link.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-lg ${colorClass}`}
                  title={label}
                >
                  <i className={`${iconClass} text-lg`}></i>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Suite */}
      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {item.maps_url && (
            <a
              href={item.maps_url}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-primary transition-all text-muted-foreground hover:text-white group/btn shadow-lg"
              title="View on Google Maps"
            >
              <MapIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            </a>
          )}
          {/* Original Website Link */}
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-emerald-500 hover:text-white transition-all group/btn shadow-lg"
              title="Visit Website"
            >
              <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            </a>
          )}

          {/* AI Subdomain Link */}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all group/btn shadow-lg"
              title="View AI Subdomain"
            >
              <Sparkles className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            </a>
          )}
          {newUrl && (
            <button
              onClick={handleDownloadSource}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg group/dl"
              title="Download HTML Source"
            >
              <i className="fa-solid fa-download group-hover/dl:scale-110 transition-transform"></i>
            </button>
          )}
        </div>

        {newUrl && (
          <button
            onClick={handlePreviewSource}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-lg group/eye"
            title="Preview Website"
          >
            <i className="fa-solid fa-eye group-hover/eye:scale-110 transition-transform"></i>
          </button>
        )}

        {/* AI Generator Button */}
        {liveUrl ? null : (!isHealthy || !item.website) ? (
          <button
            onClick={handleBuild}
            disabled={isBuilding}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${hasIssues ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isBuilding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isBuilding ? "AI Building..." : (hasIssues ? "Recreate Site" : "Create Website")}
          </button>
        ) : (
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 flex items-center gap-1.5">
            <LinkIcon className="w-3 h-3" />
            Active Online
          </div>
        )}
      </div>
    </div >
  );
}
