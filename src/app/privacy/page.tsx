export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mb-8">Privacy Policy</h1>
        
        <div className="bg-card/50 backdrop-blur-xl border-x border-b border-border p-8 md:p-12 rounded-3xl text-foreground/70 space-y-6 shadow-2xl relative overflow-hidden flex flex-col pt-10">
          <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>
          <p className="text-lg">Last Updated: April 2026</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Data Collection</h2>
          <p>We are extremely committed to the strict preservation of your global search data securely within the LeadStation platform bounds. At LeadStation, we monitor basic analytics alongside required payload logic mapping generated exclusively through standard mapping logic flows. All stored user metadata strictly remains within isolated infrastructure modules and cannot be accessed externally.</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Cookies and Tracking</h2>
          <p>We utilize secured session states native to JSON Web Token logic bindings, rather than standard third-party tracking scripts. The cookies present are utilized purely for identity validation hooks and explicit CRM state manipulation locally inside your operational browser instance.</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Data Retention</h2>
          <p>Scrape job execution histories remain linked physically to your operational hash ID. If you physically instruct the platform to eradicate your account (via Users Management hub), all cascading data trees connected to your profile will be entirely purged.</p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}
