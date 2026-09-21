import { Check, CircleOff, Edit3, Forward, Plus, Trash } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui";
import { selectNoteById } from "@/features/note/store/note-selectors";
import { ToggleFavoriteContextMenuItem } from "@/features/note/components/toggle-favorite-item";
import { moveToTrash } from "@/features/note/store/note.thunk";
import {
  MoveNoteDialogPortal,
  RenameNoteDialogPortal,
} from "@/features/note/store/notes-ui-actions";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { cn } from "@/lib/utils";
import { FOLDER_COLOR_PRESETS, setFolderColor } from "./folder-color";
import { FolderColorDialog } from "./folder-color-dialog";

export function FolderContextMenu({
  folderId,
  children,
}: {
  folderId: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const folder = useAppSelector((state) => selectNoteById(state, folderId));
  const [colorOpen, setColorOpen] = useState(false);
  const hasCustomColor = Boolean(
    folder?.folderColor &&
      !FOLDER_COLOR_PRESETS.some((color) => color === folder.folderColor),
  );

  const chooseColor = (color: string | null) => {
    dispatch(setFolderColor(folderId, color));
  };

  const beginCustomColor = () => {
    requestAnimationFrame(() => setColorOpen(true));
  };
  const beginRename = () => {
    requestAnimationFrame(() => {
      RenameNoteDialogPortal(dispatch).showRenameNoteDialog(folderId);
    });
  };
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ToggleFavoriteContextMenuItem noteId={folderId} />
          <ContextMenuSeparator />
          <ContextMenuLabel className="font-normal text-muted-foreground">
            {t("folders.color.title")}
          </ContextMenuLabel>
          <div className="flex items-center gap-1 px-2 pb-1.5">
            <ContextMenuItem asChild>
              <button
                type="button"
                className={cn(
                  "grid size-6 place-items-center rounded-full border border-border bg-secondary p-0 text-muted-foreground transition-transform hover:scale-110 active:scale-90",
                  !folder?.folderColor && "ring-2 ring-primary ring-offset-1",
                )}
                onClick={() => chooseColor(null)}
                aria-label={t("folders.color.default")}
              >
                <CircleOff size={13} />
              </button>
            </ContextMenuItem>
            {FOLDER_COLOR_PRESETS.map((color) => (
              <ContextMenuItem key={color} asChild>
                <button
                  type="button"
                  className={cn(
                    "grid size-6 place-items-center rounded-full border border-white/20 p-0 transition-transform hover:scale-110 active:scale-90",
                    folder?.folderColor === color &&
                      "ring-2 ring-primary ring-offset-1",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => chooseColor(color)}
                  aria-label={color}
                >
                  {folder?.folderColor === color && (
                    <Check size={13} className="text-white drop-shadow" />
                  )}
                </button>
              </ContextMenuItem>
            ))}
            <ContextMenuItem asChild>
              <button
                type="button"
                className={cn(
                  "grid size-6 place-items-center rounded-full border border-border bg-secondary p-0 transition-transform hover:scale-110 active:scale-90",
                  hasCustomColor && "ring-2 ring-primary ring-offset-1",
                )}
                style={
                  folder?.folderColor && hasCustomColor
                    ? { backgroundColor: folder.folderColor }
                    : undefined
                }
                onClick={beginCustomColor}
                aria-label={t("folders.color.custom")}
              >
                <Plus size={13} />
              </button>
            </ContextMenuItem>
          </div>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={beginRename}>
            <Edit3 size={17} />
            {t("folders.rename")}
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() =>
              MoveNoteDialogPortal(dispatch).showMoveNoteDialog(folderId)
            }
          >
            <Forward size={17} />
            {t("sidebar.notes.contextmenu.moveTo")}
          </ContextMenuItem>
          <ContextMenuItem
            variant="destructive"
            onSelect={() => dispatch(moveToTrash(folderId))}
          >
            <Trash size={17} />
            {t("sidebar.notes.contextmenu.trash")}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <FolderColorDialog
        folderId={folderId}
        initialColor={folder?.folderColor ?? null}
        open={colorOpen}
        onOpenChange={setColorOpen}
      />
    </>
  );
}
