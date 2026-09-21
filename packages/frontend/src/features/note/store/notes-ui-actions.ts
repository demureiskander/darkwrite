import type { AppDispatch } from "@/features/store/types";
import { notesUiSlice } from "./notes-ui-slice";

export function MoveNoteDialogPortal(dispatch: AppDispatch) {
  function showMoveNoteDialog(noteId: string) {
    dispatch(
      notesUiSlice.actions.showMoveNoteDialog({
        noteId,
      }),
    );
  }

  function hideMoveNoteDialog() {
    dispatch(notesUiSlice.actions.closeMoveNoteDialog());
  }

  return { showMoveNoteDialog, hideMoveNoteDialog };
}

export function RenameNoteDialogPortal(dispatch: AppDispatch) {
  function showRenameNoteDialog(noteId: string) {
    dispatch(notesUiSlice.actions.showRenameNoteDialog({ noteId }));
  }

  function hideRenameNoteDialog() {
    dispatch(notesUiSlice.actions.closeRenameNoteDialog());
  }

  return { showRenameNoteDialog, hideRenameNoteDialog };
}

export function ClearTrashDialogPortal(dispatch: AppDispatch) {
  function showClearTrashDialog() {
    dispatch(notesUiSlice.actions.showClearTrashDialog());
  }

  function hideClearTrashDialog() {
    dispatch(notesUiSlice.actions.closeClearTrashDialog());
  }

  return { showClearTrashDialog, hideClearTrashDialog };
}
