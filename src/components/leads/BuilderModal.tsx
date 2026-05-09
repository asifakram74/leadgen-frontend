"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Sparkles, Loader2, Globe, MapPin, Phone, Tag,
  Lightbulb, ArrowRight, Zap, Moon, Palette, Calendar, Image, Utensils, Star, MessageCircle, ShieldAlert,
  Crown, Activity, Leaf, Terminal, Cpu, Rocket, Brain, Bolt, ChevronDown, User as UserIcon, BarChart3
} from "lucide-react";
import api from "@/lib/api";
import ModelSelector, { AVAILABLE_MODELS } from "./ModelSelector";
import { toast } from "sonner";

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
  audit_report_html_url?: string;
  audit_report_pdf_url?: string;
  lead_folder?: string;
  job_uuid?: string;
  place_id?: string;
  generated_site_url?: string;
  generated_domain?: string;
}

interface BuilderModalProps {
  lead?: LeadData; // Optional for bulk mode
  bulkLeads?: LeadData[]; // Used in bulk build mode
  mode: "create" | "recreate" | "bulk";
  onClose: () => void;
  onSuccess?: (url: string, domain: string) => void;
  onBulkSuccess?: (results: { id: string, url: string, domain: string }[]) => void;
}

const PROMPT_CHIPS = [
  { label: "Modern Dark Theme", icon: Moon },
  { label: "Elite FAQ Section", icon: ShieldAlert },
  { label: "Meet the Team", icon: UserIcon },
  { label: "Service Pricing Table", icon: Tag },
  { label: "Testimonials Grid", icon: Star },
  { label: "Before & After Gallery", icon: Image },
  { label: "Add Google Maps embed", icon: MapPin },
  { label: "WhatsApp Chat Button", icon: MessageCircle },
  { label: "Vibrant & Bright Colors", icon: Palette },
  { label: "Contact Booking Form", icon: Calendar },
  { label: "Detailed Photo Gallery", icon: Image },
  { label: "Showcase Services Menu", icon: Utensils },
  { label: "Highlight Star Reviews", icon: Star },
  { label: "Video Hero Background", icon: Rocket },
  { label: "AI Smart Content", icon: Brain },
  { label: "SEO Meta Mastery", icon: BarChart3 },
  { label: "Insurance & Partners", icon: Globe },
];

