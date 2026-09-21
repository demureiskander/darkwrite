import { NoteKind } from "@darkwrite/common";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Input,
} from "@/components/ui";
import { createNote } from "@/features/note/store/note.thunk";
import { useAppDispatch } from "@/features/store/hooks";

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [isCreating, setCreating] = useState(false);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    const title = name.trim();
    if (!title) return;
    setCreating(true);
    const result = await dispatch(
      createNote({
        parentId,
        overrides: { kind: NoteKind.Folder, title },
      }),
    );
    setCreating(false);
    if (result.isOk()) {
      setName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form className="flex flex-col gap-4" onSubmit={create}>
          <DialogTitle>{t("folders.createTitle")}</DialogTitle>
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("folders.namePlaceholder")}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating}>
              {t("folders.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
