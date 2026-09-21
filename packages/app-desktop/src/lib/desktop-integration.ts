import os from "node:os";
import { execFile } from "node:child_process";
import {
  buildDwError,
  type DarkwriteDesktopClientInfo,
  type DwResultAsync,
  type Font,
  type IDesktopAPI,
  OS,
  stripAlpha,
} from "@darkwrite/common";
import { app, systemPreferences } from "electron";
import log from "electron-log/main.js";
import { ok, ResultAsync } from "neverthrow";
import { ContextMenuApiBridge } from "@/desktop-integration/context-menu.handler";
import { ShellApiBridge } from "@/desktop-integration/shell.handler";
import { type HandlerImplements, handler } from "../types";

const operatingSystem = os.platform() as OS;

const FONT_LIST_SCRIPT = `
import("font-list")
  .then(async ({ getFonts2 }) => {
    const fonts = await getFonts2();
    process.stdout.write(JSON.stringify(fonts.map((font) => ({
      family: font.familyName,
      monospace: font.monospace,
    }))));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
`;

function isFont(value: unknown): value is Font {
  if (typeof value !== "object" || value === null) return false;
  if (!("family" in value) || !("monospace" in value)) return false;
  return (
    typeof value.family === "string" && typeof value.monospace === "boolean"
  );
}

function parseFontList(output: string): Font[] {
  const parsed: unknown = JSON.parse(output);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isFont);
}

function getMacFonts(): Promise<Font[]> {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      ["-e", FONT_LIST_SCRIPT],
      {
        env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
        maxBuffer: 8 * 1024 * 1024,
      },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          resolve(parseFontList(stdout));
        } catch (parseError) {
          reject(parseError);
        }
      },
    );
  });
}

function getSystemAccentColor() {
  // TODO: Linux integration will be provided over D-Bus hopefully,
  // unless Electron implements Linux support themselves.
  if (operatingSystem === OS.LINUX) return ok("0000ff");
  const color = systemPreferences.getAccentColor();
  return ok(stripAlpha(color));
}

function getAvailableFonts(): DwResultAsync<Font[]> {
  async function _getFonts() {
    if (operatingSystem === OS.MACOS) return getMacFonts();

    const { getFonts2 } = await import("font-list");
    const fonts = await getFonts2();
    const list = fonts.map(
      (f) => ({ family: f.familyName, monospace: f.monospace }) satisfies Font,
    );
    const families = new Set<string>();
    const filtered = list.filter((obj) => {
      if (families.has(obj.family)) return false;
      families.add(obj.family);
      return true;
    });
    return filtered;
  }

  return ResultAsync.fromPromise(_getFonts(), (err) =>
    buildDwError("Failed to retrieve system font list.", String(err)),
  ).orElse((error) => {
    log.warn("Failed to retrieve system font list; using defaults.", error);
    return ok([]);
  });
}

function getClientInfo(): DarkwriteDesktopClientInfo {
  return {
    electronVersion: process.versions.electron,
    isPackaged: app.isPackaged,
    nodeVersion: process.versions.node,
    os: os.platform() as OS,
    version: app.getVersion(),
  };
}

export const DesktopApiBridge: HandlerImplements<IDesktopAPI> = {
  getClientInfo: handler(() => ok(getClientInfo())),
  getFontList: handler(getAvailableFonts),
  getSystemAccentColor: handler(getSystemAccentColor),
  contextMenu: ContextMenuApiBridge,
  shell: ShellApiBridge,
};
