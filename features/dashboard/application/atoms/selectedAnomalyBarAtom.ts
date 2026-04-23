import { atom } from "jotai";
import type { AnomalyBar } from "@/features/dashboard/infrastructure/api/anomalyBarsApi";

export interface SelectedAnomalyBar {
  ticker: string;
  bar: AnomalyBar;
}

export const selectedAnomalyBarAtom = atom<SelectedAnomalyBar | null>(null);
