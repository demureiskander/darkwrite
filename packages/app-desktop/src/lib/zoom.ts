import type { DarkwriteUserSettings } from "@darkwrite/common";
import type { BrowserWindow } from "electron";
import log from "electron-log";
import type { ResultAsync } from "neverthrow";

export const MIN_ZOOM_FACTOR = 0.5;
export const MAX_ZOOM_FACTOR = 2;
export const ZOOM_FACTOR_STEP = 0.1;
export const DEFAULT_ZOOM_FACTOR = 1;

type ZoomTarget = Pick<
  BrowserWindow["webContents"],
  "getZoomFactor" | "setZoomFactor"
>;

interface ZoomSettingsStore {
  getSettings: () => DarkwriteUserSettings;
  setSettings: (settings: DarkwriteUserSettings) => ResultAsync<void, unknown>;
}

export function normalizeZoomFactor(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_ZOOM_FACTOR;
  const clamped = Math.min(MAX_ZOOM_FACTOR, Math.max(MIN_ZOOM_FACTOR, value));
  return Math.round(clamped * 10) / 10;
}

export function ZoomService(settingsStore: ZoomSettingsStore) {
  const persist = (zoomFactor: number) => {
    const current = settingsStore.getSettings();
    return settingsStore
      .setSettings({
        ...current,
        client: {
          ...current.client,
          zoomFactor,
        },
      })
      .orTee((error) => log.error("Failed to save zoom factor.", error));
  };

  const set = (target: ZoomTarget, value: number) => {
    const zoomFactor = normalizeZoomFactor(value);
    target.setZoomFactor(zoomFactor);
    return persist(zoomFactor);
  };

  const applyStored = (target: ZoomTarget) =>
    set(target, settingsStore.getSettings().client.zoomFactor);

  const increase = (target: ZoomTarget) =>
    set(target, target.getZoomFactor() + ZOOM_FACTOR_STEP);

  const decrease = (target: ZoomTarget) =>
    set(target, target.getZoomFactor() - ZOOM_FACTOR_STEP);

  const reset = (target: ZoomTarget) => set(target, DEFAULT_ZOOM_FACTOR);

  return {
    applyStored,
    decrease,
    increase,
    reset,
    set,
  };
}

export type IZoomService = ReturnType<typeof ZoomService>;
