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
import BuilderModal from "@/components/leads/BuilderModal";
import FloatingNav from "@/components/leads/FloatingNav";
import VaultSidebar from "@/components/leads/VaultSidebar";
import AuditModelModal from "@/components/leads/AuditModelModal";

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
  audit_report_html_url?: string;
  audit_report_pdf_url?: string;
  audit_report_url?: string;
  generated_site_url?: string;
  lead_folder?: string;
  generated_domain?: string;
}

import FilterActionBar from "@/components/leads/FilterActionBar";

export default function LeadsCenter() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
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
  const [isBulkBuildModalOpen, setIsBulkBuildModalOpen] = useState(false);
  const [leadsToBulkBuild, setLeadsToBulkBuild] = useState<ScrapedResult[]>([]);
  const [isBulkAuditModalOpen, setIsBulkAuditModalOpen] = useState(false);

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
  const handleBulkAudit = async (modelId: string) => {
    const toAudit = filteredResults.filter(r => !!r.website && (!r.audit_report_html_url || r.ai_status?.includes("Error") || r.ai_status?.includes("Pending")));
    if (toAudit.length === 0) {
      toast.info("No leads in current view require auditing.");
      return;
    }

    setIsBulkAuditModalOpen(false);
    setIsBulkAuditing(true);
    setBulkProgress(0);
    toast.info(`Starting bulk audit with ${modelId} for ${toAudit.length} leads...`);

    let completed = 0;
    // Process in small parallel chunks to avoid overwhelming the server
    const CHUNK_SIZE = 2; // Reduced to 2 for bulk to be safer with multiple browser instances
    for (let i = 0; i < toAudit.length; i += CHUNK_SIZE) {
      const chunk = toAudit.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (lead) => {
        try {
          const updated = await leadService.analyzeLead(lead.id!, modelId);
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

  const handleBulkBuild = () => {
    const toBuild = filteredResults.filter(r => r.ai_status?.toLowerCase().includes("issues") && !r.generated_site_url);
    if (toBuild.length === 0) {
      toast.info("No leads in current view require site generation.");
      return;
    }
    setLeadsToBulkBuild(toBuild);
    setIsBulkBuildModalOpen(true);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://leadbackend.onlinetoolpot.com";
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

    // Initial state: We don't clear results yet to allow for a smooth 'Sync' transition
    setLoading(true);
    setError(null);
    let lastLeadCount = 0;

    try {
      const payload: any = { category, location };
      const response = await leadService.startlead(payload);
      const { job_id, data, status, count } = response;

      // --- Instant Discovery Injection ---
      if (data && Array.isArray(data) && data.length > 0) {
        setResults(data);
        lastLeadCount = data.length;
        setJobStatus(status || "running");
        setStats({
          total: count || data.length,
          trustworthy: data.filter((r: any) => r.is_trustworthy === "Trustworthy").length,
          csvUrl: response.csv_url,
          jsonUrl: response.json_url
        });
        toast.info(`Instant Discovery: Synchronizing ${data.length} existing leads with live data...`, {
          icon: <Activity className="w-4 h-4 text-primary animate-pulse" />
        });
      } else {
        setResults([]); // No cache, start fresh
      }

      pollRef.current = setInterval(async () => {
        try {
          const job = await leadService.getJobStatus(job_id);
          setJobStatus(job.status);

          // Push data into state as it arrives
          if (job.data && Array.isArray(job.data)) {
            // Check if we found brand new leads since the last poll
            if (job.data.length > lastLeadCount && lastLeadCount > 0) {
              toast.success(`Matrix Discovery: Found ${job.data.length - lastLeadCount} new businesses!`, {
                description: "Updating your database in real-time.",
                duration: 3000
              });
            }
            lastLeadCount = job.data.length;

            setResults(job.data);
            setStats({
              total: job.count || job.data.length,
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
            setLoading(false);
            setJobStatus("");
            await fetchHistory();
            toast.success("Intelligence Matrix Synchronized", {
              description: `Total ${lastLeadCount} businesses verified and indexed.`
            });

            if (job.data && job.data.length > 0) {
              const pendingCount = job.data.filter((r: any) => r.website && (!r.ai_status || r.ai_status.includes("Pending"))).length;
              if (pendingCount > 0) {
                toast.info(`DeepSeek Intelligence engine is already auditing ${pendingCount} leads in the background...`);
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
          <ScrapeForm category={category} setCategory={setCategory} location={location} setLocation={setLocation} loading={loading} onSubmit={handleScrape} />

          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Audit Modal for Bulk */}
          {isBulkAuditModalOpen && (
            <AuditModelModal
              lead={{ name: "All Filtered Leads" }}
              onClose={() => setIsBulkAuditModalOpen(false)}
              onConfirm={handleBulkAudit}
              isAuditing={isBulkAuditing}
            />
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
            const toAuditCount = filteredResults.filter(r =>
              !r.ai_status ||
              r.ai_status === "Pending..." ||
              r.ai_status === "Analysis Error" ||
              r.ai_status?.toLowerCase().includes("error") ||
              r.ai_status?.toLowerCase().includes("unreachable")
            ).length;

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
                  onAuditAll={() => handleBulkAudit("deepseek-chat")}
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
            auditReportHtmlUrl={selectedAudit.audit_report_html_url}
            auditReportPdfUrl={selectedAudit.audit_report_pdf_url}
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

        {/* ── Bulk Builder Intelligence Modal ─────────── */}
        {isBulkBuildModalOpen && (
          <BuilderModal
            mode="bulk"
            bulkLeads={leadsToBulkBuild}
            onClose={() => setIsBulkBuildModalOpen(false)}
            onBulkSuccess={(res) => {
              // Synchronize all generated sites with the main leads matrix
              setResults(prev => prev.map(lead => {
                const updated = res.find(r => r.id === lead.id);
                if (updated) {
                  return { ...lead, generated_site_url: updated.url, generated_domain: updated.domain };
                }
                return lead;
              }));
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