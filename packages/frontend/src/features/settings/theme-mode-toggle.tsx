import type { ThemeMode } from "@darkwrite/common";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppearanceSettings } from "./hooks/use-settings";
import { useSettingsActions } from "./store/settings-actions";

export default function ThemeModeToggle() {
  const { updateSettings } = useSettingsActions();
  const settings = useAppearanceSettings();
  const themeMode = settings.themeMode;
  const activeClassname =
    "border-primary/40 bg-primary/10! text-primary-text shadow-sm hover:text-primary-text";
  const { t } = useTranslation();
  const setMode = (mode: ThemeMode) => {
    if (mode === themeMode) return;
    updateSettings({ appearance: { themeMode: mode } });
  };
  return (
    <div className="flex w-full max-w-160 justify-center">
      <div className="grid w-full grid-cols-3 gap-2 rounded-xl border border-border/50 bg-view-2/70 p-2 top-highlight">
        <Button
          onClick={() => setMode("light")}
          variant={"outline"}
          className={cn(
            "h-20 flex-col gap-1.5 rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm",
            themeMode === "light" && activeClassname,
          )}
        >
          <Sun size={24} />
          {t("settings.appearance.lightMode")}
        </Button>
        <Button
          onClick={() => setMode("system")}
          variant={"outline"}
          className={cn(
            "h-20 flex-col gap-1.5 rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm",
            themeMode === "system" && activeClassname,
          )}
        >
          <Monitor size={24} />
          {t("settings.appearance.systemMode")}
        </Button>
        <Button
          onClick={() => setMode("dark")}
          variant={"outline"}
          className={cn(
            "h-20 flex-col gap-1.5 rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm",
            themeMode === "dark" && activeClassname,
          )}
        >
          <Moon size={24} />
          {t("settings.appearance.darkMode")}
        </Button>
      </div>
    </div>
  );
}
