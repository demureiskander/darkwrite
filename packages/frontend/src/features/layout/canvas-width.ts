export const MIN_CANVAS_WIDTH = 480;
export const MAX_CANVAS_WIDTH = 1440;
export const DEFAULT_CANVAS_WIDTH = 960;

export function clampCanvasWidth(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_CANVAS_WIDTH;
  return Math.max(
    MIN_CANVAS_WIDTH,
    Math.min(MAX_CANVAS_WIDTH, Math.round(value)),
  );
}

/** Require the platform's primary modifier together with Option/Alt. */
export function hasCanvasResizeModifiers(
  modifiers: Pick<KeyboardEvent, "metaKey" | "ctrlKey" | "altKey">,
  isMac: boolean,
): boolean {
  if (!modifiers.altKey) return false;
  return isMac
    ? modifiers.metaKey && !modifiers.ctrlKey
    : modifiers.ctrlKey && !modifiers.metaKey;
}
