// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createHistorySwipeHandler } from "./use-trackpad-history";

function wheel(deltaX: number, deltaY = 0, options?: WheelEventInit) {
  return new WheelEvent("wheel", {
    cancelable: true,
    deltaX,
    deltaY,
    deltaMode: WheelEvent.DOM_DELTA_PIXEL,
    ...options,
  });
}

describe("createHistorySwipeHandler", () => {
  it("navigates back for a right swipe and forward for a left swipe", () => {
    const navigate = vi.fn();
    let time = 1000;
    const onWheel = createHistorySwipeHandler(navigate, () => time);

    onWheel(wheel(-45));
    onWheel(wheel(-45));
    expect(navigate).toHaveBeenCalledExactlyOnceWith("back");

    time += 300;
    onWheel(wheel(90));
    expect(navigate).toHaveBeenLastCalledWith("forward");
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it("navigates at most once during one continuous swipe", () => {
    const navigate = vi.fn();
    const onWheel = createHistorySwipeHandler(navigate, () => 1000);

    for (let index = 0; index < 8; index += 1) onWheel(wheel(-40));
    expect(navigate).toHaveBeenCalledExactlyOnceWith("back");
  });

  it("leaves vertical, modified, and non-pixel scrolling untouched", () => {
    const navigate = vi.fn();
    const onWheel = createHistorySwipeHandler(navigate);
    const vertical = wheel(5, 90);
    const pinch = wheel(90, 0, { ctrlKey: true });
    const modified = wheel(90, 0, { shiftKey: true });
    const mouse = wheel(90, 0, { deltaMode: WheelEvent.DOM_DELTA_LINE });

    for (const event of [vertical, pinch, modified, mouse]) {
      onWheel(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(navigate).not.toHaveBeenCalled();
  });

  it("requires a fresh distance after an idle pause", () => {
    const navigate = vi.fn();
    let time = 1000;
    const onWheel = createHistorySwipeHandler(navigate, () => time);

    onWheel(wheel(-50));
    time += 300;
    onWheel(wheel(-50));
    expect(navigate).not.toHaveBeenCalled();
    onWheel(wheel(-40));
    expect(navigate).toHaveBeenCalledExactlyOnceWith("back");
  });

  it("reports edge progress and completion once per gesture", () => {
    const navigate = vi.fn();
    const progress = vi.fn();
    const onWheel = createHistorySwipeHandler(
      navigate,
      () => 1000,
      progress,
    );

    onWheel(wheel(-20));
    onWheel(wheel(-40));
    onWheel(wheel(-40));
    onWheel(wheel(-40));

    expect(progress.mock.calls.map(([value]) => value)).toEqual([
      { direction: "back", progress: 0.25, completed: false },
      { direction: "back", progress: 0.75, completed: false },
      { direction: "back", progress: 1, completed: true },
    ]);
    expect(navigate).toHaveBeenCalledExactlyOnceWith("back");
  });

  it("does not show progress for vertical or modified scrolling", () => {
    const progress = vi.fn();
    const onWheel = createHistorySwipeHandler(
      vi.fn(),
      () => 1000,
      progress,
    );

    onWheel(wheel(5, 90));
    onWheel(wheel(90, 0, { ctrlKey: true }));
    onWheel(wheel(90, 0, { deltaMode: WheelEvent.DOM_DELTA_LINE }));

    expect(progress).not.toHaveBeenCalled();
  });
});
