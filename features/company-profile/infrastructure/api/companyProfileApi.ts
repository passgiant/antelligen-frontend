import { httpClient } from "@/infrastructure/http/httpClient";
import type { CompanyProfile } from "@/features/company-profile/domain/model/companyProfile";

export async function fetchCompanyProfile(ticker: string): Promise<CompanyProfile> {
  const trimmed = ticker.trim();
  if (!trimmed) {
    throw new Error("종목코드를 입력하세요.");
  }
  return httpClient<CompanyProfile>(`/api/v1/company-profile/${encodeURIComponent(trimmed)}`);
}
