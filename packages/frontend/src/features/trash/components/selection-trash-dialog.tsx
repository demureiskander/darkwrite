import { NoteKind } from "@darkwrite/common";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
} from "@/components/ui";
import { useFolderSelection } from "@/features/folders/use-folder-selection";
import { selectAllNotesAsMap } from "@/features/note/store/note-selectors";
import { moveManyToTrash } from "@/features/note/store/note.thunk";
import notify from "@/features/notifications/notify";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";

export function SelectionTrashDialog() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotesAsMap);
  const pendingIds = useFolderSelection((state) => state.pendingTrashItemIds);
  const close = useFolderSelection((state) => state.closeTrashConfirmation);
  const clearSelection = useFolderSelection((state) => state.clearSelection);
  const [working, setWorking] = useState(false);
  const selected = (pendingIds ?? [])
    .map((id) => notes[id])
    .filter((note) => note !== undefined);
  const single = selected.length === 1 ? selected[0] : undefined;

  const confirm = async () => {
    if (!pendingIds?.length || working) return;
    setWorking(true);
    const result = await dispatch(moveManyToTrash(pendingIds));
    setWorking(false);
    if (result.isErr()) {
      notify.error(t("selectionTrashDialog.error"));
      return;
    }
    clearSelection();
    close();
    notify.success(t("selectionTrashDialog.success"));
  };

  return (
    <AlertDialog
      open={pendingIds !== null}
      onOpenChange={(open) => {
        if (!open && !working) close();
      }}
    >
      <AlertDialogContent className="max-w-md!">
        <AlertDialogTitle>
          {single
            ? t("selectionTrashDialog.singleTitle", {
                name: single.title || t("defaults.pageTitle"),
              })
            : t("selectionTrashDialog.multipleTitle", {
                count: selected.length,
              })}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {single?.kind === NoteKind.Folder
            ? t("selectionTrashDialog.folderDescription")
            : single
              ? t("selectionTrashDialog.documentDescription")
              : t("selectionTrashDialog.multipleDescription")}
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            className="w-1/2"
            disabled={working}
            onClick={close}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            className="w-1/2"
            disabled={working || selected.length === 0}
            onClick={confirm}
          >
            {t("selectionTrashDialog.confirm")}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
