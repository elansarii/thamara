"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PlotDraft } from "./plotTypes";
import { query, execute, generateId } from "./database";

interface PlotStoreContext {
  lastPlot: PlotDraft | null;
  setLastPlot: (plot: PlotDraft | null) => void;
  plots: PlotDraft[];
  addPlot: (plot: PlotDraft) => void;
  waterPoints: number;
  incrementWaterPoints: () => void;
  draftPlot: Partial<PlotDraft> | null;
  setDraftPlot: (draft: Partial<PlotDraft> | null) => void;
  isLoading: boolean;
}

const PlotContext = createContext<PlotStoreContext | undefined>(undefined);

// Helper to load plots from SQLite
async function loadPlotsFromDB(): Promise<PlotDraft[]> {
  try {
    const rows = await query<{
      id: string;
      name: string | null;
      areaM2: number | null;
      locationMethod: string;
      lat: number | null;
      lon: number | null;
      salinity: string;
      contamination: string;
      debris: string;
      waterAccess: string;
      notes: string | null;
      createdAt: number;
    }>('SELECT * FROM plots ORDER BY createdAt DESC');

    return rows.map(row => ({
      id: row.id,
      name: row.name || undefined,
      areaM2: row.areaM2 || undefined,
      locationMethod: row.locationMethod as 'gps' | 'manual' | 'none',
      lat: row.lat || undefined,
      lon: row.lon || undefined,
      salinity: row.salinity as PlotDraft['salinity'],
      contamination: row.contamination as PlotDraft['contamination'],
      debris: row.debris as PlotDraft['debris'],
      waterAccess: row.waterAccess as PlotDraft['waterAccess'],
      notes: row.notes || undefined,
    }));
  } catch (error) {
    console.error('Failed to load plots from DB:', error);
    return [];
  }
}

// Helper to save plot to SQLite
async function savePlotToDB(plot: PlotDraft & { id?: string }): Promise<void> {
  const id = plot.id || `plot-${generateId()}`;

  try {
    await execute(
      `INSERT OR REPLACE INTO plots
       (id, name, areaM2, locationMethod, lat, lon, salinity, contamination, debris, waterAccess, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        plot.name || null,
        plot.areaM2 || null,
        plot.locationMethod,
        plot.lat || null,
        plot.lon || null,
        plot.salinity,
        plot.contamination,
        plot.debris,
        plot.waterAccess,
        plot.notes || null,
        Date.now(),
      ]
    );
  } catch (error) {
    console.error('Failed to save plot to DB:', error);
  }
}

// Helper to get/set last plot ID from settings
async function getLastPlotId(): Promise<string | null> {
  try {
    const rows = await query<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['lastPlotId']);
    return rows[0]?.value || null;
  } catch {
    return null;
  }
}

async function setLastPlotId(id: string | null): Promise<void> {
  try {
    if (id) {
      await execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['lastPlotId', id]);
    } else {
      await execute('DELETE FROM settings WHERE key = ?', ['lastPlotId']);
    }
  } catch (error) {
    console.error('Failed to save lastPlotId:', error);
  }
}

export function PlotProvider({ children }: { children: ReactNode }) {
  const [lastPlot, setLastPlotState] = useState<PlotDraft | null>(null);
  const [plots, setPlots] = useState<PlotDraft[]>([]);
  const [waterPoints, setWaterPoints] = useState(0);
  const [draftPlot, setDraftPlot] = useState<Partial<PlotDraft> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load plots from SQLite on mount
  useEffect(() => {
    async function loadData() {
      try {
        const loadedPlots = await loadPlotsFromDB();
        setPlots(loadedPlots);

        // Restore last plot
        const lastId = await getLastPlotId();
        if (lastId) {
          const last = loadedPlots.find(p => (p as PlotDraft & { id?: string }).id === lastId);
          if (last) {
            setLastPlotState(last);
          } else if (loadedPlots.length > 0) {
            setLastPlotState(loadedPlots[0]);
          }
        } else if (loadedPlots.length > 0) {
          setLastPlotState(loadedPlots[0]);
        }
      } catch (error) {
        console.error('Failed to load plot data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const setLastPlot = (plot: PlotDraft | null) => {
    setLastPlotState(plot);
    if (plot) {
      const plotWithId = plot as PlotDraft & { id?: string };
      setLastPlotId(plotWithId.id || null);
    } else {
      setLastPlotId(null);
    }
  };

  const addPlot = (plot: PlotDraft) => {
    const plotWithId = { ...plot, id: `plot-${generateId()}` };

    setLastPlotState(plotWithId);
    setPlots((prev) => [plotWithId, ...prev]);

    // Persist to SQLite
    savePlotToDB(plotWithId);
    setLastPlotId(plotWithId.id);
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
        setDraftPlot,
        isLoading
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
