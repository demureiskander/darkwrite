import { CatppuccinLatte, DarkwriteDefault } from "@darkwrite/common";
import { useEffect } from "react";
import { useAppearanceSettings } from "@/features/settings/hooks/use-settings";
import useSystemTheme from "@/features/themes/hooks/use-system-theme";
import { useThemes } from "@/features/themes/hooks/use-themes";
import { applyFonts, applyTheme } from "@/lib/theme-util";

export default function ThemeHandler() {
  const themes = useThemes();
  const appearanceSettings = useAppearanceSettings();
  const systemTheme = useSystemTheme();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      appearanceSettings.accentColor,
    );
    document.documentElement.style.setProperty(
      "--primary-text",
      appearanceSettings.accentColor,
    );
  }, [appearanceSettings.accentColor]);

  useEffect(() => {
    const themeMode =
      appearanceSettings.themeMode === "system"
        ? systemTheme
        : appearanceSettings.themeMode;
    const themeId =
      themeMode === "dark"
        ? appearanceSettings.darkColorScheme
        : appearanceSettings.lightColorScheme;
    const configuredTheme = themes[themeId];
    const theme =
      configuredTheme?.mode === themeMode
        ? configuredTheme
        : themeMode === "dark"
          ? DarkwriteDefault
          : CatppuccinLatte;

    applyTheme(theme);
    applyFonts(appearanceSettings.fonts);
  }, [appearanceSettings, systemTheme, themes]);

  return <></>;
}
