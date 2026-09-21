import {
  APP_SHORTCUT_IDS,
  type AppShortcutId,
  DEFAULT_APP_SHORTCUTS,
} from "@darkwrite/common";
import { Keyboard, RotateCcw } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import {
  formatShortcut,
  shortcutFromKeyboardEvent,
} from "@/features/ui/app-shortcuts";
import { useSettings } from "./hooks/use-settings";
import SettingsCard from "./settings-card";
import { useSettingsActions } from "./store/settings-actions";

const GROUPS: Array<{
  id: "objects" | "navigation" | "view" | "history";
  commands: AppShortcutId[];
}> = [
  {
    id: "objects",
    commands: [
      "newNote",
      "quickSwitch",
      "openSettings",
      "duplicate",
      "toggleFavorite",
      "moveToTrash",
      "quickPreview",
    ],
  },
  {
    id: "navigation",
    commands: ["parentFolder", "historyBack", "historyForward"],
  },
  {
    id: "view",
    commands: [
      "gridView",
      "listView",
      "toggleSidebar",
      "zoomIn",
      "zoomOut",
      "zoomReset",
    ],
  },
  { id: "history", commands: ["undo", "redo"] },
];

export function ShortcutSettings() {
  const { t } = useTranslation();
  const { client } = useSettings();
  const shortcuts = { ...DEFAULT_APP_SHORTCUTS, ...client.shortcuts };
  const { updateSettings } = useSettingsActions();
  const [recording, setRecording] = useState<AppShortcutId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateShortcut = (id: AppShortcutId, shortcut: string) => {
    updateSettings({
      client: {
        shortcuts: { ...shortcuts, [id]: shortcut },
      },
    });
  };

  const record = (id: AppShortcutId, event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Escape") {
      setRecording(null);
      setMessage(null);
      return;
    }

    const shortcut = shortcutFromKeyboardEvent(event.nativeEvent);
    if (!shortcut) {
      setMessage(t("settings.shortcuts.unsupported"));
      return;
    }
    const conflict = APP_SHORTCUT_IDS.find(
      (otherId) => otherId !== id && shortcuts[otherId] === shortcut,
    );
    if (conflict) {
      setMessage(
        t("settings.shortcuts.conflict", {
          command: t(`settings.shortcuts.commands.${conflict}`),
        }),
      );
      return;
    }

    updateShortcut(id, shortcut);
    setRecording(null);
    setMessage(null);
  };

  return (
    <SettingsCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Keyboard size={18} />
            {t("settings.shortcuts.title")}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("settings.shortcuts.description")}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            updateSettings({ client: { shortcuts: DEFAULT_APP_SHORTCUTS } });
            setRecording(null);
            setMessage(null);
          }}
        >
          <RotateCcw size={15} />
          {t("settings.shortcuts.resetAll")}
        </Button>
      </div>
      {message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      )}
      <div className="flex flex-col gap-5 border-t border-border/60 pt-4">
        {GROUPS.map((group) => (
          <section key={group.id} className="flex flex-col gap-1">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t(`settings.shortcuts.groups.${group.id}`)}
            </h3>
            {group.commands.map((id) => (
              <div
                key={id}
                className="flex min-h-9 items-center justify-between gap-4 rounded-md px-2 hover:bg-secondary/25"
              >
                <span className="text-sm">
                  {t(`settings.shortcuts.commands.${id}`)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-pressed={recording === id}
                    className="min-w-24 rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-center text-xs font-medium outline-none transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/10"
                    onClick={() => {
                      setRecording(id);
                      setMessage(null);
                    }}
                    onKeyDown={(event) => {
                      if (recording === id) record(id, event);
                    }}
                    onBlur={() => {
                      if (recording === id) setRecording(null);
                    }}
                  >
                    {recording === id
                      ? t("settings.shortcuts.pressKeys")
                      : formatShortcut(shortcuts[id])}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={shortcuts[id] === DEFAULT_APP_SHORTCUTS[id]}
                    aria-label={t("settings.shortcuts.resetOne")}
                    onClick={() =>
                      updateShortcut(id, DEFAULT_APP_SHORTCUTS[id])
                    }
                  >
                    <RotateCcw size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </SettingsCard>
  );
}
