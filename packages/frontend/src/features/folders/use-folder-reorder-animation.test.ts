import { describe, expect, it } from "vitest";
import { getReorderOffset } from "./use-folder-reorder-animation";

describe("folder reorder animation", () => {
  it("calculates the inverse movement from the new position", () => {
    expect(
      getReorderOffset({ left: 120, top: 40 }, { left: 20, top: 100 }),
    ).toEqual({ x: 100, y: -60 });
  });
});
