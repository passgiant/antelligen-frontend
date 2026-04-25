export interface USConcentratedBuyingItem {
  ticker: string;
  stockName: string | null;
  investorCount: number;
  totalMarketValue: number; // USD 천 달러
  investors: string[];
  reportedAt: string | null;
}
