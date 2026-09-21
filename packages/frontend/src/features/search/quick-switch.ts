import type { Note } from "@darkwrite/common";
import Fuse from "fuse.js";

export interface QuickSwitchItem {
  note: Note;
  parentPath: Note[];
  searchText: string;
}

function resolveParentPath(note: Note, notes: Record<string, Note>) {
  const path: Note[] = [];
  const seen = new Set<string>([note.id]);
  let parentId = note.parentId;
  while (parentId) {
    if (seen.has(parentId)) break;
    const parent = notes[parentId];
    if (!parent) break;
    seen.add(parentId);
    path.unshift(parent);
    parentId = parent.parentId;
  }
  return path;
}

export function quickSwitchItems(
  allNotes: Note[],
  workspaceId: string | null,
  query: string,
) {
  if (!workspaceId) return [];
  const workspaceNotes = allNotes.filter(
    (note) => note.workspaceId === workspaceId && !note.isTrashed,
  );
  const noteMap = Object.fromEntries(
    workspaceNotes.map((note) => [note.id, note]),
  );
  const items: QuickSwitchItem[] = workspaceNotes.map((note) => {
    const parentPath = resolveParentPath(note, noteMap);
    return {
      note,
      parentPath,
      searchText: [...parentPath.map((parent) => parent.title), note.title]
        .join(" ")
        .trim(),
    };
  });

  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    return new Fuse(items, {
      keys: ["note.title", "searchText"],
      threshold: 0.4,
    })
      .search(trimmedQuery, { limit: 50 })
      .map((result) => result.item);
  }

  return items
    .toSorted((a, b) => {
      if (a.note.isFavorite !== b.note.isFavorite)
        return a.note.isFavorite ? -1 : 1;
      return b.note.modifiedAt.localeCompare(a.note.modifiedAt);
    })
    .slice(0, 12);
}
