export type AssetType = "EQUITY" | "INDEX" | "ETF";

export type OverviewSource =
  | "rag_summary"
  | "llm_only"
  | "asset_llm_only"
  | null;

export interface CompanyProfile {
  corp_code: string;
  corp_name: string;
  corp_name_eng: string | null;
  stock_name: string | null;
  stock_code: string | null;
  ceo_nm: string | null;
  corp_cls: string | null;
  corp_cls_label: string | null;
  jurir_no: string | null;
  bizr_no: string | null;
  adres: string | null;
  hm_url: string | null;
  ir_url: string | null;
  phn_no: string | null;
  fax_no: string | null;
  induty_code: string | null;
  est_dt: string | null;
  acc_mt: string | null;
  asset_type: AssetType;
  business_summary: string | null;
  main_revenue_sources: string[];
  overview_source: OverviewSource;
  founding_story: string | null;
  business_model: string | null;
}
