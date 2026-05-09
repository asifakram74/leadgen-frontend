"use client";

import { useState } from "react";
import {
  ChevronDown, Brain, MessageCircle, Crown, Zap, Sparkles, Rocket, Cpu, Bolt, Terminal
} from "lucide-react";

const MODEL_GROUPS = [
  {
    label: "Gemini 3.1",
    models: [
      { id: "gemini-3.1-pro-preview",        name: "Gemini 3.1 Pro",        icon: Crown,    description: "Frontier intelligence & reasoning" },
      { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash Lite",  icon: Bolt,     description: "Lightweight ultra-fast engine" },
    ],
  },
  {
    label: "Gemini 3",
    models: [
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", icon: Rocket, description: "Next-gen multimodal speed" },
    ],
  },
  {
    label: "Gemini 2.5",
    models: [
      { id: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash",      icon: Zap,   description: "Latest & fastest — recommended" },
      { id: "gemini-2.5-flash-lite",          name: "Gemini 2.5 Flash Lite",  icon: Bolt,  description: "Performance-optimised lite" },
      { id: "gemini-2.5-pro-preview-05-06",   name: "Gemini 2.5 Pro",         icon: Crown, description: "Maximum intelligence & reasoning" },
    ],
  },
  {
    label: "Gemini 2",
    models: [
      { id: "gemini-2.0-flash",      name: "Gemini 2 Flash",      icon: Rocket, description: "Efficient next-gen generation" },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2 Flash Lite",  icon: Bolt,   description: "Lightweight next-gen model" },
    ],
  },
  {
    label: "Research & Agents",
    models: [
      { id: "deep-research-pro-preview", name: "Deep Research Pro",    icon: Sparkles, description: "Advanced web research engine" },
      { id: "computer-use-preview",      name: "Computer Use Preview", icon: Terminal, description: "Action-oriented generation" },
    ],
  },
  {
    label: "Gemma (Open)",
    models: [
      { id: "gemma-4-31b", name: "Gemma 4 31B", icon: Cpu, description: "Open-weight frontier model" },
      { id: "gemma-4-26b", name: "Gemma 4 26B", icon: Cpu, description: "Open-weight advanced model" },
      { id: "gemma-3-27b", name: "Gemma 3 27B", icon: Cpu, description: "Open-weight powerful model" },
      { id: "gemma-3-12b", name: "Gemma 3 12B", icon: Cpu, description: "Efficient open model" },
      { id: "gemma-3-4b",  name: "Gemma 3 4B",  icon: Cpu, description: "Compact open model" },
      { id: "gemma-3-2b",  name: "Gemma 3 2B",  icon: Cpu, description: "Ultra-lightweight open model" },
      { id: "gemma-3-1b",  name: "Gemma 3 1B",  icon: Cpu, description: "Smallest open model" },
    ],
  },
  {
    label: "DeepSeek",
    models: [
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoner)", icon: Brain,         description: "Deep chain-of-thought logic" },
      { id: "deepseek-chat",     name: "DeepSeek V3 (Chat)",      icon: MessageCircle, description: "High-speed UI generation" },
    ],
  },
];

export const AVAILABLE_MODELS = MODEL_GROUPS.flatMap((g) => g.models);

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ selectedModel, onSelect, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];
  const Icon = currentModel.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-foreground/80 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Icon className="w-3 h-3 text-primary" />
        <span className="truncate max-w-[120px]">{currentModel.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
            <p className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-foreground/30">Select Intelligence Engine</p>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {MODEL_GROUPS.map((group, gi) => (
                <div key={group.label}>
                  {gi > 0 && <div className="mx-4 my-1 border-t border-white/5" />}
                  <p className="px-4 pt-2 pb-1 text-[7px] font-black uppercase tracking-[0.2em] text-foreground/25">
                    {group.label}
                  </p>
                  {group.models.map((model) => {
                    const MIcon = model.icon;
                    const isSelected = selectedModel === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          onSelect(model.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-all ${
                          isSelected ? "bg-primary/10 text-primary" : "text-foreground/60"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary/20" : "bg-white/5"}`}>
                          <MIcon className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-foreground/40"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold truncate">{model.name}</p>
                          <p className="text-[8px] text-foreground/40 font-medium truncate">{model.description}</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
