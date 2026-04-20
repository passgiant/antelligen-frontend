"use client";

import { useAtomValue } from "jotai";
import TimelineEventCard from "@/features/dashboard/ui/components/TimelineEventCard";
import { titleOverrideAtomFamily, titleLoadingAtomFamily } from "@/features/history/application/historyAtoms";
import type { TimelineEvent } from "@/features/dashboard/domain/model/timelineEvent";

interface Props {
  event: TimelineEvent;
  eventIdx: number;
  eventKey: string;
  isLast?: boolean;
  isSelected?: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onClick?: (idx: number, event: TimelineEvent) => void;
}

export default function LazyTimelineEventCard({ eventKey, cardRef, ...rest }: Props) {
  const titleOverride = useAtomValue(titleOverrideAtomFamily(eventKey));
  const isTitleLoading = useAtomValue(titleLoadingAtomFamily(eventKey));

  return (
    <TimelineEventCard
      {...rest}
      cardRef={cardRef}
      titleOverride={titleOverride}
      isTitleLoading={isTitleLoading}
    />
  );
}