export default function BuilderModal({ lead, bulkLeads, mode, onClose, onSuccess, onBulkSuccess }: BuilderModalProps) {
  const [prompt, setPrompt] = useState(
    `### MASTER ARCHITECT DIRECTIVE:
You are an Elite UI/UX Engineer. Build a world-class, high-conversion website for: **${lead?.name || bulkLeads?.[0]?.name || "N/A"}**.

---

### 1. IDENTITY & CONTEXT:
- **Business Category**: ${lead?.category || bulkLeads?.[0]?.category || "General Business"}
- **Analysis Intelligence**: ${lead?.ai_report?.substring(0, 500) || bulkLeads?.[0]?.ai_report?.substring(0, 500) || "N/A"}
- **Original Asset**: ${lead?.website || bulkLeads?.[0]?.website || "N/A"}
- **Contact Protocol**: ${lead?.phone || "N/A"} | ${lead?.address || "N/A"}

---

### 2. DESIGN BLUEPRINT (PRO-LEVEL):
- **Visual DNA**: Modernize the brand's color palette (e.g., from analysis) into a premium, fluid aesthetic.
- **Industry Intent**: If Medical/Service, prioritize 'Trust & Booking'. If Food/Retail, prioritize 'Mouth-watering Visuals & Menu'.
- **Typography**: Use clean, modern sans-serif fonts with generous white space and high-contrast accessibility.

---

### 3. TECHNICAL MANDATES (STRICT):
- **Icons**: Use **FontAwesome 6 Free** (\`<i class="fa-solid fa-...">\`). DO NOT use SVGs or emojis.
- **Photography**: Use real business photos from the lead data if available. 
- **Fallback**: If no real photos, use LoremFlickr (\`https://loremflickr.com/800/600/[keyword]\`). Use **STRICTLY ONE-WORD** keywords.
- **Hero Layout**: Content must be **strictly left-aligned** or use a split layout (text left, image right). No center-aligning.
- **SEO & Schema**: Implement perfect semantic HTML (H1, H2, H3), meta tags, and Schema.org local business markup.
- **Maps**: Embed a responsive Google Maps iframe for the provided address.

---

### 4. FINAL OUTPUT:
Return ONLY the valid, single-file HTML/CSS/JS code block. No explanations.`
  );
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
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
  const toggleChip = (label: string) => {
    if (selectedChips.includes(label)) {
      setSelectedChips(prev => prev.filter(c => c !== label));
      const cleanLabel = label.toLowerCase();
      setPrompt(prev => prev.replace(new RegExp(`\\n\\n- ${cleanLabel}.*`, 'g'), ''));
    } else {
      setSelectedChips(prev => [...prev, label]);
      let instruction = label.toLowerCase();
      // Enhanced Map Instruction with real address
      if (label === "Add Google Maps embed") {
        const address = lead?.address || lead?.name || "[Business Address]";
        instruction = `add a precise Google Maps embed section for the address: ${address}`;
      }
      setPrompt(prev => prev ? `${prev.trim()}\n\n- ${instruction}` : instruction);
    }

    // Auto-scroll to bottom of prompt to show the update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);

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

    const leadsToProcess = mode === "bulk" && bulkLeads ? bulkLeads : (lead ? [lead] : []);
    const total = leadsToProcess.length;
    const results: { id: string, url: string, domain: string }[] = [];

    try {
      for (let i = 0; i < total; i++) {
        const currentLead = leadsToProcess[i];

        const res = await api.post("/api/builder/generate", {
          model_id: selectedModel,
          lead_id: currentLead.id,
          name: currentLead.name,
          category: currentLead.category || "",
          phone: currentLead.phone || "",
          email: currentLead.emails?.split(",")[0] || "",
          rating: currentLead.rating || "0",
          reviews: currentLead.reviews || "0",
          website: currentLead.generated_site_url || "",
          maps_url: currentLead.maps_url || "",
          address: currentLead.address || "",
          ai_report: currentLead.ai_report || "",
          ai_status: currentLead.ai_status || "",
          ai_reason: currentLead.ai_reason || "",
          audit_report_html_url: currentLead.audit_report_html_url || "",
          audit_report_pdf_url: currentLead.audit_report_pdf_url || "",
          lead_folder: currentLead.lead_folder || "",
          job_uuid: currentLead.job_uuid || "",
          place_id: currentLead.place_id || currentLead.id || "",
          user_prompt: prompt.trim(),
        });

        if (res.data?.url) {
          results.push({
            id: currentLead.id!,
            url: res.data.url,
            domain: res.data.generated_domain || ""
          });

          if (mode !== "bulk") {
            toast.success("Intelligence Ready", {
              description: `Website for ${currentLead.name} is now live!`,
            });
            onSuccess?.(res.data.url, res.data.generated_domain || "");
          }
        }

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      if (mode === "bulk") {
        toast.success("Bulk Build Complete", {
          description: `Successfully generated ${results.length} websites!`,
        });
        onBulkSuccess?.(results);
      }

      onClose();
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || "";

      let title = "Intelligence Interrupted";
      let description = "An unexpected error occurred during generation.";

      if (status === 429 || detail.toLowerCase().includes("quota")) {
        title = "Quota Limit Reached";
        description = "Free tier limit hit. Switch to DeepSeek or wait a moment.";
      } else if (detail) {
        description = detail;
      }

      setError(description);
      toast.error(title, { description });
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
        <div className="px-8 py-4 bg-white/5 border-b border-white/5 relative z-20">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-tight text-foreground truncate">
                  {mode === "bulk" ? `Bulk Engineer (${bulkLeads?.length} Sites)` : mode === "recreate" ? "Re-engineer Identity" : "Site Intelligence"}
                </h2>

                {/* Model Selector Component */}
                <div className="mt-1">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onSelect={setSelectedModel}
                    disabled={isBuilding}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {mode !== "bulk" && lead?.phone && (
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
                  placeholder={`Describe the desired output for ${lead?.name || "this batch of sites"}...`}
                  rows={10}
                  className="relative w-full bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-[11px] font-mono text-foreground/80 placeholder:text-foreground/20 resize-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all leading-relaxed custom-scrollbar shadow-inner"
                />
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-indigo-500" />
                </div>
                Rapid Injection Chips
              </label>
              <div className="flex flex-wrap gap-2">
                {PROMPT_CHIPS.map((chip, idx) => {
                  const isSelected = selectedChips.includes(chip.label);
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleChip(chip.label)}
                      disabled={isBuilding}
                      className={`px-3 py-2 rounded-xl transition-all active:scale-95 text-[10px] font-bold flex items-center gap-2 ${isSelected
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        : "bg-white/5 border-white/5 text-foreground/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        } border disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-foreground/30"}`} />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-4 text-rose-500 animate-in slide-in-from-top-4 duration-500 shadow-2xl shadow-rose-500/10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Operation Interrupted</p>
                  <p className="text-[11px] font-bold leading-relaxed">{error}</p>
                  <p className="text-[9px] font-medium opacity-70">Switch to a different model like **DeepSeek R1** to continue.</p>
                </div>
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
