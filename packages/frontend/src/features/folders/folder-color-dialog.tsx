import { HexColorPicker } from "react-colorful";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Input,
} from "@/components/ui";
import { useAppDispatch } from "@/features/store/hooks";
import {
  hexToRgb,
  normalizeFolderColor,
  rgbToHex,
  setFolderColor,
} from "./folder-color";

const FALLBACK_COLOR = "#0a84ff";

export function FolderColorDialog({
  folderId,
  initialColor,
  open,
  onOpenChange,
}: {
  folderId: string;
  initialColor: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [colorInput, setColorInput] = useState(FALLBACK_COLOR);
  const validColor = normalizeFolderColor(colorInput);
  const rgb = useMemo(
    () => hexToRgb(validColor ?? FALLBACK_COLOR),
    [validColor],
  );

  useEffect(() => {
    if (open) setColorInput(initialColor ?? FALLBACK_COLOR);
  }, [initialColor, open]);

  const updateChannel = (channel: "red" | "green" | "blue", value: string) => {
    const number = Number.parseInt(value, 10);
    setColorInput(
      rgbToHex(
        channel === "red" ? number : rgb.red,
        channel === "green" ? number : rgb.green,
        channel === "blue" ? number : rgb.blue,
      ),
    );
  };

  const apply = () => {
    if (!validColor) return;
    dispatch(setFolderColor(folderId, validColor));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <div className="flex flex-col gap-4">
          <DialogTitle>{t("folders.color.customTitle")}</DialogTitle>
          <HexColorPicker
            className="w-full!"
            color={validColor ?? FALLBACK_COLOR}
            onChange={setColorInput}
          />
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">
              {t("folders.color.hex")}
            </span>
            <Input
              value={colorInput}
              onChange={(event) => setColorInput(event.target.value)}
              aria-invalid={!validColor}
              spellCheck={false}
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["red", "green", "blue"] as const).map((channel) => (
              <label key={channel} className="grid gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t(`folders.color.${channel}`)}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[channel]}
                  onChange={(event) =>
                    updateChannel(channel, event.target.value)
                  }
                />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={!validColor} onClick={apply}>
              {t("folders.color.apply")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
