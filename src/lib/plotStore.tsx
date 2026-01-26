"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PlotDraft } from "./plotTypes";

interface PlotStoreContext {
  lastPlot: PlotDraft | null;
  setLastPlot: (plot: PlotDraft | null) => void;
}

const PlotContext = createContext<PlotStoreContext | undefined>(undefined);

export function PlotProvider({ children }: { children: ReactNode }) {
  const [lastPlot, setLastPlot] = useState<PlotDraft | null>(null);

  return (
    <PlotContext.Provider value={{ lastPlot, setLastPlot }}>
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
