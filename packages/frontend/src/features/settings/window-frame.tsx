import { useTranslation } from "react-i18next";
import { Label, Switch } from "@/components/ui";
import { useSettings } from "./hooks/use-settings";
import { useSettingsActions } from "./store/settings-actions";
import SettingsCard from "./settings-card";

export function WindowFrameSettings() {
  const { t } = useTranslation("translation");
  const { updateSettings } = useSettingsActions();
  const settings = useSettings();

  const toggleUseSystemWindowFrame = (value: boolean) => {
    updateSettings({ appearance: { useSystemWindowFrame: value } });
  };

  return (
    <SettingsCard>
      <div className="flex items-center justify-between rounded-lg bg-background/25 p-3">
        <Label htmlFor="switch-use-system-window-frame">
          {t("settings.appearance.useSystemWindowFrame")}
        </Label>
        <Switch
          id="switch-use-system-window-frame"
          checked={settings.appearance.useSystemWindowFrame}
          onCheckedChange={toggleUseSystemWindowFrame}
        />
      </div>
    </SettingsCard>
  );
}
