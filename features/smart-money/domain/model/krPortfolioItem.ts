export type KrInvestorType = 'PENSION' | 'ASSET_MANAGER' | 'INDIVIDUAL';
export type KrChangeType = 'NEW' | 'INCREASED' | 'DECREASED' | 'CLOSED';

export interface KrPortfolioItem {
  investorName: string;
  investorType: KrInvestorType;
  stockCode: string;
  stockName: string;
  sharesHeld: number;
  ownershipRatio: number;
  changeType: KrChangeType;
  reportedAt: string | null;
}

export interface KrInvestor {
  name: string;
  type: KrInvestorType;
}
