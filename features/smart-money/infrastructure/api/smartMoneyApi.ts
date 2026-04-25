import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type { InvestorType, InvestorFlowItem } from "@/features/smart-money/domain/model/investorFlowItem";
import type { InvestorFlowResponse } from "@/features/smart-money/domain/model/investorFlowResponse";
import type { InvestorFlowTrend } from "@/features/smart-money/domain/model/investorFlowTrendItem";
import type { InvestorFlowTrendResponse } from "@/features/smart-money/domain/model/investorFlowTrendResponse";
import type { ConcentratedBuyingDays, ConcentratedBuyingItem } from "@/features/smart-money/domain/model/concentratedBuyingItem";
import type { ConcentratedBuyingResponse } from "@/features/smart-money/domain/model/concentratedBuyingResponse";
import type { PortfolioChangeType, GlobalPortfolioItem, GlobalInvestor } from "@/features/smart-money/domain/model/globalPortfolioItem";
import type { USConcentratedBuyingItem } from "@/features/smart-money/domain/model/usConcentratedBuyingItem";
import type { KrPortfolioItem, KrInvestor } from "@/features/smart-money/domain/model/krPortfolioItem";
import type { GlobalPortfolioResponse, GlobalInvestorsResponse } from "@/features/smart-money/domain/model/globalPortfolioResponse";

export async function fetchInvestorFlowRanking(investorType: InvestorType): Promise<InvestorFlowItem[]> {
  const { data } = await httpClient<ApiResponse<InvestorFlowResponse>>(
    `/api/v1/smart-money/investor-flow?investor_type=${investorType}`
  );

  return data.items.map((item) => ({
    rank: item.rank,
    stockName: item.stock_name,
    stockCode: item.stock_code,
    netBuyAmount: item.net_buy_amount,
    netBuyQuantity: item.net_buy_volume,
  }));
}

export async function fetchInvestorFlowTrend(stockCode: string): Promise<InvestorFlowTrend> {
  const { data } = await httpClient<ApiResponse<InvestorFlowTrendResponse>>(
    `/api/v1/smart-money/trend/${stockCode}`
  );

  return {
    stockName: data.stock_name,
    stockCode: data.stock_code,
    trends: data.points.map((item) => ({
      date: item.date,
      foreignerNetBuy: item.foreign,
      institutionNetBuy: item.institution,
      individualNetBuy: item.individual,
    })),
  };
}

export async function fetchConcentratedBuying(days: ConcentratedBuyingDays): Promise<ConcentratedBuyingItem[]> {
  const { data } = await httpClient<ApiResponse<ConcentratedBuyingResponse>>(
    `/api/v1/smart-money/concentrated?days=${days}`
  );

  return data.items.map((item) => ({
    stockName: item.stock_name,
    stockCode: item.stock_code,
    foreignerNetBuy: item.foreign_net_buy,
    institutionNetBuy: item.institution_net_buy,
    concentrationScore: item.concentration_score,
  }));
}

export async function checkInvestorFlowHasData(): Promise<boolean> {
  try {
    const { data } = await httpClient<ApiResponse<InvestorFlowResponse>>(
      `/api/v1/smart-money/investor-flow?investor_type=FOREIGN&limit=1`
    );
    return data.date !== null && data.date !== undefined;
  } catch {
    return false;
  }
}

export async function triggerCollectInvestorFlow(): Promise<void> {
  await httpClient<ApiResponse<unknown>>(`/api/v1/smart-money/collect`, { method: "POST" });
}

export async function checkGlobalPortfolioHasData(): Promise<boolean> {
  try {
    const { data } = await httpClient<ApiResponse<GlobalPortfolioResponse>>(
      `/api/v1/smart-money/global-portfolio`
    );
    return data.total > 0;
  } catch {
    return false;
  }
}

export async function triggerCollectGlobalPortfolio(): Promise<void> {
  await httpClient<ApiResponse<unknown>>(`/api/v1/smart-money/global-portfolio/collect`, { method: "POST" });
}

export async function fetchGlobalInvestors(): Promise<GlobalInvestor[]> {
  const { data } = await httpClient<ApiResponse<GlobalInvestorsResponse>>(
    `/api/v1/smart-money/investors`
  );
  return data.investors.map((name) => ({ id: name, name }));
}

export async function fetchKrInvestors(): Promise<KrInvestor[]> {
  const { data } = await httpClient<ApiResponse<{ investors: Array<{ name: string; type: string }> }>>(
    `/api/v1/smart-money/kr-investors`
  );
  return data.investors.map((i) => ({ name: i.name, type: i.type as KrInvestor["type"] }));
}

export async function fetchKrPortfolio(investorName: string): Promise<KrPortfolioItem[]> {
  const { data } = await httpClient<ApiResponse<{
    items: Array<{
      investor_name: string;
      investor_type: string;
      stock_code: string;
      stock_name: string;
      shares_held: number;
      ownership_ratio: number;
      change_type: string;
      reported_at: string | null;
    }>;
    total: number;
  }>>(`/api/v1/smart-money/kr-portfolio?investor_name=${encodeURIComponent(investorName)}`);

  return data.items.map((item) => ({
    investorName: item.investor_name,
    investorType: item.investor_type as KrPortfolioItem["investorType"],
    stockCode: item.stock_code,
    stockName: item.stock_name,
    sharesHeld: item.shares_held,
    ownershipRatio: item.ownership_ratio,
    changeType: item.change_type as KrPortfolioItem["changeType"],
    reportedAt: item.reported_at,
  }));
}

export async function checkKrPortfolioHasData(): Promise<boolean> {
  try {
    const { data } = await httpClient<ApiResponse<{ total: number }>>(
      `/api/v1/smart-money/kr-portfolio`
    );
    return data.total > 0;
  } catch {
    return false;
  }
}

export async function triggerCollectKrPortfolio(): Promise<void> {
  await httpClient<ApiResponse<unknown>>(`/api/v1/smart-money/kr-portfolio/collect`, { method: "POST" });
}

export async function fetchUSConcentratedBuying(limit: number = 20): Promise<USConcentratedBuyingItem[]> {
  const { data } = await httpClient<ApiResponse<{ items: Array<{
    ticker: string;
    stock_name: string | null;
    investor_count: number;
    total_market_value: number;
    investors: string[];
    reported_at: string | null;
  }>; total: number }>>(`/api/v1/smart-money/us-concentrated?limit=${limit}`);

  return data.items.map((item) => ({
    ticker: item.ticker,
    stockName: item.stock_name,
    investorCount: item.investor_count,
    totalMarketValue: item.total_market_value,
    investors: item.investors,
    reportedAt: item.reported_at,
  }));
}

export async function fetchGlobalPortfolio(
  investorName: string,
  changeType?: PortfolioChangeType
): Promise<GlobalPortfolioItem[]> {
  const params = new URLSearchParams({ investor_name: investorName });
  if (changeType) params.set("change_type", changeType);

  const { data } = await httpClient<ApiResponse<GlobalPortfolioResponse>>(
    `/api/v1/smart-money/global-portfolio?${params.toString()}`
  );

  return data.items.map((item) => ({
    stockName: item.stock_name,
    ticker: item.ticker,
    sharesHeld: item.shares,
    marketValue: item.market_value,
    portfolioWeight: item.portfolio_weight,
    changeType: item.change_type,
    reportedAt: item.reported_at,
  }));
}
