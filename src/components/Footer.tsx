import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full py-12 mt-auto border-t border-border bg-card/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between text-foreground text-xs font-bold uppercase tracking-widest gap-8">
        <p className="text-center md:text-left opacity-80">© {year} LeadStation Pro CRM. All rights strictly reserved.</p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-primary transition-colors">Support Intelligence</Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 mt-10">
        <p className="text-[10px] text-center text-foreground/40 leading-relaxed uppercase tracking-[0.1em] font-medium italic mb-2">
          Global Intelligence Disclaimer
        </p>
        <p className="text-[9px] text-center text-foreground/50 leading-relaxed font-normal max-w-2xl mx-auto uppercase tracking-tighter">
          LeadStation Pro provides advanced data extraction capabilities for professional business intelligence. All users are strictly required to comply with local regulations, data privacy laws, and the terms of service of any external platforms from which data is retrieved.
        </p>
      </div>
    </footer>
  );
}
