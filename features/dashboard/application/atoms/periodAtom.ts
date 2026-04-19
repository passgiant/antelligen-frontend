import { atom } from "jotai";
import type { Period } from "@/features/dashboard/domain/model/period";

export const periodAtom = atom<Period>("1M");
