import { useTranslation } from "react-i18next";
import FontSelect from "@/components/font-select";
import { useFontSettings } from "./hooks/use-settings";
import { useSettingsActions } from "./store/settings-actions";
import SettingsCard from "./settings-card";

export default function FontSettings() {
  const settings = useFontSettings();
  const { code, sans, ui } = settings;
  const { updateSettings } = useSettingsActions();
  const { t } = useTranslation("translation", { keyPrefix: "settings.fonts" });
  const setFont = (type: "ui" | "code" | "sans", value: string) => {
    updateSettings({ appearance: { fonts: { [type]: value } } });
  };
  const fontOptions = [
    {
      id: "ui" as const,
      label: t("uiText"),
      systemDefault: "system-ui",
      systemDefaultLabel: t("systemDefaultUi"),
      value: ui,
      monospace: false,
    },
    {
      id: "sans" as const,
      label: t("sansText"),
      systemDefault: "system-ui",
      systemDefaultLabel: t("systemDefaultSans"),
      value: sans,
      monospace: false,
    },
    {
      id: "code" as const,
      label: t("monoText"),
      systemDefault: "ui-monospace",
      systemDefaultLabel: t("systemDefaultCode"),
      value: code,
      monospace: true,
    },
  ];
  return (
    <SettingsCard>
      <div>
        <h2 className="font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fontOptions.map((option) => (
          <div
            key={option.id}
            className={`flex flex-col gap-2 rounded-lg bg-background/25 p-3 ${
              option.id === "ui" ? "sm:col-span-2" : ""
            }`}
          >
            <label className="font-medium" htmlFor={`font-${option.id}`}>
              {option.label}
            </label>
            <FontSelect
              id={`font-${option.id}`}
              className="min-w-0 bg-view-1/50"
              value={option.value}
              systemDefault={option.systemDefault}
              systemDefaultLabel={option.systemDefaultLabel}
              monospace={option.monospace}
              onValueChange={(value) => setFont(option.id, value)}
            />
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
