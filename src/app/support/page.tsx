import { Mail, MessageCircle, PhoneCall } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mb-8">Platform Support Center</h1>
        
        <div className="bg-card/50 backdrop-blur-xl border-x border-b border-border p-8 md:p-12 rounded-3xl text-foreground/70 space-y-8 shadow-2xl relative overflow-hidden flex flex-col pt-10">
          <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>
          <p className="text-lg text-foreground/60">Our dedicated global response team guarantees resolutions within a 12-hour operational window for enterprise license holders.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            <div className="bg-background/50 border border-border p-6 rounded-2xl flex flex-col items-center text-center hover:border-indigo-500/50 transition-colors group">
              <div className="bg-indigo-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-foreground font-bold mb-2">Technical Core</h3>
              <p className="text-sm text-foreground/40">core@leadstation.io</p>
            </div>
            
            <div className="bg-background/50 border border-border p-6 rounded-2xl flex flex-col items-center text-center hover:border-violet-500/50 transition-colors group">
              <div className="bg-violet-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-foreground font-bold mb-2">Live CRM Chat</h3>
              <p className="text-sm text-foreground/40">Available 24/7 inside Portal</p>
            </div>
            
            <div className="bg-background/50 border border-border p-6 rounded-2xl flex flex-col items-center text-center hover:border-indigo-500/50 transition-colors group">
              <div className="bg-indigo-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-foreground font-bold mb-2">Direct Hotline</h3>
              <p className="text-sm text-foreground/40">1-800-LEAD-GEN</p>
            </div>

          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  );
}
