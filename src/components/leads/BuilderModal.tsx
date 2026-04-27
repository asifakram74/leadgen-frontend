"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Sparkles, Loader2, Globe, MapPin, Phone, Tag,
  Lightbulb, ArrowRight
} from "lucide-react";
import api from "@/lib/api";

interface LeadData {
  id?: string;
  name: string;
  category?: string;
  website?: string;
  address?: string;
  phone?: string;
  emails?: string;
  rating?: string;
  reviews?: string;
  maps_url?: string;
  ai_report?: string;
  ai_status?: string;
  ai_reason?: string;
  audit_report_url?: string;
  lead_folder?: string;
  place_id?: string;
  generated_site_url?: string;
  generated_domain?: string;
}

interface BuilderModalProps {
  lead: LeadData;
  mode: "create" | "recreate";
  onClose: () => void;
  onSuccess: (url: string, domain: string) => void;
}

const PROMPT_CHIPS = [
  "Make it modern with a dark theme",
  "Use bright, vibrant colors",
  "Add a contact booking form",
  "Include a photo gallery section",
  "Focus on showcasing the menu",
  "Highlight customer reviews",
  "Add Google Maps embed",
  "Include WhatsApp chat button",
];

export default function BuilderModal({ lead, mode, onClose, onSuccess }: BuilderModalProps) {
  const [prompt, setPrompt] = useState(
    `You are an expert front-end developer and UI/UX designer.

### Input Variables (Context):
- **Business Category:** ${lead.category || "Business"}
- **Website Analysis Report:** ${lead.ai_report ? lead.ai_report.replace(/\n/g, " ").substring(0, 500) + "..." : "N/A"}
- **Original Website URL:** ${lead.website || "N/A"}
- **Lead Info:** Name: ${lead.name}, Phone: ${lead.phone || "N/A"}, Address: ${lead.address || "N/A"}

---

### Your Primary Mission:
You are building a high-conversion, professional website. 

#### 1. Content Harvesting (CRITICAL)
- **Use Real Data**: If the Analysis Report or URL contains ANY real text (About Us, Services, Menu items, Testimonials), YOU MUST USE IT. Avoid placeholders if real content is available.
- **Image Intelligence**: Use the **Business Category** to pick the most relevant Unsplash keywords. 
  - *Example*: If category is "Ice Cream Shop", use keywords like \`gelato\`, \`ice-cream-parlor\`, \`sprinkles\`.
  - *Example*: If category is "Bakery", use \`fresh-croissants\`, \`artisanal-bread\`.

#### 2. Layout Intent (Industry-Specific)
- **Food/Ice Cream/Bakery/Cafe/Restaurant**: Prioritize "Mouth-watering" Hero sections, full Menus, "Order Online" or "Reserve" buttons, and Location/Hours.
- **Service Businesses**: Prioritize "Get a Quote", Trust Badges, and Service Grids.

#### 3. Visual DNA Inheritance
- Mirror the original site's color palette (e.g., Maroon/Cream/Gold) and branding style modernized.

#### 4. Audit Resolutions (MANDATORY)
- **Fix SEO**: Address missing meta descriptions, structured data, and ensure perfect semantic HTML hierarchy (H1, H2, H3).
- **Responsiveness**: Guarantee a mobile-first, fluid layout that adapts flawlessly to all screen sizes.
- **UI/UX & User Experience**: Create a frictionless, modern, and highly-accessible interface that solves ALL issues flagged in the Analysis Report.

---

### Design Guidelines:
- **Logo**: Use the original logo URL if found in the report. If not, create a text-based logo in the brand's primary color.
- **Color Locking**: Use the exact brand colors mentioned in the report for CTAs and accents.
- **Images**: Use \`https://images.unsplash.com/featured/800x600/?${lead.category ? encodeURIComponent(lead.category) : "business"}\` using the most specific keywords from the Category.

### Output Format:
Return **ONLY valid HTML/CSS code** inside a single code block. No explanations. The <title> tag must exactly match the brand name "${lead.name}".`
  );
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on open
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isBuilding) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, isBuilding]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const appendChip = (chip: string) => {
    setPrompt(prev => prev ? `${prev.trim()}, ${chip.toLowerCase()}` : chip);
    textareaRef.current?.focus();
  };

  // Simulated progress
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isBuilding) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress(p => {
        // slow down as it gets closer to 100
        const increment = p < 50 ? 5 : p < 80 ? 2 : 1;
        return p < 95 ? p + increment : p;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBuilding]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("Please provide a prompt or use a suggestion.");
      return;
    }

    setIsBuilding(true);
    setError("");
    setProgress(0);
    try {
      const res = await api.post("/api/builder/generate", {
        job_uuid: lead.id,
        place_id: lead.place_id || "",
        name: lead.name,
        category: lead.category || "Business",
        address: lead.address || "",
        phone: lead.phone || "",
        email: lead.emails?.split(",")[0] || "",
        rating: lead.rating || "0",
        reviews: lead.reviews || "0",
        website: lead.website || "",
        maps_url: lead.maps_url || "",
        ai_report: lead.ai_report || "",
        ai_status: lead.ai_status || "",
        ai_reason: lead.ai_reason || "",
        audit_report_url: lead.audit_report_url || "",
        lead_folder: lead.lead_folder || "",
        user_prompt: prompt.trim(),
      });

      if (res.data?.url) {
        onSuccess(res.data.url, res.data.generated_domain || "");
        onClose();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Build failed. Please try again.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card/95 backdrop-blur-3xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 rounded-3xl">

        {/* Integrated Header & Context Bar - Ultra Compact */}
        <div className="px-8 py-4 bg-white/5 border-b border-white/5 relative z-10">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-tight text-foreground truncate">
                  {mode === "recreate" ? "Re-engineer Identity" : "Site Intelligence"}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/10 shrink-0">
                    <Tag className="w-2.5 h-2.5 text-primary" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">{lead.category || "Business"}</span>
                  </div>
                  <span className="text-[9px] text-foreground/20 font-bold truncate shrink">{lead.address || "Global Target"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {lead.phone && (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
                  <Phone className="w-3 h-3" />
                  <span className="text-[10px] font-black">{lead.phone}</span>
                </div>
              )}
              <button
                onClick={onClose}
                disabled={isBuilding}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-foreground/40 hover:text-foreground disabled:opacity-50 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Single Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="px-8 py-8 space-y-8">
          {/* Prompt Field */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-3 h-3 text-primary" />
                </div>
                Prompt Configuration
              </label>
              <span className="text-[10px] font-bold text-primary/60 italic">Custom instruction override active</span>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-all pointer-events-none" />
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={`Describe the desired output for ${lead.name}...`}
                rows={10}
                className="relative w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-mono text-foreground/80 placeholder:text-foreground/20 resize-none outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all leading-relaxed custom-scrollbar shadow-inner"
              />
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Rapid Injection Chips</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendChip(chip)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 text-[10px] font-bold text-foreground/60 hover:text-primary transition-all active:scale-95"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 animate-in slide-in-from-top-2 duration-300">
              <Sparkles className="w-4 h-4 shrink-0 rotate-180" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>

        {/* Footer actions */}
        <div className="px-8 py-6 bg-white/5 border-t border-white/5 space-y-6 relative z-10">

          {/* Progress Bar */}
          {isBuilding && (
            <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span className="animate-pulse">Synthesizing Codebase...</span>
                </div>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary via-indigo-500 to-violet-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              disabled={isBuilding}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-foreground/60 font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-50"
            >
              Abort Operation
            </button>
            <button
              onClick={handleSubmit}
              disabled={isBuilding}
              className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-violet-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] text-white font-black uppercase tracking-[0.1em] text-[11px] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Commence Generation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
