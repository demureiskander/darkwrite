import { describe, expect, it } from "vitest";
import {
  clampCanvasWidth,
  hasCanvasResizeModifiers,
} from "./canvas-width";

describe("shared canvas width", () => {
  it("keeps settings and drag widths within safe limits", () => {
    expect(clampCanvasWidth(200)).toBe(480);
    expect(clampCanvasWidth(1600)).toBe(1440);
    expect(clampCanvasWidth(1043.6)).toBe(1044);
  });

  it("uses the default for an invalid saved value", () => {
    expect(clampCanvasWidth(Number.NaN)).toBe(960);
  });
});

describe("hasCanvasResizeModifiers", () => {
  const modifiers = (metaKey: boolean, ctrlKey: boolean, altKey = true) => ({
    metaKey,
    ctrlKey,
    altKey,
  });

  it("uses Cmd+Option only on macOS", () => {
    expect(hasCanvasResizeModifiers(modifiers(true, false), true)).toBe(true);
    expect(hasCanvasResizeModifiers(modifiers(false, true), true)).toBe(false);
    expect(hasCanvasResizeModifiers(modifiers(true, true), true)).toBe(false);
    expect(hasCanvasResizeModifiers(modifiers(true, false, false), true)).toBe(
      false,
    );
  });

  it("uses Ctrl+Alt only on Windows and Linux", () => {
    expect(hasCanvasResizeModifiers(modifiers(false, true), false)).toBe(true);
    expect(hasCanvasResizeModifiers(modifiers(true, false), false)).toBe(false);
    expect(hasCanvasResizeModifiers(modifiers(true, true), false)).toBe(false);
  });
});
