import { useEffect, useLayoutEffect, useRef, useState } from "react";

type ItemPosition = Pick<DOMRect, "left" | "top">;

export function getReorderOffset(
  previous: ItemPosition,
  current: ItemPosition,
) {
  return {
    x: previous.left - current.left,
    y: previous.top - current.top,
  };
}

/** Animates cards into their new positions and reveals newly created cards. */
export function useFolderReorderAnimation(
  itemIds: readonly string[],
  layoutKey = "",
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousPositions = useRef(new Map<string, ItemPosition>());
  const previousOrder = useRef("");
  const previousLayoutKey = useRef(layoutKey);
  const hasSnapshot = useRef(false);
  const layoutTimer = useRef<number | undefined>(undefined);
  const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);
  const order = itemIds.join("\0");

  useEffect(
    () => () => {
      window.clearTimeout(layoutTimer.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const elements =
      containerRef.current?.querySelectorAll<HTMLElement>("[data-folder-item]");
    if (!elements) {
      previousPositions.current = new Map();
      previousOrder.current = order;
      previousLayoutKey.current = layoutKey;
      hasSnapshot.current = true;
      return;
    }

    const currentPositions = new Map<string, ItemPosition>();
    for (const element of elements) {
      const id = element.dataset.folderItem;
      if (id) currentPositions.set(id, element.getBoundingClientRect());
    }

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const layoutChanged = previousLayoutKey.current !== layoutKey;
    if (layoutChanged) {
      window.clearTimeout(layoutTimer.current);
      setIsLayoutAnimating(!reduceMotion);
      if (!reduceMotion) {
        layoutTimer.current = window.setTimeout(
          () => setIsLayoutAnimating(false),
          180,
        );
      }
    }
    if (
      hasSnapshot.current &&
      (previousOrder.current !== order || layoutChanged) &&
      !reduceMotion
    ) {
      for (const element of elements) {
        const id = element.dataset.folderItem;
        const previous = id ? previousPositions.current.get(id) : undefined;
        const current = id ? currentPositions.get(id) : undefined;
        if (!current) continue;
        element.getAnimations().forEach((animation) => animation.cancel());
        if (!previous) {
          element.animate(
            [
              { opacity: 0, transform: "scale(0.92)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            {
              duration: 180,
              easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            },
          );
          continue;
        }
        const { x, y } = getReorderOffset(previous, current);
        if (x === 0 && y === 0 && !layoutChanged) continue;
        element.animate(
          [
            {
              opacity: layoutChanged ? 0.55 : 1,
              transform: `translate(${x}px, ${y}px)`,
            },
            { opacity: 1, transform: "translate(0, 0)" },
          ],
          {
            duration: 180,
            easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          },
        );
      }
    }

    previousPositions.current = currentPositions;
    previousOrder.current = order;
    previousLayoutKey.current = layoutKey;
    hasSnapshot.current = true;
  }, [layoutKey, order]);

  return { containerRef, isLayoutAnimating };
}
