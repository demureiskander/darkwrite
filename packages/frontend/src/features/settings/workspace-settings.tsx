import type { Workspace } from "@darkwrite/common";
import {
  Cloud,
  Database,
  FolderDown,
  HardDrive,
  Languages,
  PenLine,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Label, Switch } from "@/components/ui";
import WorkspaceIcon from "@/components/workspace-icon";
import { useWorkspaceExport } from "@/features/workspaces/hooks/use-workspace-export";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useCurrentWorkspace } from "../workspaces/hooks/use-workspace";
import { updateWorkspace } from "../workspaces/store/workspace.thunk";
import { selectWorkspaceCount } from "../workspaces/store/workspace-selectors";
import { LanguageChooser } from "./components/language-chooser";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import EditWorkspaceDialog from "./edit-workspace-dialog";
import { useSettings } from "./hooks/use-settings";
import { RestoreDataDialog } from "./restore-dialog";
import SettingsCard from "./settings-card";
import { useSettingsActions } from "./store/settings-actions";

export default function WorkspaceSettings() {
  const currentWorkspace = useCurrentWorkspace();
  const workspaceCount = useAppSelector((state) => selectWorkspaceCount(state));
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { t: tW } = useTranslation("translation", {
    keyPrefix: "sidebar.workspace",
  });
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const save = (w: Workspace) => {
    dispatch(updateWorkspace(w.id, w)).map(() => setEditDialogOpen(false));
  };
  const settings = useSettings();
  const exporter = useWorkspaceExport();
  const { updateSettings } = useSettingsActions();

  const setIndentSize = (val: number) => {
    updateSettings({ editor: { codeIndentSize: val } });
  };

  const toggleOpenItemsOnDoubleClick = (val: boolean) => {
    updateSettings({ client: { openItemsOnDoubleClick: val } });
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 px-1 pt-3">
      {currentWorkspace && (
        <SettingsCard className="gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 gap-4">
              <WorkspaceIcon
                className="size-15 shrink-0 rounded-xl text-2xl"
                workspace={currentWorkspace}
              />
              <div className="flex min-w-0 flex-col justify-center">
                <h1 className="truncate text-xl font-semibold">
                  {currentWorkspace.name}
                </h1>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  {currentWorkspace.config.syncMode === "offline" ? (
                    <HardDrive size={16} />
                  ) : (
                    <Cloud size={16} />
                  )}
                  {tW(currentWorkspace.config.syncMode)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <EditWorkspaceDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                workspace={currentWorkspace}
                onSave={save}
                key={`${currentWorkspace.id}:${editDialogOpen}`}
              >
                <Button variant={"secondary"} className="w-fit rounded-lg">
                  <PenLine size={16} />
                  {t("settings.workspace.editWorkspace")}
                </Button>
              </EditWorkspaceDialog>
              <DeleteWorkspaceDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                workspace={currentWorkspace}
              >
                <Button
                  variant={"destructive"}
                  disabled={workspaceCount <= 1}
                  className="w-fit rounded-lg bg-transparent"
                >
                  {t("settings.workspace.deleteWorkspace")}
                </Button>
              </DeleteWorkspaceDialog>
            </div>
          </div>
        </SettingsCard>
      )}
      <SettingsCard>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-background/25 p-3">
          <Label className="flex items-center gap-2 font-medium">
            <Languages className="size-5" />
            {t("settings.workspace.languageText")}
          </Label>
          <LanguageChooser
            value={i18n.language}
            onValueChange={i18n.changeLanguage}
          />
        </div>
      </SettingsCard>
      <SettingsCard className="gap-0 divide-y divide-border/60">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="indent-size-input">
              {t("settings.workspace.codeBlockIndentSize")}
            </Label>
            <p className="text-sm text-foreground/70">
              {t("settings.workspace.codeBlockIndentSizeDescription")}
            </p>
          </div>
          <Input
            type="number"
            className="w-fit max-w-16 bg-secondary border-none top-highlight"
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!Number.isNaN(val) && val > 0) {
                setIndentSize(val);
              }
            }}
            value={settings.editor.codeIndentSize}
          />
        </div>
      </SettingsCard>
      <SettingsCard>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-background/25 p-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="double-click-items-switch">
              {t("settings.workspace.openItemsOnDoubleClick")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("settings.workspace.openItemsOnDoubleClickDescription")}
            </p>
          </div>
          <Switch
            id="double-click-items-switch"
            checked={settings.client.openItemsOnDoubleClick ?? true}
            onCheckedChange={toggleOpenItemsOnDoubleClick}
          />
        </div>
      </SettingsCard>
      <SettingsCard className="gap-5">
        <div className="flex items-center gap-2 font-medium">
          <Database size={20} />
          <span>{t("settings.workspace.dataManagement")}</span>
        </div>
        <div className="flex flex-wrap gap-2 rounded-lg bg-background/25 p-3">
          <Button
            disabled={exporter.exporting}
            variant={"secondary"}
            onClick={() => exporter.export()}
          >
            <FolderDown size={20} />
            {t("settings.workspace.exportAllButton")}
          </Button>
          <RestoreDataDialog />
        </div>
      </SettingsCard>
    </div>
  );
}
