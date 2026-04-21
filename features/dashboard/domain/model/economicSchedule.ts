export type ScheduleImportance = "HIGH" | "MEDIUM" | "LOW";

export interface EconomicSchedule {
  id: string;
  eventName: string;
  releaseAt: string;
  variableName: string | null;
  forecast: string | null;
  previous: string | null;
  importance: ScheduleImportance;
  country: string | null;
}

export interface EventImpactAnalysis {
  id: string;
  eventTitle: string;
  eventCountry: string | null;
  eventAt: string;
  importance: ScheduleImportance;
  summary: string;
  direction: string | null;
  impactTags: string[];
  keyDrivers: string[];
  risks: string[];
}

export interface ScheduleBoard {
  analyses: EventImpactAnalysis[];
  upcomingEvents: EconomicSchedule[];
}
