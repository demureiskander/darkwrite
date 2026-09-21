import {
  type DarkwriteUserSettings,
  getDefaultUserSettings,
  mergeUserSettings,
} from "./settings";
import type { SettingsV1Schema } from "./settings-v1-schema";

function migrateToV2(v1: SettingsV1Schema) {
  const v2 = getDefaultUserSettings();
  v2.appearance.accentColor = v1.appearance.accentColor;
  v2.appearance.experimental.darwinCustomTitlebarEnabled =
    v1.appearance.enableCustomWindowFrameOnDarwin;
  v2.appearance.fonts = v1.fonts;
  v2.appearance.useSystemWindowFrame = v1.appearance.useSystemWindowFrame;
  v2.appearance.useSystemAccentColor = v1.appearance.useSystemAccentColor;
  v2.appearance.darkColorScheme = v1.appearance.theme;
  v2.editor.codeIndentSize = v1.editor.codeBlockIndentSize;
  v2.client.autoUpdateCheck = v1.updateCheckEnabled;
  v2.client.language = "en";

  return v2;
}

function migrateToV3(v2: DarkwriteUserSettings) {
  const v3 = mergeUserSettings(v2);
  const { fonts } = v3.appearance;
  if (fonts.ui === "system-ui") fonts.ui = "Inter";
  if (fonts.sans === "system-ui") fonts.sans = "Manrope";
  if (fonts.code === "ui-monospace") fonts.code = "JetBrains Mono";
  v3.version = 3;
  return v3;
}

export function migrateSettings(obj: unknown): DarkwriteUserSettings {
  if (typeof obj !== "object" || obj == null || !("version" in obj))
    return getDefaultUserSettings();

  if (obj.version === "1") return migrateToV2(obj as SettingsV1Schema);
  if (obj.version === 2) return migrateToV3(obj as DarkwriteUserSettings);
  if (obj.version === 3)
    return mergeUserSettings(obj as Partial<DarkwriteUserSettings>);
  return getDefaultUserSettings();
}
