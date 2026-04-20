import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

// Key format: `${ticker}:${period}:${eventIdx}`
export const titleOverrideAtomFamily = atomFamily(
  (_key: string) => atom<string | null>(null)
);

export const titleLoadingAtomFamily = atomFamily(
  (_key: string) => atom<boolean>(false)
);

// When true, requests full server-side LLM title enrichment instead of lazy client-side loading
export const enrichTitlesAtom = atom<boolean>(false);
