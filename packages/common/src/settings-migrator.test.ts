import { DEFAULT_APP_SHORTCUTS, getDefaultUserSettings } from "./settings";
import { migrateSettings } from "./settings-migrator";

describe("settings migration", () => {
  it("replaces legacy system font defaults with bundled fonts once", () => {
    const settings = { ...getDefaultUserSettings(), version: 2 };
    settings.appearance.fonts = {
      ...settings.appearance.fonts,
      ui: "system-ui",
      sans: "system-ui",
      code: "ui-monospace",
    };

    const migrated = migrateSettings(settings);

    expect(migrated.version).toBe(3);
    expect(migrated.appearance.fonts).toMatchObject({
      ui: "Inter",
      sans: "Manrope",
      code: "JetBrains Mono",
    });
  });

  it("adds new defaults to existing version 2 settings", () => {
    const settings = getDefaultUserSettings();
    const { zoomFactor: _zoomFactor, ...client } = settings.client;

    const migrated = migrateSettings({ ...settings, client });

    expect(migrated.client.zoomFactor).toBe(1);
  });

  it("preserves an existing zoom factor", () => {
    const settings = getDefaultUserSettings();
    settings.client.zoomFactor = 1.5;

    expect(migrateSettings(settings).client.zoomFactor).toBe(1.5);
  });

  it("adds shortcut defaults to existing version 2 settings", () => {
    const settings = getDefaultUserSettings();
    const { shortcuts: _shortcuts, ...client } = settings.client;

    const migrated = migrateSettings({ ...settings, client });

    expect(migrated.client.shortcuts).toEqual(DEFAULT_APP_SHORTCUTS);
  });

  it("defaults existing workspaces to double-click opening", () => {
    const settings = getDefaultUserSettings();
    const { openItemsOnDoubleClick: _clicks, ...client } = settings.client;

    const migrated = migrateSettings({ ...settings, client });

    expect(migrated.client.openItemsOnDoubleClick).toBe(true);
  });

  it("preserves a saved one-click opening preference", () => {
    const settings = getDefaultUserSettings();
    settings.client.openItemsOnDoubleClick = false;

    expect(migrateSettings(settings).client.openItemsOnDoubleClick).toBe(false);
  });

  it("adds a shared canvas width to older profiles", () => {
    const settings = getDefaultUserSettings();
    const { canvasWidthPx: _canvasWidth, ...client } = settings.client;

    expect(migrateSettings({ ...settings, client }).client.canvasWidthPx).toBe(
      960,
    );
  });

  it("preserves a custom canvas width", () => {
    const settings = getDefaultUserSettings();
    settings.client.canvasWidthPx = 1120;

    expect(migrateSettings(settings).client.canvasWidthPx).toBe(1120);
  });

  it("preserves customized shortcuts while filling missing commands", () => {
    const settings = getDefaultUserSettings();
    const {
      openSettings: _openSettings,
      zoomReset: _zoomReset,
      ...shortcuts
    } = settings.client.shortcuts;
    shortcuts.quickSwitch = "CmdOrCtrl+J";

    const migrated = migrateSettings({
      ...settings,
      client: { ...settings.client, shortcuts },
    });

    expect(migrated.client.shortcuts.quickSwitch).toBe("CmdOrCtrl+J");
    expect(migrated.client.shortcuts.zoomReset).toBe(
      DEFAULT_APP_SHORTCUTS.zoomReset,
    );
    expect(migrated.client.shortcuts.openSettings).toBe(
      DEFAULT_APP_SHORTCUTS.openSettings,
    );
  });
});
