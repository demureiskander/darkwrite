import { useEffect, useRef, useState } from "react";
import { goBack, goForward } from "@/features/navigation/navigator";

const SWIPE_DISTANCE_PX = 80;
const SWIPE_IDLE_MS = 220;

export interface HistorySwipeProgress {
  direction: "back" | "forward";
  progress: number;
  completed: boolean;
}

/** Turns one horizontal pixel-scroll gesture into one history navigation. */
export function createHistorySwipeHandler(
  navigate: (direction: "back" | "forward") => void,
  now: () => number = () => performance.now(),
  onProgress?: (progress: HistorySwipeProgress) => void,
) {
  let distance = 0;
  let lastEventAt = 0;
  let completed = false;

  return (event: WheelEvent) => {
    // Pinch-to-zoom reports ctrlKey in Chromium. Do not take over other
    // modified scrolling or line/page-based mouse-wheel events either.
    if (
      event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      Math.abs(event.deltaX) <= Math.abs(event.deltaY)
    ) {
      return;
    }

    event.preventDefault();
    const eventAt = now();
    if (eventAt - lastEventAt > SWIPE_IDLE_MS) {
      distance = 0;
      completed = false;
    }
    lastEventAt = eventAt;
    if (completed) return;

    distance += event.deltaX;
    const reachedThreshold = Math.abs(distance) >= SWIPE_DISTANCE_PX;
    const direction = distance < 0 ? "back" : "forward";
    onProgress?.({
      direction,
      progress: Math.min(Math.abs(distance) / SWIPE_DISTANCE_PX, 1),
      completed: reachedThreshold,
    });
    if (!reachedThreshold) return;

    completed = true;
    navigate(direction);
  };
}

/** Limit history swipes to the main content area, excluding the sidebar. */
export function useTrackpadHistory() {
  const contentRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [swipeProgress, setSwipeProgress] =
    useState<HistorySwipeProgress | null>(null);
  const [swipeVisible, setSwipeVisible] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const onWheel = createHistorySwipeHandler((direction) => {
      if (direction === "back") goBack();
      else goForward();
    }, undefined, (progress) => {
      setSwipeProgress(progress);
      setSwipeVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setSwipeVisible(false);
        hideTimerRef.current = null;
        clearTimerRef.current = setTimeout(() => {
          setSwipeProgress(null);
          clearTimerRef.current = null;
        }, 180);
      }, progress.completed ? 380 : SWIPE_IDLE_MS);
    });
    content.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      content.removeEventListener("wheel", onWheel);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  return { contentRef, swipeProgress, swipeVisible };
}
