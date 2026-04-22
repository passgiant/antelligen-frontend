import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

// Key format: `${ticker}:${period}:${eventIdx}`
export const titleOverrideAtomFamily = atomFamily(
  (_key: string) => atom<string | null>(null)
);

export const titleLoadingAtomFamily = atomFamily(
  (_key: string) => atom<boolean>(false)
);

// §18.2: enrichTitlesAtom 제거 — "빠른 로드" 토글 폐지. 항상 backend default(True) 로 LLM 타이틀 사용.
