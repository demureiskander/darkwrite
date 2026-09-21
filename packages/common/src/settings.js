import _ from "lodash";
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
];
export const DEFAULT_APP_SHORTCUTS = {
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
  themeMode: "dark",
  lightColorScheme: "darkwrite-catppuccin-latte",
  darkColorScheme: "darkwrite-default",
  accentColor: "#2867B8",
  useSystemWindowFrame: false,
  useSystemAccentColor: false,
  fonts: {
    sans: "Manrope",
    serif: "ui-serif",
    code: "JetBrains Mono",
    ui: "Inter",
  },
  experimental: {
    /** @deprecated no longer used */
    darwinCustomTitlebarEnabled: false,
  },
  customCSS: "",
};
export const DEFAULT_EDITOR_SETTINGS = {
  spellcheckerEnabled: true,
  codeIndentSize: 4,
  wordCountHudEnabled: false,
  disabledCommandItems: [],
  preferredPageSize: "A4",
  showTextDirectionControls: false,
  openFilesOnDoubleClick: false,
};
export const DEFAULT_CLIENT_SETTINGS = {
  autoUpdateCheck: false,
  canvasWidthPx: 960,
  openItemsOnDoubleClick: true,
  language: "en",
  zoomFactor: 1,
  shortcuts: DEFAULT_APP_SHORTCUTS,
};
export const getDefaultUserSettings = () =>
  _.cloneDeep({
    appearance: DEFAULT_THEME_SETTINGS,
    client: DEFAULT_CLIENT_SETTINGS,
    editor: DEFAULT_EDITOR_SETTINGS,
    version: 3,
  });
export const mergeUserSettings = (settings) =>
  _.merge(getDefaultUserSettings(), settings);
