import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, Label } from "@/components/ui";
import {
  clampCanvasWidth,
  MAX_CANVAS_WIDTH,
  MIN_CANVAS_WIDTH,
} from "@/features/layout/canvas-width";
import { useSettings } from "./hooks/use-settings";
import SettingsCard from "./settings-card";
import { useSettingsActions } from "./store/settings-actions";

export function CanvasWidthSettings() {
  const { t } = useTranslation();
  const { client } = useSettings();
  const { updateSettingsDebounced } = useSettingsActions();
  const width = clampCanvasWidth(client.canvasWidthPx ?? 960);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(width));
  useEffect(() => {
    if (!editing) setInputValue(String(width));
  }, [editing, width]);
  const updateWidth = (value: number) => {
    if (!Number.isFinite(value)) return;
    updateSettingsDebounced({
      client: { canvasWidthPx: clampCanvasWidth(value) },
    });
  };

  return (
    <SettingsCard>
      <div className="flex items-start justify-between gap-4 rounded-lg bg-background/25 p-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="canvas-width-slider" className="font-medium">
            {t("settings.appearance.canvasWidth")}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t("settings.appearance.canvasWidthDescription")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Input
            type="number"
            min={MIN_CANVAS_WIDTH}
            max={MAX_CANVAS_WIDTH}
            step={1}
            className="w-22"
            value={inputValue}
            aria-label={t("settings.appearance.canvasWidth")}
            onFocus={() => setEditing(true)}
            onChange={(event) => setInputValue(event.target.value)}
            onBlur={() => {
              if (inputValue.trim()) updateWidth(Number(inputValue));
              setEditing(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>
      </div>
      <div className="px-3 pb-1">
        <input
          id="canvas-width-slider"
          type="range"
          min={MIN_CANVAS_WIDTH}
          max={MAX_CANVAS_WIDTH}
          step={10}
          value={width}
          onChange={(event) => updateWidth(Number(event.target.value))}
          className="w-full accent-primary"
        />
      </div>
    </SettingsCard>
  );
}
