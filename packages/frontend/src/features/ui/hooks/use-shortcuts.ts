import { DEFAULT_APP_SHORTCUTS, NoteKind } from "@darkwrite/common";
import { useEffect } from "react";
import { toggleSidebar, useLocalStore } from "@/context/local-state";
import { useFolderSelection } from "@/features/folders/use-folder-selection";
import {
  redoStructuralAction,
  undoStructuralAction,
} from "@/features/history/structural-history";
import {
  duplicateNotes,
  toggleFavorites,
} from "@/features/note/store/note.thunk";
import { selectNoteById } from "@/features/note/store/note-selectors";
import { navigateToFolder } from "@/features/navigation/navigator";
import { showSearch } from "@/features/search/search-state";
import { showSettings } from "@/features/settings/settings-state";
import { useAppDispatch, useAppStore } from "@/features/store/hooks";
import { getCurrentWorkspaceId } from "@/features/workspaces/store/workspace.thunk";
import { matchesShortcut } from "../app-shortcuts";

const isTextEntryTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest("input, textarea, select, [contenteditable='true']") !== null;

export const useShortcuts = (openNoteId: string | null) => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const shortcuts = store.getState().settings.client.shortcuts;
      const command = (id: keyof typeof shortcuts) =>
        matchesShortcut(e, shortcuts[id] ?? DEFAULT_APP_SHORTCUTS[id]);
      const shortcutTargets = () => {
        if (openNoteId) {
          const openNote = selectNoteById(store.getState(), openNoteId);
          return openNote ? [openNote] : [];
        }
        return useFolderSelection
          .getState()
          .selectedItemIds.map((id) => selectNoteById(store.getState(), id))
          .filter((note) => note !== undefined);
      };

      if (command("openSettings")) {
        e.preventDefault();
        showSettings();
        return;
      }

      if (isTextEntryTarget(e.target)) return;

      if (command("quickPreview") && !e.repeat) {
        const selection = useFolderSelection.getState();
        if (selection.previewItemId) {
          e.preventDefault();
          selection.closePreview();
          return;
        }
        if (
          document.querySelector(
            '[role="dialog"], [role="alertdialog"], [role="menu"]',
          )
        )
          return;

        const previewItemId =
          selection.anchorItemId &&
          selection.selectedItemIds.includes(selection.anchorItemId)
            ? selection.anchorItemId
            : selection.selectedItemIds.at(-1);
        if (previewItemId) {
          e.preventDefault();
          selection.openPreview(previewItemId);
        }
        return;
      }

      if (command("parentFolder")) {
        const currentId = openNoteId ?? useLocalStore.getState().activeFolderId;
        if (currentId) {
          const current = selectNoteById(store.getState(), currentId);
          if (current) {
            e.preventDefault();
            navigateToFolder(current.parentId);
          }
        }
      } else if (command("quickSwitch")) {
        e.preventDefault();
        showSearch();
      } else if (command("duplicate")) {
        const documentIds = shortcutTargets()
          .filter((item) => item.kind === NoteKind.Document)
          .map((item) => item.id);
        if (documentIds.length > 0) {
          e.preventDefault();
          dispatch(duplicateNotes(documentIds));
        }
      } else if (command("toggleFavorite")) {
        const itemIds = shortcutTargets().map((item) => item.id);
        if (itemIds.length > 0) {
          e.preventDefault();
          dispatch(toggleFavorites(itemIds));
        }
      } else if (command("redo")) {
        const workspaceId = getCurrentWorkspaceId(store.getState);
        if (workspaceId) {
          e.preventDefault();
          void redoStructuralAction(workspaceId);
        }
      } else if (command("undo")) {
        const workspaceId = getCurrentWorkspaceId(store.getState);
        if (workspaceId) {
          e.preventDefault();
          void undoStructuralAction(workspaceId);
        }
      } else if (command("moveToTrash")) {
        const selection = useFolderSelection.getState();
        if (selection.selectedItemIds.length > 0) {
          e.preventDefault();
          selection.requestTrashConfirmation(selection.selectedItemIds);
        }
      } else if (command("gridView")) {
        e.preventDefault();
        useLocalStore.getState().setFolderViewMode("grid");
      } else if (command("listView")) {
        e.preventDefault();
        useLocalStore.getState().setFolderViewMode("list");
      } else if (command("toggleSidebar")) {
        toggleSidebar();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [dispatch, openNoteId, store]);
};
