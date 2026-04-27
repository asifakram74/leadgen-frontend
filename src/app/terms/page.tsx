export default function TermsOfService() {
  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mb-8">Terms of Service</h1>
        
        <div className="bg-card/50 backdrop-blur-xl border-x border-b border-border p-8 md:p-12 rounded-3xl text-foreground/70 space-y-6 shadow-2xl relative overflow-hidden flex flex-col pt-10">
          <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>
          <p className="text-lg">Effective Date: April 2026</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By registering on the platform, you legally bind yourself to the operating parameters dictated by LeadStation Pro. Unauthorized extraction, reverse engineering, and mass-spam manipulation of the internal API layers outside standard operational workflows provided by the UI are strictly prohibited.</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Subscription Licensing</h2>
          <p>If operating under commercial licenses, access capabilities scale according to subscription configurations. Platform administrators maintain independent authority to audit, throttle, or terminate node connections abusing mapped query parameters.</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. External Compliance</h2>
          <p>The user represents and warrants that scraped location data gathered strictly adheres to local data regulatory statutes (e.g. GDPR, CCPA) within their respective domains before integrating mapped arrays into external marketing flows.</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}
