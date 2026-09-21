import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import { useFolderSelection } from "./use-folder-selection";

type Rectangle = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type MarqueeRectangle = Rectangle & {
  height: number;
  width: number;
};

export const rectanglesIntersect = (a: Rectangle, b: Rectangle) =>
  a.left <= b.right &&
  a.right >= b.left &&
  a.top <= b.bottom &&
  a.bottom >= b.top;

type DragState = {
  additive: boolean;
  anchorId: string | null;
  baseSelection: string[];
  moved: boolean;
  pointerId: number;
  startX: number;
  startY: number;
};

export function useMarqueeSelection() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);
  const [rectangle, setRectangle] = useState<MarqueeRectangle | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("[data-folder-item], button, input, textarea, select")
    ) {
      return;
    }

    const selection = useFolderSelection.getState();
    drag.current = {
      additive: event.metaKey || event.ctrlKey,
      anchorId: selection.anchorItemId,
      baseSelection: selection.selectedItemIds,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const currentDrag = drag.current;
    const surface = surfaceRef.current;
    if (!currentDrag || !surface || event.pointerId !== currentDrag.pointerId)
      return;

    const distance = Math.hypot(
      event.clientX - currentDrag.startX,
      event.clientY - currentDrag.startY,
    );
    if (!currentDrag.moved && distance < 4) return;
    currentDrag.moved = true;
    event.preventDefault();

    const left = Math.min(currentDrag.startX, event.clientX);
    const right = Math.max(currentDrag.startX, event.clientX);
    const top = Math.min(currentDrag.startY, event.clientY);
    const bottom = Math.max(currentDrag.startY, event.clientY);
    const surfaceBounds = surface.getBoundingClientRect();
    setRectangle({
      bottom: bottom - surfaceBounds.top + surface.scrollTop,
      height: bottom - top,
      left: left - surfaceBounds.left + surface.scrollLeft,
      right: right - surfaceBounds.left + surface.scrollLeft,
      top: top - surfaceBounds.top + surface.scrollTop,
      width: right - left,
    });

    const selectionBounds = { bottom, left, right, top };
    const hitIds = Array.from(
      surface.querySelectorAll<HTMLElement>("[data-folder-item]"),
    )
      .filter((item) =>
        rectanglesIntersect(selectionBounds, item.getBoundingClientRect()),
      )
      .map((item) => item.dataset.folderItem)
      .filter((id) => id !== undefined);

    if (!currentDrag.additive) {
      useFolderSelection.getState().setSelection(hitIds, hitIds[0] ?? null);
      return;
    }

    const hits = new Set(hitIds);
    const base = new Set(currentDrag.baseSelection);
    const selected = [
      ...currentDrag.baseSelection.filter((id) => !hits.has(id)),
      ...hitIds.filter((id) => !base.has(id)),
    ];
    useFolderSelection
      .getState()
      .setSelection(selected, currentDrag.anchorId ?? selected[0] ?? null);
  };

  const finish = (event: ReactPointerEvent<HTMLDivElement>) => {
    const currentDrag = drag.current;
    if (!currentDrag || event.pointerId !== currentDrag.pointerId) return;
    suppressClick.current = currentDrag.moved;
    drag.current = null;
    setRectangle(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const target = event.target;
    if (target instanceof Element && !target.closest("[data-folder-item]")) {
      useFolderSelection.getState().clearSelection();
    }
  };

  return {
    rectangle,
    surfaceProps: {
      onClick,
      onPointerCancel: finish,
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      ref: surfaceRef,
    },
  };
}

export function MarqueeSelectionBox({
  rectangle,
}: {
  rectangle: MarqueeRectangle;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-40 border border-ring/70 bg-secondary/25"
      style={{
        height: rectangle.height,
        left: rectangle.left,
        top: rectangle.top,
        width: rectangle.width,
      }}
    />
  );
}
