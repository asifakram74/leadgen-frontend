import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface PremiumDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: React.ReactNode; value: string; }[];
  colorScheme?: "indigo" | "rose";
}

export default function PremiumDropdown({ 
  value, 
  onChange, 
  options, 
  colorScheme = "indigo"
}: PremiumDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colorStyles = colorScheme === "indigo" 
    ? "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-700 dark:text-indigo-400 focus-within:ring-indigo-500/50" 
    : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-700 dark:text-rose-400 focus-within:ring-rose-500/50";

  const menuBorder = colorScheme === "indigo" ? "border-indigo-500/20" : "border-rose-500/20";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between min-w-[180px] w-full border px-5 py-4 rounded-2xl outline-none text-sm font-black tracking-wide transition-all shadow-sm ${colorStyles}`}
      >
        <div className="truncate">{selected.label}</div>
        <ChevronDown className={`w-4 h-4 ml-2 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-background border shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 rounded-2xl ${menuBorder}`}>
          <div className="py-1 flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
            {options.map(opt => {
              const isSelected = value === opt.value;
              const hoverStyle = colorScheme === "indigo" 
                ? (isSelected ? "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300" : "hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300")
                : (isSelected ? "bg-rose-500/30 text-rose-700 dark:text-rose-300" : "hover:bg-rose-500/20 hover:text-rose-700 dark:hover:text-rose-300");

              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold text-left transition-colors ${isSelected ? "" : "text-foreground/70"} ${hoverStyle}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
