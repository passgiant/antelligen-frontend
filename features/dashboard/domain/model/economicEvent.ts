export type EconomicEventType = "CPI" | "INTEREST_RATE" | "UNEMPLOYMENT";

export interface EconomicEvent {
  id: string;
  type: EconomicEventType;
  label: string;
  date: string; // "yyyy-mm-dd"
  value: number;
  previous: number;
  forecast: number | null;
}
