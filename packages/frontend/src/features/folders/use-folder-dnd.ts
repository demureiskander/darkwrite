import { type Note, NoteKind, type ParentId } from "@darkwrite/common";
import { type DragEvent, useCallback, useEffect, useState } from "react";
import { beginDrag, DragType, isDragging } from "@/features/dnd/datatransfer";
import { moveFailToast, moveSuccessToast } from "@/features/note/note.toast";
import { canMoveNoteInto } from "@/features/note/store/move-note-validator";
import { moveNote, reorderNote } from "@/features/note/store/note.thunk";
import {
  getMovingNote,
  selectAllNotesAsMap,
} from "@/features/note/store/note-selectors";
import { useAppStore } from "@/features/store/hooks";

export function canDropIntoFolder(
  movingNoteId: string,
  destinationId: ParentId,
  notes: Record<string, Note>,
) {
  if (destinationId !== null) {
    const destination = notes[destinationId];
    if (!destination || destination.kind !== NoteKind.Folder) return false;
  }
  return canMoveNoteInto(movingNoteId, destinationId, notes);
}

export function isAlreadyInFolder(
  movingNoteId: string,
  destinationId: ParentId,
  notes: Record<string, Note>,
) {
  return notes[movingNoteId]?.parentId === destinationId;
}

export function useNodeDrag(noteId: string) {
  return useCallback(
    (event: DragEvent<HTMLElement>) => {
      beginDrag({ type: DragType.NOTE, noteId }, event, "move");
      const preview = document.createElement("div");
      preview.textContent =
        event.currentTarget.textContent?.trim().replace(/\s+/g, " ") ?? "";
      Object.assign(preview.style, {
        position: "fixed",
        top: "-1000px",
        left: "-1000px",
        maxWidth: "180px",
        overflow: "hidden",
        padding: "8px 12px",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        background: "var(--background)",
        color: "var(--foreground)",
        boxShadow: "0 8px 24px rgb(0 0 0 / 0.2)",
        fontSize: "14px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      });
      document.body.append(preview);
      event.dataTransfer.setDragImage(preview, 18, 18);
      requestAnimationFrame(() => preview.remove());
    },
    [noteId],
  );
}

export type ReorderAxis = "horizontal" | "vertical";
export type DropIntent = "before" | "into" | "after";

interface FolderDropOptions {
  acceptsChildren?: boolean;
  allowReorder?: boolean;
  anchorId?: string;
  axis?: ReorderAxis;
}

function resolveDropIntent(
  event: DragEvent<HTMLElement>,
  options: FolderDropOptions,
): DropIntent | null {
  const {
    acceptsChildren = true,
    allowReorder = false,
    anchorId,
    axis = "vertical",
  } = options;
  if (!allowReorder || !anchorId) return acceptsChildren ? "into" : null;
  const rect = event.currentTarget.getBoundingClientRect();
  const position =
    axis === "horizontal"
      ? (event.clientX - rect.left) / rect.width
      : (event.clientY - rect.top) / rect.height;
  const edge = acceptsChildren ? 0.25 : 0.5;
  if (position < edge) return "before";
  if (position > 1 - edge) return "after";
  return acceptsChildren ? "into" : "after";
}

export function useFolderDrop(
  destinationId: ParentId,
  options: FolderDropOptions = {},
) {
  const store = useAppStore();
  const [isDraggingOver, setDraggingOver] = useState(false);
  const [dropIntent, setDropIntent] = useState<DropIntent | null>(null);

  useEffect(() => {
    if (!isDraggingOver) return;
    const reset = () => {
      setDraggingOver(false);
      setDropIntent(null);
    };
    document.addEventListener("drop", reset, true);
    document.addEventListener("dragend", reset, true);
    window.addEventListener("blur", reset);
    return () => {
      document.removeEventListener("drop", reset, true);
      document.removeEventListener("dragend", reset, true);
      window.removeEventListener("blur", reset);
    };
  }, [isDraggingOver]);

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isDragging(event)) return;
    event.preventDefault();
    event.stopPropagation();
    setDraggingOver(true);
  }, []);

  const onDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!isDragging(event)) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      setDraggingOver(true);
      setDropIntent(resolveDropIntent(event, options));
    },
    [options],
  );

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isDragging(event)) return;
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) return;
    event.preventDefault();
    event.stopPropagation();
    setDraggingOver(false);
    setDropIntent(null);
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!isDragging(event)) return;
      event.preventDefault();
      event.stopPropagation();
      setDraggingOver(false);
      const intent = resolveDropIntent(event, options);
      setDropIntent(null);
      const state = store.getState();
      const movingNote = getMovingNote(event, state);
      if (!movingNote) return;
      if ((intent === "before" || intent === "after") && options.anchorId) {
        if (movingNote.id === options.anchorId) return;
        store
          .dispatch(
            reorderNote(
              movingNote.id,
              options.anchorId,
              intent === "before" ? "above" : "below",
            ),
          )
          .andTee(moveSuccessToast)
          .orTee(moveFailToast);
        return;
      }
      if (intent !== "into") return;
      const notes = selectAllNotesAsMap(state);
      if (isAlreadyInFolder(movingNote.id, destinationId, notes)) return;
      if (!canDropIntoFolder(movingNote.id, destinationId, notes)) {
        moveFailToast();
        return;
      }
      store
        .dispatch(moveNote(movingNote.id, destinationId))
        .andTee(moveSuccessToast)
        .orTee(moveFailToast);
    },
    [destinationId, options, store],
  );

  return {
    isDraggingOver,
    dropIntent,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  };
}
