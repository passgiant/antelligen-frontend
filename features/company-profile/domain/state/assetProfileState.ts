import type { CompanyProfile } from "@/features/company-profile/domain/model/companyProfile";

export type AssetProfileState =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "SUCCESS"; data: CompanyProfile }
  | { status: "NOT_FOUND"; ticker: string }
  | { status: "ERROR"; message: string };
