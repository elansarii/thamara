"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PlotDraft } from "./plotTypes";

interface PlotStoreContext {
  lastPlot: PlotDraft | null;
  setLastPlot: (plot: PlotDraft | null) => void;
  plots: PlotDraft[];
  addPlot: (plot: PlotDraft) => void;
  waterPoints: number;
  incrementWaterPoints: () => void;
  draftPlot: Partial<PlotDraft> | null;
  setDraftPlot: (draft: Partial<PlotDraft> | null) => void;
}

const PlotContext = createContext<PlotStoreContext | undefined>(undefined);

export function PlotProvider({ children }: { children: ReactNode }) {
  const [lastPlot, setLastPlot] = useState<PlotDraft | null>(null);
  const [plots, setPlots] = useState<PlotDraft[]>([]);
  const [waterPoints, setWaterPoints] = useState(0);
  const [draftPlot, setDraftPlot] = useState<Partial<PlotDraft> | null>(null);

  const addPlot = (plot: PlotDraft) => {
    setLastPlot(plot);
    setPlots((prev) => [...prev, plot]);
  };

  const incrementWaterPoints = () => {
    setWaterPoints((prev) => prev + 1);
  };

  return (
    <PlotContext.Provider 
      value={{ 
        lastPlot, 
        setLastPlot, 
        plots, 
        addPlot,
        waterPoints,
        incrementWaterPoints,
        draftPlot,
        setDraftPlot
      }}
    >
      {children}
    </PlotContext.Provider>
  );
}

export function usePlotStore() {
  const context = useContext(PlotContext);
  if (context === undefined) {
    throw new Error("usePlotStore must be used within a PlotProvider");
  }
  return context;
}
