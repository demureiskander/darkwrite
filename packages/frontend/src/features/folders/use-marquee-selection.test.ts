import { describe, expect, it } from "vitest";
import { rectanglesIntersect } from "./use-marquee-selection";

describe("rectanglesIntersect", () => {
  it("detects overlapping rectangles", () => {
    expect(
      rectanglesIntersect(
        { bottom: 20, left: 0, right: 20, top: 0 },
        { bottom: 30, left: 10, right: 30, top: 10 },
      ),
    ).toBe(true);
  });

  it("includes a card touched by the selection edge", () => {
    expect(
      rectanglesIntersect(
        { bottom: 20, left: 0, right: 20, top: 0 },
        { bottom: 30, left: 20, right: 30, top: 10 },
      ),
    ).toBe(true);
  });

  it("rejects separated rectangles", () => {
    expect(
      rectanglesIntersect(
        { bottom: 20, left: 0, right: 20, top: 0 },
        { bottom: 40, left: 21, right: 40, top: 21 },
      ),
    ).toBe(false);
  });
});
