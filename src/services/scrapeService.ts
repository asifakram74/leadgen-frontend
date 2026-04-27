import api from "../lib/api";

export const leadService = {
  /**
   * Starts a new Google Maps scraping job in the background.
   * Returns immediately with { job_id, status, query }.
   * Endpoint: POST /api/lead
   */
  startlead: async (params: { category: string; location: string; max_results?: number }) => {
    const response = await api.post("/api/lead", params);
    return response.data;
  },

  /**
   * Polls the status of a running lead job.
   * Returns: { status: 'queued' | 'running' | 'done' | 'error', count?, csv_url?, json_url?, error? }
   * NOTE: Does NOT return full data array — use getJobResults() for that.
   * Endpoint: GET /api/lead/{job_id}
   */
  getJobStatus: async (jobId: string) => {
    const response = await api.get(`/api/lead/${jobId}`);
    return response.data;
  },

  /**
   * Fetches the full leadd results from the exported JSON file on disk.
   * Called after polling returns status === 'done'.
   * Endpoint: GET /storage/exports/export_{jobId}.json (static file)
   */
  getJobResults: async (jsonUrl: string): Promise<any[]> => {
    const response = await api.get(jsonUrl);
    return response.data;
  },

  /**
   * Fetches the historical list of completed scraping jobs for the current user.
   * Endpoint: GET /api/leads
   */
  getTasks: async (scope: string = "mine") => {
    const response = await api.get(`/api/leads?scope=${scope}`);
    return response.data;
  },

  /**
   * Deletes a specific lead job and its files.
   * Endpoint: DELETE /api/lead/{jobId}
   */
  deleteTask: async (jobId: number) => {
    const response = await api.delete(`/api/lead/${jobId}`);
    return response.data;
  },

  /**
   * Generates the full URL for downloading the audit PDF.
   * Endpoint: /api/builder/download-audit/{folder_name}
   */
  downloadAuditReport: async (folderName: string) => {
    const response = await api.get(`/api/builder/download-audit/${encodeURIComponent(folderName)}`, {
      responseType: 'blob', 
    });

    // 1. Get the filename from the Backend's header! 
    // This ensures .html stays .html and .pdf stays .pdf
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `Audit_${folderName}.pdf`; // default
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename=(.+)/);
      if (fileNameMatch) fileName = fileNameMatch[1];
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // 👈 Use the dynamic filename!
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Triggers a specific AI audit for a lead.
   * Endpoint: POST /api/lead/re-audit
   */
  analyzeLead: async (leadId: string) => {
    const response = await api.post("/api/lead/re-audit", { lead_id: leadId });
    return response.data;
  },

  /**
   * Triggers the AI website builder for a specific lead.
   * Endpoint: POST /api/builder/generate
   */
  generateSite: async (payload: any) => {
    const response = await api.post("/api/builder/generate", payload);
    return response.data;
  },

  /**
   * Fetches location suggestions based on a partial string.
   * Endpoint: GET /api/locations/suggest?q=...
   */
  suggestLocations: async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return [];
    const response = await api.get(`/api/locations/suggest?q=${encodeURIComponent(query)}`);
    return response.data;
  },

};

