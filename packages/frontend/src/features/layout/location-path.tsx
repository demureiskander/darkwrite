import { type Note, NoteKind } from "@darkwrite/common";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FolderIcon } from "@/components/folder-icon";
import { Button } from "@/components/ui/button";
import { useLocalStore } from "@/context/local-state";
import { FolderDropZone } from "@/features/folders/folder-dnd";
import { InlineNoteTitle } from "@/features/note/components/inline-note-title";
import {
  navigateToFolder,
  navigateToNote,
} from "@/features/navigation/navigator";
import {
  selectAllNotesAsMap,
  selectParentIdTree,
} from "@/features/note/store/note-selectors";
import { useAppSelector } from "@/features/store/hooks";
import { cn, getNoteIcon } from "@/lib/utils";

function PathItem({ current, note }: { current: boolean; note: Note }) {
  const { t } = useTranslation();
  const title =
    note.title ||
    (note.kind === NoteKind.Folder
      ? t("folders.untitled")
      : t("defaults.pageTitle"));
  const icon =
    note.kind === NoteKind.Folder ? (
      <FolderIcon size={15} folderColor={note.folderColor} />
    ) : (
      getNoteIcon(note.icon, "shrink-0")
    );
  const content = current ? (
    <div
      className="flex h-8 min-w-0 items-center gap-2 px-1.5 font-medium"
      aria-current="page"
      title={title}
    >
      {icon}
      <InlineNoteTitle note={note} className="min-w-0" />
    </div>
  ) : (
    <Button
      type="button"
      variant="ghost"
      className="h-8 min-w-0 shrink px-1.5"
      onClick={() => {
        if (note.kind === NoteKind.Folder) navigateToFolder(note.id);
        else navigateToNote(note.id);
      }}
      title={title}
    >
      {icon}
      <span className="truncate">{title}</span>
    </Button>
  );

  if (note.kind !== NoteKind.Folder) return content;
  return (
    <FolderDropZone destinationId={note.id} className="min-w-0 shrink">
      {content}
    </FolderDropZone>
  );
}

export function LocationPath({
  className,
  documentId,
}: {
  className?: string;
  documentId?: string | null;
}) {
  const { t } = useTranslation();
  const activeFolderId = useLocalStore((state) => state.activeFolderId);
  const locationId = documentId ?? activeFolderId ?? "";
  const notes = useAppSelector(selectAllNotesAsMap);
  const parentIds = useAppSelector((state) =>
    selectParentIdTree(state, locationId),
  );
  const pathItems = parentIds.flatMap((id) => {
    const note = notes[id];
    return note ? [note] : [];
  });
  const current = notes[locationId];
  if (current) pathItems.push(current);

  return (
    <nav
      aria-label={t("titlebar.locationPath")}
      className={cn(
        "flex min-w-0 max-w-[min(48vw,42rem)] items-center gap-1 overflow-hidden",
        className,
      )}
    >
      <FolderDropZone destinationId={null} className="shrink-0">
        {pathItems.length === 0 ? (
          <div
            className="flex h-8 items-center gap-2 px-2 font-medium"
            aria-current="page"
          >
            <Home size={17} />
            <span>{t("folders.root")}</span>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => navigateToFolder(null)}
            title={t("folders.root")}
          >
            <Home size={17} />
            <span>{t("folders.root")}</span>
          </Button>
        )}
      </FolderDropZone>
      {pathItems.map((note, index) => (
        <div key={note.id} className="flex min-w-0 shrink items-center gap-1">
          <ChevronRight size={14} className="shrink-0 opacity-50" />
          <PathItem current={index === pathItems.length - 1} note={note} />
        </div>
      ))}
    </nav>
  );
}
