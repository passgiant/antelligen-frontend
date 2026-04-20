"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "jotai";
import type { TimelineEvent } from "@/features/dashboard/domain/model/timelineEvent";
import { fetchEventTitles } from "@/features/history/infrastructure/historyTitleClient";
import { titleOverrideAtomFamily, titleLoadingAtomFamily } from "@/features/history/application/historyAtoms";

const BATCH_SIZE = 50;
const DEBOUNCE_MS = 500;

export function useLazyTitles({
  events,
  ticker,
  period,
}: {
  events: TimelineEvent[];
  ticker: string;
  period: string;
}) {
  const store = useStore();

  const pendingRef = useRef<Set<number>>(new Set());
  const inFlightRef = useRef<Set<number>>(new Set());
  const visibleAtRef = useRef<Map<number, number>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pendingElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const cardRefCallbacks = useRef<Map<number, (el: HTMLDivElement | null) => void>>(new Map());

  // Keep latest values accessible in stable callbacks
  const eventsRef = useRef(events);
  const tickerRef = useRef(ticker);
  const periodRef = useRef(period);
  eventsRef.current = events;
  tickerRef.current = ticker;
  periodRef.current = period;

  // Reset pending state on ticker/period change
  useEffect(() => {
    pendingRef.current.clear();
    inFlightRef.current.clear();
    visibleAtRef.current.clear();
    cardRefCallbacks.current.clear();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [ticker, period]);

  useEffect(() => {
    const flush = async () => {
      const t = tickerRef.current;
      const p = periodRef.current;
      const evts = eventsRef.current;

      const batch = [...pendingRef.current].filter(
        (idx) => !inFlightRef.current.has(idx) && idx < evts.length
      );
      pendingRef.current.clear();
      if (batch.length === 0) return;

      for (let i = 0; i < batch.length; i += BATCH_SIZE) {
        const chunk = batch.slice(i, i + BATCH_SIZE);
        chunk.forEach((idx) => {
          inFlightRef.current.add(idx);
          store.set(titleLoadingAtomFamily(`${t}:${p}:${idx}`), true);
        });

        try {
          const results = await fetchEventTitles(
            t,
            chunk.map((idx) => ({
              eventIdx: idx,
              date: evts[idx].date,
              category: evts[idx].category,
              type: evts[idx].type,
              detail: evts[idx].detail,
            }))
          );
          results.forEach(({ eventIdx, title }) => {
            store.set(titleOverrideAtomFamily(`${t}:${p}:${eventIdx}`), title);
            store.set(titleLoadingAtomFamily(`${t}:${p}:${eventIdx}`), false);
            inFlightRef.current.delete(eventIdx);

            const visibleAt = visibleAtRef.current.get(eventIdx);
            if (visibleAt != null) {
              const elapsed = performance.now() - visibleAt;
              performance.mark(`lazy-title-resolved:${eventIdx}`);
              try {
                performance.measure(
                  `lazy-title-delay:${eventIdx}`,
                  `lazy-title-visible:${eventIdx}`,
                  `lazy-title-resolved:${eventIdx}`,
                );
              } catch { /* marks may not exist if observer fired after page reload */ }
              console.debug(`[LazyTitles] title delay idx=${eventIdx} elapsed=${elapsed.toFixed(0)}ms`);
              visibleAtRef.current.delete(eventIdx);
            }
          });
        } catch {
          // Fail silently — rule-based title remains visible
          chunk.forEach((idx) => {
            store.set(titleLoadingAtomFamily(`${t}:${p}:${idx}`), false);
            inFlightRef.current.delete(idx);
          });
        }
      }
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let shouldSchedule = false;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = parseInt(
            (entry.target as HTMLElement).dataset.lazyTitleIdx ?? "-1"
          );
          if (idx < 0) return;
          const key = `${tickerRef.current}:${periodRef.current}:${idx}`;
          if (inFlightRef.current.has(idx)) return;
          if (store.get(titleOverrideAtomFamily(key)) !== null) return;
          visibleAtRef.current.set(idx, performance.now());
          performance.mark(`lazy-title-visible:${idx}`);
          pendingRef.current.add(idx);
          shouldSchedule = true;
        });

        if (shouldSchedule) {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(flush, DEBOUNCE_MS);
        }
      },
      { threshold: 0 }
    );

    // Observe any elements that mounted before this effect ran
    pendingElementsRef.current.forEach((el) => {
      observerRef.current!.observe(el);
    });
    pendingElementsRef.current.clear();

    return () => {
      observerRef.current?.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [store]);

  const getCardRef = useCallback((idx: number) => {
    if (!cardRefCallbacks.current.has(idx)) {
      const cb = (el: HTMLDivElement | null) => {
        if (!el) return;
        el.dataset.lazyTitleIdx = String(idx);
        if (observerRef.current) {
          observerRef.current.observe(el);
        } else {
          pendingElementsRef.current.set(idx, el);
        }
      };
      cardRefCallbacks.current.set(idx, cb);
    }
    return cardRefCallbacks.current.get(idx)!;
  }, []);

  return { getCardRef };
}
