import { atom } from "jotai";

// 수집 완료 후 데이터 훅들이 재조회를 트리거하기 위한 카운터
export const investorFlowRefreshAtom = atom(0);
export const globalPortfolioRefreshAtom = atom(0);
export const krPortfolioRefreshAtom = atom(0);
