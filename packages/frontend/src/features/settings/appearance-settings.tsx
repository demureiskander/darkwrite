import FontSettings from "./font-settings";
import { CanvasWidthSettings } from "./canvas-width-settings";
import { ShortcutSettings } from "./shortcut-settings";
import { ThemeChooser } from "./theme-chooser";
import ThemeModeToggle from "./theme-mode-toggle";

export default function AppearanceSettings() {
  return (
    <div className="flex w-full flex-col items-center gap-4 px-1 pt-3">
      <ThemeModeToggle />
      <ThemeChooser />
      <FontSettings />
      <CanvasWidthSettings />
      <ShortcutSettings />
    </div>
  );
}
