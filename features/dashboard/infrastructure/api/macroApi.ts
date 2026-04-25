import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type { MacroData } from "@/features/dashboard/domain/model/economicIndicator";
import type { Period } from "@/features/dashboard/domain/model/period";

export async function fetchMacroData(chartInterval: Period): Promise<MacroData> {
  const res = await httpClient<ApiResponse<MacroData>>(
    `/api/v1/dashboard/macro?chartInterval=${chartInterval}`
  );
  return res.data;
}
