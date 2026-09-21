import {
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSettingsActions } from "@/features/settings/store/settings-actions";
import { useAppSelector } from "@/features/store/hooks";
import { cn } from "@/lib/utils";
import {
  clampCanvasWidth,
  hasCanvasResizeModifiers,
} from "./canvas-width";

type DragState = {
  startX: number;
  startWidth: number;
  side: "left" | "right";
};

/** One centered width and two modifier-revealed handles for the workspace. */
export function CanvasWidthContainer({
  children,
  className,
  fill = false,
}: {
  children: ReactNode;
  className?: string;
  fill?: boolean;
}) {
  const savedWidth = useAppSelector(
    (state) => state.settings.client.canvasWidthPx ?? 960,
  );
  const { updateSettings } = useSettingsActions();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const widthRef = useRef(clampCanvasWidth(savedWidth));
  const [draftWidth, setDraftWidth] = useState<number | null>(null);
  const [modifiersHeld, setModifiersHeld] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const isMac = navigator.platform.includes("Mac");
    const updateModifiers = (event: KeyboardEvent) => {
      setModifiersHeld(hasCanvasResizeModifiers(event, isMac));
    };
    const resetModifiers = () => setModifiersHeld(false);
    window.addEventListener("keydown", updateModifiers);
    window.addEventListener("keyup", updateModifiers);
    window.addEventListener("blur", resetModifiers);
    return () => {
      window.removeEventListener("keydown", updateModifiers);
      window.removeEventListener("keyup", updateModifiers);
      window.removeEventListener("blur", resetModifiers);
    };
  }, []);

  const width = draftWidth ?? clampCanvasWidth(savedWidth);
  widthRef.current = width;

  const finishDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setDraftWidth(null);
    updateSettings({ client: { canvasWidthPx: widthRef.current } });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handle = (side: "left" | "right") => (
    <button
      type="button"
      aria-label={
        side === "left"
          ? t("settings.appearance.canvasResizeLeft")
          : t("settings.appearance.canvasResizeRight")
      }
      className={cn(
        "pointer-events-auto absolute top-0 z-30 flex h-16 w-5 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border bg-secondary/95 text-muted-foreground shadow-lg hover:bg-secondary active:bg-primary/20",
        side === "left" ? "-left-2.5" : "-right-2.5",
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        dragRef.current = {
          startX: event.clientX,
          startWidth:
            containerRef.current?.getBoundingClientRect().width ?? width,
          side,
        };
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag) return;
        const direction = drag.side === "right" ? 1 : -1;
        const next = clampCanvasWidth(
          drag.startWidth + 2 * direction * (event.clientX - drag.startX),
        );
        widthRef.current = next;
        setDraftWidth(next);
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <span
        aria-hidden="true"
        className="h-6 w-0.5 rounded-full bg-current/70"
      />
    </button>
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative mx-auto min-w-0 max-w-full", className)}
      style={{ width: fill ? "100%" : `${width}px` }}
    >
      {!fill && (modifiersHeld || dragging) && (
        <div className="pointer-events-none sticky top-[45vh] z-30 h-0 w-full">
          {handle("left")}
          {handle("right")}
        </div>
      )}
      {children}
    </div>
  );
}
