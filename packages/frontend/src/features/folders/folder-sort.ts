import { type Note, NoteKind, Rank } from "@darkwrite/common";
import type { FolderSortMode } from "@/context/local-state";

export function sortFolderItems(notes: Note[], mode: FolderSortMode) {
  return notes.toSorted((a, b) => {
    if (a.kind !== b.kind) return a.kind === NoteKind.Folder ? -1 : 1;
    if (mode === "manual") return Rank.sorter(a.orderHint, b.orderHint);
    if (mode === "name-asc" || mode === "name-desc") {
      const result = a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return mode === "name-asc" ? result : -result;
    }
    const result = a.modifiedAt.localeCompare(b.modifiedAt);
    return mode === "modified-asc" ? result : -result;
  });
}
