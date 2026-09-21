import _ from "lodash";
import type { PageSize } from "./pdf";

export type ThemeMode = "light" | "dark" | "system";

export const APP_SHORTCUT_IDS = [
  "newNote",
  "quickSwitch",
  "openSettings",
  "duplicate",
  "toggleFavorite",
  "moveToTrash",
  "quickPreview",
  "gridView",
  "listView",
  "parentFolder",
  "historyBack",
  "historyForward",
  "undo",
  "redo",
  "toggleSidebar",
  "zoomIn",
  "zoomOut",
  "zoomReset",
] as const;

export type AppShortcutId = (typeof APP_SHORTCUT_IDS)[number];
export type AppShortcutSettings = Record<AppShortcutId, string>;

export const DEFAULT_APP_SHORTCUTS: AppShortcutSettings = {
  newNote: "CmdOrCtrl+N",
  quickSwitch: "CmdOrCtrl+K",
  openSettings: "CmdOrCtrl+Comma",
  duplicate: "CmdOrCtrl+D",
  toggleFavorite: "CmdOrCtrl+P",
  moveToTrash: "Backspace",
  quickPreview: "Space",
  gridView: "Alt+1",
  listView: "Alt+2",
  parentFolder: "CmdOrCtrl+Up",
  historyBack: "CmdOrCtrl+BracketLeft",
  historyForward: "CmdOrCtrl+BracketRight",
  undo: "CmdOrCtrl+Z",
  redo: "CmdOrCtrl+Shift+Z",
  toggleSidebar: "Alt+B",
  zoomIn: "CmdOrCtrl+Plus",
  zoomOut: "CmdOrCtrl+Minus",
  zoomReset: "CmdOrCtrl+0",
};

export const DEFAULT_THEME_SETTINGS = {
  themeMode: "dark" as ThemeMode,
  lightColorScheme: "darkwrite-catppuccin-latte" as string,
  darkColorScheme: "darkwrite-default" as string,
  accentColor: "#2867B8" as string,
  useSystemWindowFrame: false as boolean,
  useSystemAccentColor: false as boolean,
  fonts: {
    sans: "Manrope" as string,
    serif: "ui-serif" as string,
    code: "JetBrains Mono" as string,
    ui: "Inter" as string,
  },
  experimental: {
    /** @deprecated no longer used */
    darwinCustomTitlebarEnabled: false as boolean,
  },
  customCSS: "" as string,
};

export const DEFAULT_EDITOR_SETTINGS = {
  spellcheckerEnabled: true as boolean,
  codeIndentSize: 4 as number,
  wordCountHudEnabled: false as boolean,
  disabledCommandItems: [] as string[],
  preferredPageSize: "A4" as PageSize,
  showTextDirectionControls: false as boolean,
  openFilesOnDoubleClick: false as boolean,
};

export const DEFAULT_CLIENT_SETTINGS = {
  autoUpdateCheck: false as boolean,
  canvasWidthPx: 960 as number,
  openItemsOnDoubleClick: true as boolean,
  language: "en" as string,
  zoomFactor: 1 as number,
  shortcuts: DEFAULT_APP_SHORTCUTS,
};

export type ThemeSettings = typeof DEFAULT_THEME_SETTINGS;
export type EditorSettings = typeof DEFAULT_EDITOR_SETTINGS;
export type ClientSettings = typeof DEFAULT_CLIENT_SETTINGS;

export type DarkwriteUserSettings = {
  appearance: ThemeSettings;
  editor: EditorSettings;
  client: ClientSettings;
  version: 3;
};

export const getDefaultUserSettings = () =>
  _.cloneDeep({
    appearance: DEFAULT_THEME_SETTINGS,
    client: DEFAULT_CLIENT_SETTINGS,
    editor: DEFAULT_EDITOR_SETTINGS,
    version: 3,
  }) satisfies DarkwriteUserSettings;

export const mergeUserSettings = (settings: Partial<DarkwriteUserSettings>) =>
  _.merge(getDefaultUserSettings(), settings) as DarkwriteUserSettings;
