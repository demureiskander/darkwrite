import { Folder } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DarkwriteAPIClient } from "@/api/api-client";
import { Button } from "@/components/ui";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAppStore } from "../store/hooks";
import useSystemTheme from "../themes/hooks/use-system-theme";
import { useThemes } from "../themes/hooks/use-themes";
import { initializeThemes } from "../themes/init";
import { useAppearanceSettings } from "./hooks/use-settings";
import { useSettingsActions } from "./store/settings-actions";
import SettingsCard from "./settings-card";

export function ThemeDropdown(props: {
  className?: string;
  mode: "dark" | "light";
  value: string;
  onValueChange: (value: string) => void;
}) {
  const themes = useThemes();
  const entries = Object.values(themes).filter(
    (theme) => theme.mode === props.mode,
  );
  return (
    <Select value={props.value} onValueChange={props.onValueChange}>
      <SelectTrigger
        className={cn(
          props.className,
          "max-w-fit dark:bg-secondary/50 bg-secondary",
        )}
      >
        {themes[props.value]?.name}
      </SelectTrigger>
      <SelectContent>
        {entries.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ThemeChooser() {
  const settings = useAppearanceSettings();
  const accentColor = settings.accentColor;
  const systemTheme = useSystemTheme();
  const themes = useThemes();
  const activeMode =
    settings.themeMode === "system" ? systemTheme : settings.themeMode;
  const configuredThemeId =
    activeMode === "dark"
      ? settings.darkColorScheme
      : settings.lightColorScheme;
  const activeThemeId =
    themes[configuredThemeId]?.mode === activeMode
      ? configuredThemeId
      : (Object.values(themes).find((theme) => theme.mode === activeMode)?.id ??
        configuredThemeId);
  const { t } = useTranslation("translation");
  const store = useAppStore();
  const importTheme = async () => {
    await DarkwriteAPIClient.theme.importTheme();
    initializeThemes(store);
  };
  const { updateAccentColor, updateSettings } = useSettingsActions();

  const setScheme = (mode: "dark" | "light", id: string) => {
    updateSettings({
      appearance: {
        [mode === "dark" ? "darkColorScheme" : "lightColorScheme"]: id,
      },
    });
  };

  return (
    <SettingsCard>
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">
          {t("settings.appearance.colorThemeText")}
        </span>
        <div className="flex items-center gap-2">
          <ThemeDropdown
            className="max-w-full"
            mode={activeMode}
            value={activeThemeId}
            onValueChange={(value) => setScheme(activeMode, value)}
          />
          <Button className="w-fit" variant={"outline"} onClick={importTheme}>
            <Folder size={18} />
            {t("settings.appearance.importTooltip")}
          </Button>
        </div>
      </div>
      <div className="h-px bg-border/60" />
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {t("settings.appearance.accentColorText")}
        </span>
        <ColorPicker value={accentColor} onChange={updateAccentColor} />
      </div>
    </SettingsCard>
  );
}
