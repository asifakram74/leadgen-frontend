"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Sparkles, Loader2, Search, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, History, X, Filter, Settings2, SlidersHorizontal, Globe, CheckSquare, XSquare, Activity, XOctagon, Clock } from "lucide-react";

// Premium Modular Components
import LeadsHeader from "@/components/leads/LeadsHeader";
import ScrapeForm from "@/components/leads/ScrapeForm";
import StatsGrid from "@/components/leads/StatsGrid";
import LeadCard from "@/components/leads/LeadCard";
import HistoryTable from "@/components/leads/HistoryTable";
import AuditSummaryModal from "@/components/leads/AuditSummaryCard";
import FloatingNav from "@/components/leads/FloatingNav";
import VaultSidebar from "@/components/leads/VaultSidebar";

import { leadService } from "@/services/scrapeService";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ScrapedResult {
  id?: string;
  place_id?: string;
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
  ai_status?: string;
  ai_report?: string;
  ai_reason?: string;
  audit_report_url?: string;
  generated_site_url?: string;
  lead_folder?: string;
  generated_domain?: string;
}

import FilterActionBar from "@/components/leads/FilterActionBar";

export default function LeadsCenter() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [maxResults, setMaxResults] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScrapedResult[]>([]);
  const [stats, setStats] = useState<{ total: number; trustworthy: number; csvUrl?: string; jsonUrl?: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [jobStatus, setJobStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ScrapedResult | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [filterWebsite, setFilterWebsite] = useState<"all" | "yes" | "no" | "generated">("all");
  const [filterAudit, setFilterAudit] = useState<string>("all");
  const [isBulkAuditing, setIsBulkAuditing] = useState(false);
  const [isBulkBuilding, setIsBulkBuilding] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [isGlobalAuditing, setIsGlobalAuditing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [historyScope, setHistoryScope] = useState<"mine" | "all">("mine");

  const role = useSelector((state: RootState) => state.auth.role);
  const isAdmin = role === "super_admin" || role === "admin";

  const fetchHistory = async () => {
    try {
      const data = await leadService.getTasks(historyScope);
      setHistory(data);
    } catch (e) {
      console.error("Failed to load DB history", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [historyScope]);

  // ─── Filtering Logic ──────────────────────────────────────────
  const filteredResults = results.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWebsite = filterWebsite === "all" ||
      (filterWebsite === "yes" ? !!item.website :
        filterWebsite === "no" ? !item.website :
          filterWebsite === "generated" ? !!item.generated_site_url : true);

    const matchesAudit = filterAudit === "all" ||
      (filterAudit === "healthy" && item.ai_status?.toLowerCase().includes("healthy")) ||
      (filterAudit === "issues" && item.ai_status?.toLowerCase().includes("issues")) ||
      (filterAudit === "error" && item.ai_status?.toLowerCase().includes("error")) ||
      (filterAudit === "unreachable" && item.ai_status?.toLowerCase().includes("unreachable")) ||
      (filterAudit === "pending" && (item.ai_status?.toLowerCase().includes("pending") || !item.ai_status));

    return matchesSearch && matchesWebsite && matchesAudit;
  });

  // ─── Bulk Action: Audit All ───────────────────────────────────
  const handleBulkAudit = async () => {
    const toAudit = filteredResults.filter(r => !!r.website && (!r.audit_report_url || r.ai_status?.includes("Error") || r.ai_status?.includes("Pending")));
    if (toAudit.length === 0) {
      toast.info("No leads in current view require auditing.");
      return;
    }

    setIsBulkAuditing(true);
    setBulkProgress(0);
    toast.info(`Starting bulk audit for ${toAudit.length} leads...`);

    let completed = 0;
    // Process in small parallel chunks to avoid overwhelming the server
    const CHUNK_SIZE = 3;
    for (let i = 0; i < toAudit.length; i += CHUNK_SIZE) {
      const chunk = toAudit.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (lead) => {
        try {
          const updated = await leadService.analyzeLead(lead.id!);
          setResults(prev => prev.map(r => r.maps_url === lead.maps_url ? { ...r, ...updated } : r));
        } catch (e) {
          console.error("Bulk Audit Error:", e);
        } finally {
          completed++;
          setBulkProgress(Math.round((completed / toAudit.length) * 100));
        }
      }));
    }

    setIsBulkAuditing(false);
    toast.success("Bulk audit sequence complete!");
  };

  // ─── Bulk Action: Build All ────────────────────────────────────
  const handleBulkBuild = async () => {
    const toBuild = filteredResults.filter(r => r.ai_status?.toLowerCase().includes("issues") && !r.generated_site_url);
    if (toBuild.length === 0) {
      toast.info("No leads in current view require site generation.");
      return;
    }

    setIsBulkBuilding(true);
    setBulkProgress(0);
    toast.info(`Starting bulk site generation for ${toBuild.length} leads...`);

    let completed = 0;
    for (let i = 0; i < toBuild.length; i += 1) { // Builders are heavier, process 1 by 1
      const lead = toBuild[i];
      try {
        const defaultPrompt = `You are an expert front-end developer and UI/UX designer.

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
Return **ONLY valid HTML/CSS code** inside a single code block. No explanations. The <title> tag must exactly match the brand name "${lead.name}".`;

        const payload = {
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
          user_prompt: defaultPrompt,
        };
        const updated = await leadService.generateSite(payload);
        setResults(prev => prev.map(r => r.maps_url === lead.maps_url ? { ...r, ...updated } : r));
      } catch (e) {
        console.error("Bulk Build Error:", e);
      } finally {
        completed++;
        setBulkProgress(Math.round((completed / toBuild.length) * 100));
      }
    }

    setIsBulkBuilding(false);
    toast.success("Bulk site generation sequence complete!");
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://leadgenbackend.onlinetoolpot.com";
      const fullUrl = `${apiUrl}${url}`;
      const response = await fetch(fullUrl, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl; link.download = filename;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); window.URL.revokeObjectURL(blobUrl);
      toast.success("Download Successful");
    } catch (err) {
      toast.error("Download Failed");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await leadService.deleteTask(itemToDelete);
      setHistory(prev => prev.filter(item => item.id !== itemToDelete));
      toast.success("Extraction Deleted");
    } catch (err: any) {
      toast.error("Delete Failed");
    } finally {
      setIsDeleting(false); setItemToDelete(null);
    }
  };


  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !location) return;
    if (pollRef.current) clearInterval(pollRef.current);

    setLoading(true);
    setError(null);
    setStats(null);
    setJobStatus("queued");
    setResults([]); // Reset results for a new fresh scrape

    try {
      const payload: any = { category, location };
      if (maxResults.trim() !== "") payload.max_results = parseInt(maxResults, 10);
      const { job_id } = await leadService.startlead(payload);

      pollRef.current = setInterval(async () => {
        try {
          const job = await leadService.getJobStatus(job_id);
          setJobStatus(job.status);

          // Push data into state as it arrives without disabling the global loading state
          if (job.data && Array.isArray(job.data) && job.data.length > 0) {
            setResults(job.data);
            setStats({
              total: job.count,
              trustworthy: job.data.filter((r: any) => r.is_trustworthy === "Trustworthy").length,
              csvUrl: job.csv_url,
              jsonUrl: job.json_url
            });
          }

          if (job.status === "done") {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;

            if (job.json_url) {
              const finalData = await leadService.getJobResults(job.json_url);
              setResults(finalData);
            }
            setLoading(false); // Finally stop the sync state
            setJobStatus("");
            await fetchHistory();
            toast.success("Matrix Extraction Complete");

            // ─── AUTO-AUDIT: Trigger bulk audit automatically if leads were found ────────
            if (job.data && job.data.length > 0) {
              const pendingCount = job.data.filter((r: any) => r.website && (!r.ai_status || r.ai_status.includes("Pending"))).length;
              if (pendingCount > 0) {
                toast.info(`Automating intelligence audit for ${pendingCount} new leads...`);
                // Use setTimeout to ensure state is settled before triggering
                setTimeout(() => handleBulkAudit(), 1000);
              }
            }
          } else if (job.status === "error") {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setError(job.error || "Extraction failed");
            setLoading(false);
          }
        } catch (pollErr: any) {
          console.error("Polling error:", pollErr);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message); setLoading(false);
    }
  };

  const handleViewHistory = async (job: any) => {
    try {
      setLoading(true);
      const query = job.query_string || "";
      const splitRegex = /(.+?)\s+in\s+(.*)/i;
      const match = query.match(splitRegex);

      if (match) {
        setCategory(match[1].trim());
        setLocation(match[2].trim());
      } else {
        setCategory(query);
        setLocation(job.location || "");
      }

      setMaxResults(job.count?.toString() || "");

      let leadData;
      if (job.json_url) {
        leadData = await leadService.getJobResults(job.json_url);
      }

      if (!leadData || !Array.isArray(leadData)) {
        toast.error("Corrupted Matrix Record: No data found");
        setLoading(false);
        return;
      }

      setResults(leadData);
      setStats({
        total: job.count || leadData.length,
        trustworthy: leadData.filter((r: any) => r.is_trustworthy === "Trustworthy").length,
        csvUrl: job.csv_url,
        jsonUrl: job.json_url
      });

      setIsArchiveOpen(false);
      toast.success("Intelligence Record Restored");
    } catch (err) {
      console.error("Vault restoration failed:", err);
      toast.error("Failed to restore record");
    } finally {
      setLoading(false);
    }
  };

  // Modular Radar Component for clean code
  const RadarStatus = ({ status, text }: { status: string; text: string }) => (
    <div className="py-20 flex flex-col items-center justify-center">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_3s_infinite]"></div>
        <div className="absolute inset-4 rounded-full border border-primary/10 animate-[ping_4s_infinite_1s]"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-primary/40 animate-spin"></div>
        <div className="relative z-10 w-16 h-16 bg-card border-2 border-primary/30 rounded-full flex items-center justify-center shadow-2xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
      <div className="mt-8 text-center space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">
          {status || "Synchronizing"}
        </div>
        <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest italic">{text}</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pb-24 bg-indigo-500/10 relative">

      <FloatingNav
        loading={loading}
        hasResults={results.length > 0}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        setIsArchiveOpen={setIsArchiveOpen}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <LeadsHeader />

        <div>
          <ScrapeForm category={category} setCategory={setCategory} location={location} setLocation={setLocation} maxResults={maxResults} setMaxResults={setMaxResults} loading={loading} onSubmit={handleScrape} />

          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <StatsGrid stats={stats} handleDownload={handleDownload} category={category} location={location} loading={loading} />
        </div>

        {/* ─── INITIAL LOADER: Only shown before first data point ─── */}
        {results.length === 0 && loading && (
          <RadarStatus status={jobStatus} text="Scanning Global Matrix..." />
        )}

        {/* ─── RESULTS & FILTERS ─── */}
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 min-h-[400px]">
          {results.length > 0 && (() => {
            const toBuildCount = filteredResults.filter(r => r.ai_status?.toLowerCase().includes("issues") && !r.generated_site_url).length;
            const toAuditCount = filteredResults.filter(r => !r.ai_status || r.ai_status === "Pending..." || r.ai_status === "Analysis Error").length;

            return (
              <>
                {/* Filter & Action Bar */}
                <FilterActionBar
                  isFilterOpen={isFilterOpen}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterWebsite={filterWebsite}
                  setFilterWebsite={setFilterWebsite}
                  filterAudit={filterAudit}
                  setFilterAudit={setFilterAudit}
                  handleBulkAudit={handleBulkAudit}
                  handleBulkBuild={handleBulkBuild}
                  isBulkAuditing={isBulkAuditing}
                  isBulkBuilding={isBulkBuilding}
                  toAuditCount={toAuditCount}
                  toBuildCount={toBuildCount}
                  bulkProgress={bulkProgress}
                  filteredCount={filteredResults.length}
                />

                {/* Grid Header */}
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-foreground">Discovery Matrix</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">
                        Showing {filteredResults.length} Intelligence Points
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredResults.map((item, idx) => (
                    <LeadCard key={idx} item={item} onViewAudit={() => setSelectedAudit(item)} />
                  ))}
                </div>

                {loading && (
                  <div className="border-t border-indigo-500/10 pt-10 mt-10">
                    <RadarStatus status={jobStatus || "Syncing Batches"} text="Injecting Continuous Intelligence..." />
                  </div>
                )}
              </>
            );
          })()}

          {results.length === 0 && !loading && (
            <div className="py-20 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50 italic">Grid Isolated - No Data Injected</p>
            </div>
          )}
        </div>

        <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Extraction?" description="This record will be permanently purged from the matrix storage." confirmText="Delete" />

        {/* ── Global Audit Intelligence Modal ─────────── */}
        {selectedAudit && (
          <AuditSummaryModal
            isOpen={!!selectedAudit}
            onClose={() => setSelectedAudit(null)}
            aiReport={selectedAudit.ai_report || ""}
            auditReportUrl={selectedAudit.audit_report_url}
            leadFolder={selectedAudit.lead_folder}
            businessName={selectedAudit.name}
            socialLinks={selectedAudit.social_links}
            whatsapp={selectedAudit.whatsapp}
            emails={selectedAudit.emails}
            isAuditing={isGlobalAuditing}
            onReAudit={async () => {
              if (!selectedAudit?.id) return;
              try {
                setIsGlobalAuditing(true);
                const { default: api } = await import("@/lib/api");
                const response = await api.post("/api/lead/re-audit", { lead_id: selectedAudit.id });
                const updatedLead = response.data;

                // Update local modal data instantly
                setSelectedAudit(updatedLead);
                // Sync with main grid
                setResults(prev => prev.map(r => r.id === updatedLead.id ? { ...r, ...updatedLead } : r));

                toast.success("Intelligence audit updated successfully!");
              } catch (err) {
                console.error("Global Audit Error:", err);
                toast.error("Failed to complete audit. Please try again.");
              } finally {
                setIsGlobalAuditing(false);
              }
            }}
          />
        )}

        {/* ── Vault Sidebar (History) ─────────── */}
        <VaultSidebar
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          history={history}
          handleDownload={handleDownload}
          setItemToDelete={(id) => setItemToDelete(id)}
          handleViewHistory={handleViewHistory}
          isAdmin={isAdmin}
          scope={historyScope}
          setScope={setHistoryScope}
          role={role || ""}
        />
      </div>
    </main>
  );
}