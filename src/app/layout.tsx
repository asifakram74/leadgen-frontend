import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import MainLayout from "@/components/MainLayout";
import "./globals.css";

import { Plus_Jakarta_Sans, Poppins } from "next/font/google";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LeadStation Pro CRM | Advanced Leads Intelligence",
  description: "High-performance B2B leads extraction and CRM management for modern business intelligence. Scrape Google Maps data with stealth and efficiency.",
  keywords: ["LeadGen", "Maps Scraper", "B2B Leads Center", "Sales Intelligence", "LeadStation"],
  authors: [{ name: "LeadStation Core" }],
  openGraph: {
    title: "LeadStation Pro CRM | Leads Intelligence",
    description: "The authoritative platform for B2B intelligence and lead extraction.",
    url: "https://leadstation.io",
    siteName: "LeadStation Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadStation Pro CRM",
    description: "Stealth-enabled leads extraction and intelligence hub.",
  }
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%232563eb%22/><path d=%22M50 20C36.2 20 25 31.2 25 45c0 15 25 35 25 35s25-20 25-35c0-13.8-11.2-25-25-25zm0 15a10 10 0 1 1 0 20 10 10 0 0 1 0-20z%22 fill=%22white%22/></svg>" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${jakartaSans.variable} ${poppins.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <ThemeProvider>
          <ReduxProvider>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: 'rgba(var(--card), 0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'hsl(var(--foreground))',
                  borderRadius: '1.25rem',
                },
                className: "premium-toast",
              }}
            />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}