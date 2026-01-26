/**
 * Storage utilities for Drops feature
 * Manages local persistence of harvest drops
 */

import type { HarvestDrop } from './dropsTypes';

const STORAGE_KEY = 'thamara_harvest_drops';

export function loadDrops(): HarvestDrop[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load drops:', error);
    return [];
  }
}

export function saveDrops(drops: HarvestDrop[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
  } catch (error) {
    console.error('Failed to save drops:', error);
  }
}

export function addDrop(drop: HarvestDrop): void {
  const drops = loadDrops();
  drops.unshift(drop);
  saveDrops(drops);
}

export function updateDrop(id: string, updates: Partial<HarvestDrop>): void {
  const drops = loadDrops();
  const index = drops.findIndex(d => d.id === id);
  
  if (index !== -1) {
    drops[index] = { ...drops[index], ...updates };
    saveDrops(drops);
  }
}

export function deleteDrop(id: string): void {
  const drops = loadDrops();
  const filtered = drops.filter(d => d.id !== id);
  saveDrops(filtered);
}

export function getDropById(id: string): HarvestDrop | undefined {
  const drops = loadDrops();
  return drops.find(d => d.id === id);
}

export function generateDropId(): string {
  return `drop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
