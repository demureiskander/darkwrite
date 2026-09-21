import { isDescendant, type Note, NoteKind } from "@darkwrite/common";

export type TrashSelection = {
  anchorId: string | null;
  selectedIds: string[];
};

export const emptyTrashSelection: TrashSelection = {
  anchorId: null,
  selectedIds: [],
};

/** Apply Finder-style context, checkbox, or range selection in visible order. */
export function selectTrashItem(
  current: TrashSelection,
  noteId: string,
  visibleIds: string[],
  gesture: "context" | "toggle" | "range",
): TrashSelection {
  if (gesture === "context") {
    if (current.selectedIds.includes(noteId)) return current;
    return { anchorId: noteId, selectedIds: [noteId] };
  }

  if (gesture === "range") {
    const start = visibleIds.indexOf(current.anchorId ?? "");
    const end = visibleIds.indexOf(noteId);
    if (start < 0 || end < 0) {
      return { anchorId: noteId, selectedIds: [noteId] };
    }
    return {
      anchorId: current.anchorId,
      selectedIds: visibleIds.slice(
        Math.min(start, end),
        Math.max(start, end) + 1,
      ),
    };
  }

  return {
    anchorId: noteId,
    selectedIds: current.selectedIds.includes(noteId)
      ? current.selectedIds.filter((id) => id !== noteId)
      : [...current.selectedIds, noteId],
  };
}

/** Include trashed descendants when a selected item is a folder. */
export function resolveTrashBatchIds(
  selectedIds: string[],
  notes: Note[],
): string[] {
  const selected = new Set(selectedIds);
  const selectedFolders = notes.filter(
    (note) =>
      selected.has(note.id) && note.isTrashed && note.kind === NoteKind.Folder,
  );
  const notesById = Object.fromEntries(notes.map((note) => [note.id, note]));

  return (
    notes
      .filter(
        (note) =>
          note.isTrashed &&
          (selected.has(note.id) ||
            selectedFolders.some(
              (folder) =>
                note.workspaceId === folder.workspaceId &&
                isDescendant(note.id, folder.id, notesById) === true,
            )),
      )
      // Delete descendants before their parent; callers retain an ancestor
      // when any of its descendant deletions fail.
      .toSorted((left, right) => {
        if (isDescendant(left.id, right.id, notesById) === true) return -1;
        if (isDescendant(right.id, left.id, notesById) === true) return 1;
        return 0;
      })
      .map((note) => note.id)
  );
}

/** Keep a parent if deleting one of its selected descendants failed. */
export function hasFailedTrashDescendant(
  targetId: string,
  failedIds: string[],
  notesById: Record<string, Note>,
): boolean {
  return failedIds.some(
    (failedId) => isDescendant(failedId, targetId, notesById) === true,
  );
}
