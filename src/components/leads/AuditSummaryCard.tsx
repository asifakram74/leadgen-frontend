"use client";

import { 
  Eye, FileText, ShieldCheck, 
  X, BarChart3, Globe, Zap, Search, Activity,
  Mail, MessageCircle, Share2, Sparkles, Loader2
} from "lucide-react";
import { leadService } from "@/services/scrapeService";

interface AuditSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiReport: string;
  auditReportUrl?: string;
  leadFolder?: string;
  businessName: string;
  socialLinks?: string;
  whatsapp?: string;
  emails?: string;
  onReAudit?: () => void;
  isAuditing?: boolean;
}

function parseAuditReport(report: string) {
  const extractScore = (keys: string[]): number | null => {
    // Sanitize report: remove bolding for easier matching
    const cleanReport = report.replace(/\*\*/g, '');
    
    for (const key of keys) {
      // 1. Table format: | UX | 8 | or | UX | 8/10 |
      const tableMatch = cleanReport.match(new RegExp(`\\|\\s*${key}[^|]*\\|\\s*(\\d+)(?:\\s*/\\s*10)?\\s*\\|`, "i"));
      if (tableMatch) return parseInt(tableMatch[1], 10);
      
      // 2. Standard format: UX: 8/10 or UX - 8/10
      const standardMatch = cleanReport.match(new RegExp(`${key}[^\\d\\n]{0,20}(\\d+)\\s*/\\s*10`, "i"));
      if (standardMatch) return parseInt(standardMatch[1], 10);

      // 3. Simple number next to key: UX: 8
      const simpleMatch = cleanReport.match(new RegExp(`${key}[^\\d\\n]{0,10}(\\d+)(?!\\s*%)`, "i"));
      if (simpleMatch) {
        const val = parseInt(simpleMatch[1], 10);
        if (val <= 10) return val;
      }
    }
    return null;
  };

  const ux = extractScore(["User.?Friendliness", "UX", "Usability", "Design", "Interface"]);
  const seo = extractScore(["SEO", "Search Engine", "Visibility", "Crawlability"]);
  const perf = extractScore(["Performance", "Speed", "Development.?Quality", "Loading"]);
  const respo = extractScore(["Responsiveness", "Mobile", "Adaptation", "Cross-device"]);

  // Scale scores to 100
  const scale = (s: number | null) => (s !== null ? s * 10 : null);
  const ux100 = scale(ux);
  const seo100 = scale(seo);
  const perf100 = scale(perf);
  const respo100 = scale(respo);

  const found = [ux100, seo100, perf100, respo100].filter((s): s is number => s !== null);
  const overall = found.length > 0 ? Math.round(found.reduce((a, b) => a + b, 0) / found.length) : 50;

  let oneLiner = "";
  const verdictMatch = report.match(/(?:overall verdict|verdict|summary)[:\s]+([^\n.]{20,120})/i);
  if (verdictMatch) oneLiner = verdictMatch[1].trim();
  if (!oneLiner) {
    const execMatch = report.match(/executive summary[\s\S]{0,30}\n+([^\n]{30,150})/i);
    if (execMatch) oneLiner = execMatch[1].trim();
  }
  if (!oneLiner) {
    // Clean markdown bolding from potential report snippets
    oneLiner = report.split('\n').find(l => l.length > 40 && !l.includes('|'))?.replace(/\*\*/g, '').trim() || 
               "Professional analysis identifies key growth opportunities for this digital asset.";
  }

  return { overall, ux100, seo100, perf100, respo100, oneLiner };
}

