"use client";

import { useState, useEffect } from "react";
import {
  MapPin, Smartphone, Star,
  ShieldCheck, Eye, FileText,
  Loader2, RefreshCw, BarChart3,
  ExternalLink,
  Navigation,
  Sparkles, AlertCircle, Download, Globe,
  Map as MapIcon
} from "lucide-react";
import { leadService } from "@/services/scrapeService";
import { toast } from "sonner";
import api from "@/lib/api";
import AuditSummaryModal from "./AuditSummaryCard";
import BuilderModal from "./BuilderModal";
import AuditModelModal from "./AuditModelModal";

interface ScrapedResult {
  id?: string;
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
  category?: string;
  place_id?: string;
  ai_status?: string;
  ai_reason?: string;
  ai_report?: string;
  generated_site_url?: string;
  generated_domain?: string;
  lead_folder?: string;
  audit_report_html_url?: string;
  audit_report_pdf_url?: string;
  audit_report_url?: string;
}

export default function LeadCard({ item, onViewAudit }: { item: ScrapedResult, onViewAudit?: () => void }) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [newUrl, setNewUrl] = useState(item.generated_site_url);
  const [domainUrl, setDomainUrl] = useState<string | undefined>(
    item.generated_domain ? `https://${item.generated_domain}` : undefined
  );
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "recreate">("create");
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Local Audit State (for instant UI updates without reload)
  const [localAiStatus, setLocalAiStatus] = useState(() => {
    if (item.ai_status === "Analysis Error" && 
        item.ai_reason?.match(/HTTPConnectionPool|NameResolutionError|timeout|unreachable|Failed to resolve/i)) {
      return "Unreachable";
    }
    return item.ai_status;
  });
  const [localAiReport, setLocalAiReport] = useState(item.ai_report);
  const [localHtmlUrl, setLocalHtmlUrl] = useState(item.audit_report_html_url);
  const [localPdfUrl, setLocalPdfUrl] = useState(item.audit_report_pdf_url);
  const [localLeadFolder, setLocalLeadFolder] = useState(item.lead_folder);

  // Sync with props when parent state updates
  useEffect(() => {
    setLocalAiStatus(item.ai_status);
    setLocalAiReport(item.ai_report);
    setLocalHtmlUrl(item.audit_report_html_url);
    setLocalPdfUrl(item.audit_report_pdf_url);
    setLocalLeadFolder(item.lead_folder);
    if (item.generated_site_url) setNewUrl(item.generated_site_url);
    if (item.generated_domain) setDomainUrl(`https://${item.generated_domain}`);
  }, [item.ai_status, item.ai_report, item.audit_report_html_url, item.audit_report_pdf_url, item.lead_folder, item.generated_site_url, item.generated_domain]);

  const isTrustworthy = item.is_trustworthy === "Trustworthy";
  const isHealthy = localAiStatus === "Healthy" || localAiStatus === "No Issue";
  const hasIssues = localAiStatus === "Issues Found" || localAiStatus === "Issues";
  const hasReport = !!(localHtmlUrl || item.audit_report_html_url || item.audit_report_url || localAiStatus === 'Success' || item.ai_report);
  const hasReportData = !!(localAiReport && localAiReport.trim().length > 20);
  const hasWebsite = !!(item.website && item.website.trim().length > 0);
  const hasSite = !!(newUrl || item.generated_site_url);

  /* ── Helpers ─────────────────────────────────────────── */
  const getFullUrl = (path: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL || "https://leadbackend.onlinetoolpot.com").replace(/\/$/, "");
    let clean = path.startsWith("/") ? path : `/${path}`;
    if (!clean.startsWith("/storage/")) clean = `/storage${clean}`;
    return `${base}${clean}`;
  };

  const openModal = (mode: "create" | "recreate") => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleBuildSuccess = (url: string, domain: string) => {
    setNewUrl(url);
    if (domain) setDomainUrl(`https://${domain}`);
  };

  /* ── Preview / Download the generated site ───────────── */
  const handlePreviewSource = () => {
    const path = newUrl || item.generated_site_url;
    if (path) window.open(getFullUrl(path), "_blank", "noopener,noreferrer");
    else if (domainUrl) window.open(domainUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadSource = async () => {
    const path = newUrl || item.generated_site_url;
    if (!path) return;
    try {
      const response = await fetch(getFullUrl(path));
      const text = await response.text();
      const blob = new Blob([text], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.name.replace(/\s+/g, "-").toLowerCase()}-website.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  // Function to view the audit report HTML in a new tab
  const handlePreviewReport = () => {
    const path = localHtmlUrl || item.audit_report_html_url || item.audit_report_url;

    if (!path) {
      console.warn("Audit report URL is missing");
      return;
    }

    // getFullUrl will handle the base URL and ensure /storage/ is present
    const previewUrl = getFullUrl(path);

    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadReport = async () => {
    const folderName = item.lead_folder;
    if (!folderName) return;
    try {
      await leadService.downloadAuditReport(folderName);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  /* ── Re-Audit ─────────────────────────────────────────── */
  const handleReAudit = async (modelId: string) => {
    try {
      setIsAuditing(true);
      setLocalAiStatus("Auditing..."); // Immediate visual feedback
      setIsAuditModalOpen(false);

      const response = await api.post("/api/lead/re-audit", { 
        lead_id: item.id,
        model_id: modelId
      });
      const updatedLead = response.data;

      // Update local state with fresh intelligence
      let newStatus = updatedLead.ai_status;
      if (newStatus === "Analysis Error" && 
          updatedLead.ai_reason?.match(/HTTPConnectionPool|NameResolutionError|timeout|unreachable|Failed to resolve/i)) {
        newStatus = "Unreachable";
      }
      setLocalAiStatus(newStatus);
      setLocalAiReport(updatedLead.ai_report);
      setLocalHtmlUrl(updatedLead.audit_report_html_url);
      setLocalPdfUrl(updatedLead.audit_report_pdf_url);
      setLocalLeadFolder(updatedLead.lead_folder);

      if (newStatus === "Unreachable") {
        toast.error("Website unreachable. Intelligence extraction failed.");
      } else {
        toast.success("Intelligence audit updated successfully!");
      }
    } catch (err) {
      console.error("Audit Trigger Error:", err);
      setLocalAiStatus("Analysis Error");
      toast.error("Failed to complete audit. Please try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  /* ── Status badge config ──────────────────────────────── */
  const statusBadge = (() => {
    if (!hasWebsite) return { bg: "bg-slate-500 border-slate-400", icon: <MapPin className="w-3 h-3" />, label: "No Website" };
    if (isHealthy) return { bg: "bg-emerald-600 border-emerald-400", icon: <Sparkles className="w-3 h-3" />, label: "Ai Audit: Healthy" };
    if (hasIssues) return { bg: "bg-amber-500 border-amber-400", icon: <AlertCircle className="w-3 h-3" />, label: "Ai Audit: Issues" };
    if (localAiStatus === "Analysis Error") return { bg: "bg-rose-600 border-rose-400", icon: <AlertCircle className="w-3 h-3" />, label: "Ai Audit: Error" };
    if (localAiStatus === "Unreachable") return { bg: "bg-slate-500/80 border-slate-400/80 shadow-sm text-white", icon: <Globe className="w-3 h-3 text-white" />, label: "Unreachable" };

    // Pending State: Neutral gray, no spinner
    if (localAiStatus === "Pending..." || !localAiStatus) {
      return { bg: "bg-slate-600 border-slate-400", icon: <AlertCircle className="w-3 h-3" />, label: "Ai Audit:Pending" };
    }

    // Active Working State: "Auditing..." with Indigo and Spinner
    return { bg: "bg-indigo-600 border-indigo-400 shadow-lg", icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Ai Audit: Auditing..." };
  })();

  const getEmailConfig = (email: string) => {
    const e = email.toLowerCase().trim();
    if (e.includes("gmail.com")) return { icon: "fa-brands fa-google", color: "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20", label: "Gmail" };
    if (e.includes("outlook.com") || e.includes("hotmail.com") || e.includes("live.com")) return { icon: "fa-brands fa-microsoft", color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20", label: "Outlook" };
    if (e.includes("yahoo.com")) return { icon: "fa-brands fa-yahoo", color: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20", label: "Yahoo" };
    return { icon: "fa-solid fa-envelope", color: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20", label: "Mail" };
  };

  return (
    <>
      {/* ── Builder Modal ───────────────────────────────── */}
      {modalOpen && (
        <BuilderModal
          lead={item}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSuccess={handleBuildSuccess}
        />
      )}

      {/* ── Audit Model Selector Modal ─────────────────── */}
      {isAuditModalOpen && (
        <AuditModelModal
          lead={item}
          onClose={() => setIsAuditModalOpen(false)}
          onConfirm={handleReAudit}
          isAuditing={isAuditing}
        />
      )}

      {/* ── Card ────────────────────────────────────────── */}
      <div className={`relative premium-glass group hover:border-primary/50 rounded-3xl p-6 transition-all shadow-xl hover:-translate-y-2 flex flex-col h-full duration-500 ${hasIssues ? "border-rose-500/20" : ""}`}>

        {/* Status badge */}
        {item.ai_status && (
          <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border shadow-sm z-20 flex items-center gap-1.5 text-white ${statusBadge.bg}`}>
            {statusBadge.icon}
            {statusBadge.label}
          </div>
        )}

        {/* ── Header ──────────────────────────────────── */}
        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-xl font-black text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.name}
            </h3>

            {/* Audit Report Button: Visible if report exists */}
            <div className="flex items-center gap-2">
              {hasReport && localAiStatus !== "Unreachable" && (
                <>
                  {/* View Intelligence Modal */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewAudit?.(); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-lg border active:scale-90 ${
                      isHealthy ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white' :
                      hasIssues ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white' :
                      localAiStatus === 'Analysis Error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white' :
                      localAiStatus === 'Unreachable' ? 'bg-slate-400/10 border-slate-400/20 text-slate-400 hover:bg-slate-400 hover:text-white' :
                      'bg-slate-500/10 border-slate-500/20 text-slate-500 hover:bg-slate-500 hover:text-white'
                    }`}
                    title="View Intelligence Dashboard"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>

                  {/* Download PDF Report */}
                  <button
                    onClick={() => {
                      if (localPdfUrl) {
                        window.open(getFullUrl(localPdfUrl), "_blank", "noopener");
                      } else if (localLeadFolder) {
                        leadService.downloadAuditReport(localLeadFolder);
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-90"
                    title="Download Audit PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Show ReAudit if missing, error, or manual refresh requested AND has a website */}
              {(hasWebsite && localAiStatus !== "Unreachable" && (!hasReport || localAiStatus === "Analysis Error" || localAiStatus === "Pending...")) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAuditModalOpen(true);
                  }}
                  disabled={isAuditing}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg active:scale-90 ${isAuditing ? 'opacity-50' : ''}`}
                  title="Run Intelligence Audit"
                >
                  {isAuditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
              )}

              {isTrustworthy && localAiStatus !== "Unreachable" && (
                <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl text-xs font-black border border-amber-500/20 w-fit">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            {item.rating || "N/A"}{" "}
            <span className="text-amber-500/40 text-[10px] font-bold">({item.reviews || 0})</span>
          </div>
        </div>

        {/* ── Contact Info ─────────────────────────────── */}
        <div className="flex-grow space-y-3">
          <div className="flex items-start gap-4 p-3.5 bg-primary/5 rounded-2xl border-2 shadow-inner hover:border-primary/40 transition-all">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-foreground font-semibold line-clamp-2">{item.address || "Location Unknown"}</span>
          </div>
          {item.phone && (
            <div className="flex items-center gap-4 p-3.5 bg-primary/5 rounded-2xl border-2 shadow-inner hover:border-primary/40">
              <Smartphone className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-foreground font-bold">{item.phone}</span>
            </div>
          )}
        </div>

        {/* Interaction Bar (Always Visible) */}
        <div className="flex flex-wrap gap-2 pt-4 mt-auto border-t border-black/5">
          {/* WhatsApp */}
          {item.whatsapp && (
            <a
              href={`https://wa.me/${String(item.whatsapp).replace(/[\+\s]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm group/icon"
              title="WhatsApp Business"
            >
              <i className="fa-brands fa-whatsapp text-lg group-hover/icon:scale-110" />
            </a>
          )}

          {/* Email */}
          {item.emails && (
            <a
              href={`mailto:${item.emails.split(',')[0].trim()}`}
              onClick={(e) => e.stopPropagation()}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm group/icon ${getEmailConfig(item.emails.split(',')[0]).color}`}
              title="Email Outreach"
            >
              <i className={`${getEmailConfig(item.emails.split(',')[0]).icon} text-lg group-hover/icon:scale-110`} />
            </a>
          )}

          {/* Social Platforms Logic */}
          {(() => {
            const rawLinks = item.social_links ? item.social_links.split(',') : [];
            // If website is social, add it to the list if not already there
            if (item.website && /facebook|instagram|twitter|x\.com|youtube|tiktok|linkedin|upwork|snapchat|threads|pinterest|yelp/.test(item.website.toLowerCase())) {
              if (!rawLinks.some(l => l.toLowerCase().includes(item.website!.toLowerCase()))) {
                rawLinks.push(`Website: ${item.website}`);
              }
            }

            const activeLinks = rawLinks.map(l => ({
              url: l.includes(':') ? l.substring(l.indexOf(':') + 1).trim() : l.trim(),
              platform: l.toLowerCase()
            })).filter(l => l.url);

            const placeholders = [
              { key: 'facebook', icon: 'fa-brands fa-facebook-f', color: 'bg-blue-600/10 border-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white', label: 'Facebook' },
              { key: 'instagram', icon: 'fa-brands fa-instagram', color: 'bg-pink-500/10 border-pink-500/20 text-pink-500 hover:bg-pink-500 hover:text-white', label: 'Instagram' },
              { key: 'tiktok', icon: 'fa-brands fa-tiktok', color: 'bg-zinc-800/10 border-zinc-800/20 text-zinc-800 hover:bg-zinc-800 hover:text-white', label: 'TikTok' },
              { key: 'youtube', icon: 'fa-brands fa-youtube', color: 'bg-red-600/10 border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white', label: 'YouTube' }
            ];

            const extraPlatforms = [
              { key: 'linkedin', icon: 'fa-brands fa-linkedin-in', color: 'bg-blue-700/10 border-blue-700/20 text-blue-700 hover:bg-blue-700 hover:text-white', label: 'LinkedIn' },
              { key: 'twitter', icon: 'fa-brands fa-x-twitter', color: 'bg-sky-400/10 border-sky-400/20 text-sky-500 hover:bg-sky-400 hover:text-white', label: 'X (Twitter)' },
              { key: 'x.com', icon: 'fa-brands fa-x-twitter', color: 'bg-sky-400/10 border-sky-400/20 text-sky-500 hover:bg-sky-400 hover:text-white', label: 'X (Twitter)' },
              { key: 'upwork', icon: 'fa-brands fa-upwork', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white', label: 'Upwork' },
              { key: 'snapchat', icon: 'fa-brands fa-snapchat', color: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-600 hover:bg-yellow-400 hover:text-white', label: 'Snapchat' },
              { key: 'threads', icon: 'fa-brands fa-threads', color: 'bg-zinc-900/10 border-zinc-900/20 text-zinc-900 hover:bg-zinc-900 hover:text-white', label: 'Threads' },
              { key: 'pinterest', icon: 'fa-brands fa-pinterest-p', color: 'bg-rose-600/10 border-rose-600/20 text-rose-600 hover:bg-rose-600 hover:text-white', label: 'Pinterest' },
              { key: 'yelp', icon: 'fa-brands fa-yelp', color: 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white', label: 'Yelp' }
            ];

            // Render ONLY active platforms
            return activeLinks.map((l, idx) => {
              // Try to find a config from either placeholders or extraPlatforms
              const config = [...placeholders, ...extraPlatforms].find(p => l.platform.includes(p.key)) || {
                icon: 'fa-solid fa-link',
                color: 'bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white',
                label: 'External Link'
              };

              return (
                <a 
                  key={`${l.platform}-${idx}`} 
                  href={l.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={(e) => e.stopPropagation()} 
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm group/icon ${config.color}`} 
                  title={config.label}
                >
                  <i className={`${config.icon} text-lg group-hover/icon:scale-110`} />
                </a>
              );
            });
          })()}
        </div>

        {/* ── Action Bar ───────────────────────────────── */}
        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between gap-3">
          {/* Link icons row */}
          <div className="flex items-center gap-2">
            {item.maps_url && (
              <a href={item.maps_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-primary transition-all text-muted-foreground hover:text-white shadow-lg"
                title="Google Maps">
                <MapIcon className="w-4 h-4" />
              </a>
            )}
            {item.website && (
              <a href={item.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-emerald-500 hover:text-white shadow-lg"
                title="Original Website">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Generated site controls */}
            {hasSite && (
              <>
                {domainUrl && (
                  <a href={domainUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all shadow-lg"
                    title="Live Domain">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); handlePreviewSource(); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                  title="Preview">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDownloadSource(); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-lg"
                  title="Download HTML">
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Build / Recreate button */}
          {!hasSite ? (
            <button
              onClick={(e) => { e.stopPropagation(); openModal("create"); }}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${item.website
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white"
                }`}
            >
              <Sparkles className="w-3 h-3" />
              AI Builder
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); openModal("recreate"); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
              title="Recreate with new prompt"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}