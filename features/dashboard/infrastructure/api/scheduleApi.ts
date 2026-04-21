import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type {
  EconomicSchedule,
  EventImpactAnalysis,
  ScheduleBoard,
  ScheduleImportance,
} from "@/features/dashboard/domain/model/economicSchedule";

interface RawAnalysisItem {
  id?: number | string;
  event_id?: number | string;
  event_title?: string;
  event_country?: string | null;
  event_at?: string;
  event_importance?: string | number | null;
  summary?: string;
  direction?: string | null;
  impact_tags?: string[];
  key_drivers?: string[];
  risks?: string[];
}

interface RawUpcomingEvent {
  event_id?: number | string;
  id?: number | string;
  title?: string;
  country?: string | null;
  event_at?: string;
  importance?: string | number | null;
  source?: string | null;
  reference_url?: string | null;
}

interface RawEventAnalysisResponse {
  items?: RawAnalysisItem[];
  upcoming_events?: RawUpcomingEvent[];
  total_events?: number;
  analyzed_count?: number;
  reference_date?: string;
}

function normalizeImportance(value: string | number | null | undefined): ScheduleImportance {
  if (typeof value === "number") {
    if (value >= 3) return "HIGH";
    if (value >= 2) return "MEDIUM";
    return "LOW";
  }
  const text = (value ?? "").toString().toUpperCase();
  if (text.includes("HIGH") || text.includes("상") || text === "H") return "HIGH";
  if (text.includes("LOW") || text.includes("하") || text === "L") return "LOW";
  return "MEDIUM";
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = value.toString().trim();
  return text.length > 0 ? text : null;
}

function mapAnalysis(raw: RawAnalysisItem, index: number): EventImpactAnalysis {
  return {
    id: toStringOrNull(raw.id) ?? toStringOrNull(raw.event_id) ?? `analysis-${index}`,
    eventTitle: toStringOrNull(raw.event_title) ?? "-",
    eventCountry: toStringOrNull(raw.event_country),
    eventAt: toStringOrNull(raw.event_at) ?? "",
    importance: normalizeImportance(raw.event_importance),
    summary: toStringOrNull(raw.summary) ?? "",
    direction: toStringOrNull(raw.direction),
    impactTags: raw.impact_tags ?? [],
    keyDrivers: raw.key_drivers ?? [],
    risks: raw.risks ?? [],
  };
}

function mapUpcoming(raw: RawUpcomingEvent, index: number): EconomicSchedule {
  return {
    id: toStringOrNull(raw.event_id) ?? toStringOrNull(raw.id) ?? `upcoming-${index}`,
    eventName: toStringOrNull(raw.title) ?? "-",
    releaseAt: toStringOrNull(raw.event_at) ?? "",
    variableName: null,
    forecast: null,
    previous: null,
    importance: normalizeImportance(raw.importance),
    country: toStringOrNull(raw.country),
  };
}

export async function fetchScheduleBoard(): Promise<ScheduleBoard> {
  const res = await httpClient<ApiResponse<RawEventAnalysisResponse>>(
    "/api/v1/schedule/event-analysis"
  );

  const payload = res.data ?? {};
  const analyses = (payload.items ?? []).map(mapAnalysis);
  const upcomingEvents = (payload.upcoming_events ?? []).map(mapUpcoming);

  return { analyses, upcomingEvents };
}
