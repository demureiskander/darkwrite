import { NoteKind } from "@darkwrite/common";
import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Input,
} from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { selectNoteById } from "../store/note-selectors";
import { updateNote } from "../store/note.thunk";
import { RenameNoteDialogPortal } from "../store/notes-ui-actions";

export function RenameNoteDialog() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { noteId, open } = useAppSelector(
    (state) => state.noteUi.renameNoteDialog,
  );
  const note = useAppSelector((state) =>
    noteId ? selectNoteById(state, noteId) : undefined,
  );
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const { hideRenameNoteDialog } = RenameNoteDialogPortal(dispatch);

  useEffect(() => {
    if (open) setName(note?.title ?? "");
  }, [note?.title, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!noteId || !name.trim() || saving) return;
    setSaving(true);
    const result = await dispatch(
      updateNote({ id: noteId, title: name.trim() }),
    );
    setSaving(false);
    if (result.isOk()) hideRenameNoteDialog();
    else toast.error(t("rename.error"));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(show) => {
        if (!show) hideRenameNoteDialog();
      }}
    >
      <DialogContent className="max-w-sm">
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <DialogTitle>
            {t(
              note?.kind === NoteKind.Folder
                ? "rename.folderTitle"
                : "rename.documentTitle",
            )}
          </DialogTitle>
          <Input
            autoFocus
            value={name}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("rename.placeholder")}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={hideRenameNoteDialog}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {t("rename.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
