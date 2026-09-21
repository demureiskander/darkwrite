import { NoteKind } from "@darkwrite/common";
import { okAsync } from "neverthrow";
import { recordStructuralAction } from "@/features/history/structural-history";
import { selectNoteById } from "@/features/note/store/note-selectors";
import { updateNote } from "@/features/note/store/note.thunk";
import type { AppDispatch, AppGetState } from "@/features/store/types";

export const FOLDER_COLOR_PRESETS = [
  "#8e8e93",
  "#ff453a",
  "#ff9f0a",
  "#ffd60a",
  "#30d158",
  "#0a84ff",
  "#bf5af2",
] as const;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const normalizeFolderColor = (color: string | null | undefined) => {
  if (!color) return null;
  const prefixed = color.startsWith("#") ? color : `#${color}`;
  return HEX_COLOR.test(prefixed) ? prefixed.toLowerCase() : null;
};

export const hexToRgb = (color: string) => {
  const normalized = normalizeFolderColor(color) ?? "#8e8e93";
  return {
    red: Number.parseInt(normalized.slice(1, 3), 16),
    green: Number.parseInt(normalized.slice(3, 5), 16),
    blue: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

const toHexChannel = (value: number) =>
  Math.min(255, Math.max(0, Math.round(Number.isFinite(value) ? value : 0)))
    .toString(16)
    .padStart(2, "0");

export const rgbToHex = (red: number, green: number, blue: number) =>
  `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`;

export const setFolderColor =
  (folderId: string, color: string | null) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const folder = selectNoteById(getState(), folderId);
    const nextColor = normalizeFolderColor(color);
    if (
      !folder ||
      folder.kind !== NoteKind.Folder ||
      folder.folderColor === nextColor
    ) {
      return okAsync(undefined);
    }

    const previousColor = folder.folderColor;
    return dispatch(
      updateNote({ id: folderId, folderColor: nextColor }),
    ).andTee(() => {
      recordStructuralAction(folder.workspaceId, {
        undo: async () =>
          (
            await dispatch(
              updateNote({ id: folderId, folderColor: previousColor }),
            )
          ).isOk(),
        redo: async () =>
          (
            await dispatch(updateNote({ id: folderId, folderColor: nextColor }))
          ).isOk(),
      });
    });
  };
