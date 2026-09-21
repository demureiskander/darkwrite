import { getDefaultUserSettings } from "./settings";
import { migrateSettings } from "./settings-migrator";
describe("settings migration", () => {
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
});
