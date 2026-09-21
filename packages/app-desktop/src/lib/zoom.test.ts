import { getDefaultUserSettings } from "@darkwrite/common";
import { okAsync } from "neverthrow";
import {
  DEFAULT_ZOOM_FACTOR,
  MAX_ZOOM_FACTOR,
  MIN_ZOOM_FACTOR,
  normalizeZoomFactor,
  ZoomService,
} from "./zoom";

describe("zoom factor", () => {
  it("clamps and rounds zoom factors", () => {
    expect(normalizeZoomFactor(0.1)).toBe(MIN_ZOOM_FACTOR);
    expect(normalizeZoomFactor(2.9)).toBe(MAX_ZOOM_FACTOR);
    expect(normalizeZoomFactor(1.26)).toBe(1.3);
  });

  it("falls back to the default for invalid values", () => {
    expect(normalizeZoomFactor(Number.NaN)).toBe(DEFAULT_ZOOM_FACTOR);
    expect(normalizeZoomFactor(Number.POSITIVE_INFINITY)).toBe(
      DEFAULT_ZOOM_FACTOR,
    );
  });
});

describe("ZoomService", () => {
  it("applies, changes, resets and persists zoom", async () => {
    let settings = getDefaultUserSettings();
    settings.client.zoomFactor = 1.2;
    let currentFactor = 1;
    const target = {
      getZoomFactor: () => currentFactor,
      setZoomFactor: (value: number) => {
        currentFactor = value;
      },
    };
    const service = ZoomService({
      getSettings: () => settings,
      setSettings: (updated) => {
        settings = updated;
        return okAsync();
      },
    });

    await service.applyStored(target);
    expect(currentFactor).toBe(1.2);

    await service.increase(target);
    expect(currentFactor).toBe(1.3);
    expect(settings.client.zoomFactor).toBe(1.3);

    await service.decrease(target);
    expect(currentFactor).toBe(1.2);

    await service.reset(target);
    expect(currentFactor).toBe(DEFAULT_ZOOM_FACTOR);
    expect(settings.client.zoomFactor).toBe(DEFAULT_ZOOM_FACTOR);
  });
});
