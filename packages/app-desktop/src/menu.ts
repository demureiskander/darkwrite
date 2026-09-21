import {
  type AppShortcutSettings,
  DEFAULT_APP_SHORTCUTS,
} from "@darkwrite/common";
import {
  app,
  BrowserWindow,
  type MenuItemConstructorOptions as ElectronMenuItem,
  Menu,
  shell,
} from "electron";
import meta from "@/metadata.json";
import { isWayland } from "./desktop-integration/linux";
import { t } from "./i18n";
import type { IZoomService } from "./lib/zoom";
import { AppMenuEvent } from "./types/window-events";

const convertAccelerator = (shortcut: string) =>
  shortcut
    .replace("BracketLeft", "[")
    .replace("BracketRight", "]")
    .replace("Minus", "-");

const validAccelerator =
  /^(?:(?:CmdOrCtrl|Cmd|Command|Ctrl|Control|Alt|Option|Shift|Super|Meta)\+)*(?:[A-Z0-9]|F(?:[1-9]|1[0-9]|2[0-4])|Plus|-|\[|\]|Up|Down|Left|Right|Space|Tab|Backspace|Delete|Insert|Return|Enter|Home|End|PageUp|PageDown)$/;

const electronAccelerator = (shortcut: string, fallback: string) => {
  const candidate = convertAccelerator(shortcut);
  return validAccelerator.test(candidate)
    ? candidate
    : convertAccelerator(fallback);
};

function buildTemplate(
  zoomService: IZoomService,
  shortcuts: AppShortcutSettings,
): ElectronMenuItem[] {
  // carry the checkbox state over when the menu is rebuilt
  const alwaysOnTop =
    Menu.getApplicationMenu()?.getMenuItemById("alwaysontop")?.checked ?? false;

  const template: Array<ElectronMenuItem> = [
    {
      role: "fileMenu",
      submenu: [
        {
          type: "normal",
          label: t("menu.newNote"),
          click(_menuItem, window) {
            if (window instanceof BrowserWindow) {
              window.webContents.send(AppMenuEvent.CREATE_NEW_NOTE);
            }
          },
          accelerator: electronAccelerator(
            shortcuts.newNote,
            DEFAULT_APP_SHORTCUTS.newNote,
          ),
        },
        { role: "close" },
      ],
    },
    { role: "editMenu" },
    {
      label: t("menu.tools"),
      submenu: [
        {
          label: t("menu.alwaysOnTop"),
          id: "alwaysontop",
          click(menuItem, browserWindow) {
            browserWindow?.setAlwaysOnTop(!browserWindow.isAlwaysOnTop());
            if (browserWindow) menuItem.checked = browserWindow.isAlwaysOnTop();
          },
          checked: alwaysOnTop,
          type: "checkbox",
          enabled: !isWayland,
        },
        {
          label: t("menu.openDataDirectory"),
          id: "opendatadirectory",
          click() {
            shell.openPath(app.getPath("userData"));
          },
        },
      ],
    },
    {
      role: "viewMenu",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        {
          label: t("menu.zoomIn"),
          accelerator: electronAccelerator(
            shortcuts.zoomIn,
            DEFAULT_APP_SHORTCUTS.zoomIn,
          ),
          click(_menuItem, window) {
            if (window instanceof BrowserWindow)
              zoomService.increase(window.webContents);
          },
        },
        {
          label: t("menu.zoomOut"),
          accelerator: electronAccelerator(
            shortcuts.zoomOut,
            DEFAULT_APP_SHORTCUTS.zoomOut,
          ),
          click(_menuItem, window) {
            if (window instanceof BrowserWindow)
              zoomService.decrease(window.webContents);
          },
        },
        {
          label: t("menu.resetZoom"),
          accelerator: electronAccelerator(
            shortcuts.zoomReset,
            DEFAULT_APP_SHORTCUTS.zoomReset,
          ),
          click(_menuItem, window) {
            if (window instanceof BrowserWindow)
              zoomService.reset(window.webContents);
          },
        },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: t("menu.history"),
      submenu: [
        {
          label: t("menu.back"),
          click(_menuItem, window) {
            if (window instanceof BrowserWindow)
              window.webContents.navigationHistory.goBack();
          },
          accelerator: electronAccelerator(
            shortcuts.historyBack,
            DEFAULT_APP_SHORTCUTS.historyBack,
          ),
        },
        {
          label: t("menu.forward"),
          click(_menuItem, window) {
            if (window instanceof BrowserWindow)
              window.webContents.navigationHistory.goForward();
          },
          accelerator: electronAccelerator(
            shortcuts.historyForward,
            DEFAULT_APP_SHORTCUTS.historyForward,
          ),
        },
      ],
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: t("menu.help.website"),
          click: () => shell.openExternal(meta.websiteUrl),
        },
        {
          label: t("menu.help.reportBugs"),
          click: () => shell.openExternal(meta.reportBugsUrl),
        },
        {
          label: t("menu.help.documentation"),
          click: () => shell.openExternal(meta.documentationUrl),
        },
      ],
    },
  ];

  if (process.platform === "darwin") {
    template.unshift({
      role: "appMenu",
      label: app.name,
    });
  }

  return template;
}

export function initAppMenu(
  zoomService: IZoomService,
  shortcuts: AppShortcutSettings,
) {
  const menu = Menu.buildFromTemplate(buildTemplate(zoomService, shortcuts));
  Menu.setApplicationMenu(menu);
}

export function showAppMenu() {
  Menu.getApplicationMenu()?.popup();
}
