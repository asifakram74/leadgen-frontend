"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Sparkles, Target, Zap, ChevronRight } from "lucide-react";
import { leadService } from "@/services/scrapeService";

interface ScrapeFormProps {
  category: string;
  setCategory: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ScrapeForm({
  category,
  setCategory,
  location,
  setLocation,
  loading,
  onSubmit
}: ScrapeFormProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when location changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (location.length >= 2 && !suggestions.includes(location)) {
        try {
          const res = await leadService.suggestLocations(location);
          setSuggestions(res);
          setShowSuggestions(res.length > 0);
        } catch (err) {
          console.error("Suggestion fetch failed", err);
        }
      } else if (location.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  const handleSelectSuggestion = (val: string) => {
    setLocation(val);
    setShowSuggestions(false);
  };

  return (
    <div className="mt-12 relative group max-w-7xl mx-auto">

      <div className="bg-card border border-border rounded-[2.5rem] p-1.5 shadow-xl relative">
        <form onSubmit={onSubmit} className="bg-background/20 p-8 md:p-10 rounded-[2.3rem] flex flex-col lg:flex-row gap-8 items-stretch lg:items-end relative">
          
          {/* Subtle Scanner Line Effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse pointer-events-none"></div>

          {/* 1. Target Category Field */}
          <div className="flex-1 space-y-4 group/field">
            <div className="flex items-center gap-2 ml-1">
              <Target className="w-3.5 h-3.5 text-primary group-hover/field:rotate-90 transition-transform duration-500" />
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within/field:text-primary transition-colors">
                Intelligence Target
              </label>
            </div>
            <div className="relative group/input">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-all duration-300" />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Real Estate, SaaS, Dentists..."
                className="w-full bg-muted/20 border border-border rounded-2xl py-5 pl-14 pr-6
                  text-foreground font-semibold placeholder:text-muted-foreground/30
                  hover:bg-muted/30 focus:bg-background
                  focus:border-primary/40 focus:outline-none
                  transition-all duration-300"
                  required
              />
            </div>
          </div>

          {/* 2. Geo Location Field */}
          <div className="flex-1 space-y-4 group/field relative" ref={suggestionRef}>
            <div className="flex items-center gap-2 ml-1">
              <MapPin className="w-3.5 h-3.5 text-primary group-hover/field:scale-125 transition-transform" />
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within/field:text-primary transition-colors">
                Sector / Region
              </label>
            </div>
            <div className="relative group/input">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-all duration-300" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => location.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                placeholder="City, state, or region"
                className="w-full bg-muted/20 border border-border rounded-2xl py-5 pl-14 pr-6
                  text-foreground font-semibold placeholder:text-muted-foreground/30
                  hover:bg-muted/30 focus:bg-background
                  focus:border-primary/40 focus:outline-none
                  transition-all duration-300"
                  required
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-2 z-[100] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-primary/10 group/item transition-all border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                          <span className="text-sm font-semibold text-foreground/80 group-hover/item:text-foreground">
                            {sug}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover/item:translate-x-1 group-hover/item:text-primary/50 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* 4. Action Button */}
          <button
            type="submit"
            disabled={loading || !category}
            className="w-full lg:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg active:scale-95 transition-all duration-300"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
            
            <div className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-black uppercase tracking-widest text-xs italic">Syncing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white animate-pulse" />
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Engage Crawler</span>
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