function CompactMetric({ score, label, color, icon: Icon }: { score: number | null | undefined, label: string, color: string, icon: any }) {
  const isAvailable = score !== null && score !== undefined;
  const displayScore = isAvailable ? score : "N/A";
  const percentage = isAvailable ? score : 0;

  const getStatus = (s: number) => {
    if (s >= 90) return { text: "EXCELLENT", bg: "bg-emerald-500/10", textCol: "text-emerald-600", desc: "Top-tier Performance" };
    if (s >= 70) return { text: "GOOD", bg: "bg-blue-500/10", textCol: "text-blue-600", desc: "Solid Foundations" };
    if (s >= 40) return { text: "AVERAGE", bg: "bg-amber-500/10", textCol: "text-amber-600", desc: "Needs Optimization" };
    return { text: "POOR", bg: "bg-rose-500/10", textCol: "text-rose-600", desc: "Critical Issues Found" };
  };

  const status = isAvailable ? getStatus(score) : { text: "UNKNOWN", bg: "bg-black/5", textCol: "text-black/40", desc: "Data Not Determined" };
  
  return (
    <div className={`flex flex-col gap-4 p-5 rounded-[2rem] border transition-all ${isAvailable ? 'bg-white/60 border-white shadow-sm' : 'bg-black/5 border-black/5 opacity-50'}`}>
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/5" />
            <circle 
              cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="5" 
              strokeDasharray="125.6"
              strokeDashoffset={125.6 - (125.6 * percentage) / 100}
              className={`${isAvailable ? color : 'text-black/10'} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[12px] font-black tracking-tighter ${isAvailable ? 'text-black/80' : 'text-black/30'}`}>{displayScore}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/80">{label}</p>
          <div className="flex items-center gap-1 opacity-40">
            <Icon className="w-2.5 h-2.5" />
            <span className="text-[8px] font-bold uppercase">{isAvailable ? 'Verified Insight' : 'Data Missing'}</span>
          </div>
        </div>
      </div>
      
      <div className={`mt-auto px-4 py-2 rounded-xl ${status.bg} flex flex-col gap-0.5`}>
        <span className={`text-[9px] font-black ${status.textCol}`}>{status.text}</span>
        <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider">{status.desc}</span>
      </div>
    </div>
  );
}

