import { atom } from "jotai";
import type { AssetProfileState } from "@/features/company-profile/domain/state/assetProfileState";

export const assetProfileAtom = atom<AssetProfileState>({ status: "IDLE" });
