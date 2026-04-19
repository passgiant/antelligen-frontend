export interface NasdaqBar {
  time: string; // 모든 봉 종류(1D/1W/1M/1Y) 공통 "yyyy-mm-dd" 포맷
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