export default function AuditSummaryModal({
  isOpen,
  onClose,
  aiReport,
  auditReportUrl,
  leadFolder,
  businessName,
  socialLinks,
  whatsapp,
  emails,
  onReAudit,
  isAuditing
}: AuditSummaryModalProps) {
  if (!isOpen) return null;

  const { overall, ux100, seo100, perf100, respo100, oneLiner } = parseAuditReport(aiReport);

  const getFullUrl = (path: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL || "https://leadbackend.onlinetoolpot.com").replace(/\/$/, "");
    let clean = path.startsWith("/") ? path : `/${path}`;
    if (!clean.startsWith("/storage/")) clean = `/storage${clean}`;
    return `${base}${clean}`;
  };

  const getSocialIcon = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes('facebook')) return "fa-brands fa-facebook-f text-[#1877F2]";
    if (u.includes('instagram')) return "fa-brands fa-instagram text-[#E4405F]";
    if (u.includes('twitter') || u.includes('x.com')) return "fa-brands fa-x-twitter text-black";
    if (u.includes('linkedin')) return "fa-brands fa-linkedin-in text-[#0A66C2]";
    if (u.includes('youtube')) return "fa-brands fa-youtube text-[#FF0000]";
    if (u.includes('tiktok')) return "fa-brands fa-tiktok text-black";
    return "fa-solid fa-link text-primary";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-card/95 backdrop-blur-3xl border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
        
        {/* Compact Header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/60 bg-white/40">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <span className="text-xl md:text-3xl font-black">{overall}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Summary</p>
              <h2 className="text-xl md:text-2xl font-black text-black/80 tracking-tight uppercase line-clamp-1">
                {businessName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-4">
             <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">{overall}/ 100</span>
          </div>

          <div className="flex items-center gap-3">
            {onReAudit && (
              <button
                onClick={onReAudit}
                disabled={isAuditing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isAuditing ? 'bg-primary/50 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-95'}`}
              >
                {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAuditing ? 'Auditing...' : 'Re-Audit'}
              </button>
            )}

            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 hover:bg-rose-500 text-black/40 hover:text-white transition-all active:scale-90 border border-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Main Grid: Verdict & Social */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Verdict (Always present) */}
            <div className="md:col-span-7 p-6 rounded-3xl bg-white/80 border border-white shadow-sm flex flex-col justify-center min-h-[140px]">
              <div className="flex items-center gap-2 mb-3 opacity-30">
                <Search className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">AI Verdict</span>
              </div>
              <p className="text-base md:text-lg font-bold text-black/70 italic leading-snug">
                "{oneLiner}"
              </p>
            </div>

            {/* Social (Always present) */}
            <div className="md:col-span-5 p-6 rounded-3xl bg-indigo-600 text-white shadow-lg flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Digital Footprint</span>
                 <Share2 className="w-3 h-3 opacity-60" />
              </div>
              <div className="flex flex-wrap gap-2">
                  {socialLinks ? socialLinks.split(',').map((link, i) => {
                    const cleanLink = link.includes(':') ? link.split(': ')[1] : link;
                    return (
                      <a key={i} href={cleanLink?.trim()} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white text-white hover:text-indigo-600 transition-all border border-white/30 shadow-sm group/soc active:scale-95">
                        <i className={`${getSocialIcon(cleanLink?.trim() || '').replace(/text-\[[^\]]+\]|text-\w+-\d+/g, '')} text-base group-hover:scale-110 transition-transform`} />
                      </a>
                    );
                  }) : (
                    <p className="text-[9px] font-bold opacity-40 py-2">No Assets Found</p>
                  )}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                 <Mail className="w-3 h-3 opacity-60" />
                 <span className="text-[9px] font-black truncate uppercase tracking-wider">{emails?.split(',')[0] || "No Verified Email"}</span>
              </div>
            </div>
          </div>

          {/* Metrics Visualization: Always show the 4 metrics to prevent "odd" layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CompactMetric score={ux100} label="UI / UX Design" color="text-indigo-500" icon={Globe} />
            <CompactMetric score={seo100} label="Search Engine" color="text-sky-500" icon={Zap} />
            <CompactMetric score={perf100} label="Technical / Speed" color="text-emerald-500" icon={Activity} />
            <CompactMetric score={respo100} label="Responsiveness" color="text-rose-500" icon={ShieldCheck} />
          </div>

          {/* Action Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {auditReportUrl && (
              <button
                onClick={() => window.open(getFullUrl(auditReportUrl), "_blank", "noopener")}
                className="group/btn flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-600 transition-all shadow-sm"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-100 group-hover/btn:bg-white/20 transition-colors">
                  <Eye className="w-5 h-5 text-indigo-600 group-hover/btn:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-indigo-600 group-hover/btn:text-white">Live Audit</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-black/30 group-hover/btn:text-white/60">Full Technical Explorer</p>
                </div>
              </button>
            )}
            {leadFolder && (
              <button
                onClick={() => {
                  const base = (process.env.NEXT_PUBLIC_API_URL || "https://leadbackend.onlinetoolpot.com").replace(/\/$/, "");
                  window.open(`${base}/storage/${leadFolder}/audit_report.pdf`, "_blank", "noopener");
                }}
                className="group/btn flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100 hover:bg-rose-600 transition-all shadow-sm"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-100 group-hover/btn:bg-white/20 transition-colors">
                  <FileText className="w-5 h-5 text-rose-600 group-hover/btn:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-rose-600 group-hover/btn:text-white">Premium PDF</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-black/30 group-hover/btn:text-white/60">High-Fidelity Document</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-8 py-4 bg-white/60 border-t border-white/80 flex items-center justify-between text-[8px] font-black text-black/20 uppercase tracking-[0.3em]">
          <p>LeadStation Analysis Core 7.4</p>
          <p>Confidential Stream</p>
        </div>
      </div>
    </div>
  );
}
