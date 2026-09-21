import { cleanNoteTitle, type Note, NoteKind } from "@darkwrite/common";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAppDispatch } from "@/features/store/hooks";
import { cn } from "@/lib/utils";
import { updateNote } from "../store/note.thunk";

/** Rename a folder or document directly from its current-page heading. */
export function InlineNoteTitle({
  note,
  className,
}: {
  note: Note;
  className?: string;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.title);
  const fallback =
    note.kind === NoteKind.Folder
      ? t("folders.untitled")
      : t("defaults.pageTitle");
  const renameLabel = t(
    note.kind === NoteKind.Folder
      ? "rename.folderTitle"
      : "rename.documentTitle",
  );

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const finish = (save: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setEditing(false);
    if (!save) return;
    const title = cleanNoteTitle(draft).trim();
    if (!title || title === note.title) return;
    void dispatch(updateNote({ id: note.id, title })).match(
      () => undefined,
      () => toast.error(t("rename.error")),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        aria-label={renameLabel}
        className={cn(
          "min-w-0 max-w-full bg-transparent text-inherit outline-none border-b border-primary",
          className,
        )}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => finish(true)}
        onClick={(event) => event.stopPropagation()}
      />
    );
  }

  return (
    <button
      type="button"
      title={renameLabel}
      aria-label={`${renameLabel}: ${note.title || fallback}`}
      className={cn(
        "max-w-full truncate rounded-sm text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
      onClick={(event) => {
        event.stopPropagation();
        finishedRef.current = false;
        setDraft(note.title);
        setEditing(true);
      }}
    >
      {note.title || fallback}
    </button>
  );
}
