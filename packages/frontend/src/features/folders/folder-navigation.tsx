import { NoteKind } from "@darkwrite/common";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { FolderIcon } from "@/components/folder-icon";
import { Button } from "@/components/ui";
import { useLocalStore } from "@/context/local-state";
import { navigateToFolder } from "@/features/navigation/navigator";
import { selectAllNotes } from "@/features/note/store/note-selectors";
import { useAppSelector } from "@/features/store/hooks";
import { cn } from "@/lib/utils";
import { FolderContextMenu } from "./folder-context-menu";
import { DraggableNode } from "./folder-dnd";
import { sortFolderItems } from "./folder-sort";
import { useFolderLocation } from "./use-folder-location";
import { useFolderReorderAnimation } from "./use-folder-reorder-animation";
import { useFolderSelection } from "./use-folder-selection";
import {
  MarqueeSelectionBox,
  useMarqueeSelection,
} from "./use-marquee-selection";

export function FolderNavigation() {
  const { t } = useTranslation();
  const { activeFolder, workspaceId } = useFolderLocation();
  const notes = useAppSelector(selectAllNotes);
  const openItemsOnDoubleClick = useAppSelector(
    (state) => state.settings.client.openItemsOnDoubleClick ?? true,
  );
  const mode = useLocalStore((state) => state.folderViewMode);
  const setMode = useLocalStore((state) => state.setFolderViewMode);
  const sortMode = useLocalStore((state) => state.folderSortMode);
  const selectedItemIds = useFolderSelection((state) => state.selectedItemIds);
  const selectOnly = useFolderSelection((state) => state.selectOnly);
  const selectFromPointer = useFolderSelection(
    (state) => state.selectFromPointer,
  );
  const parentId = activeFolder?.parentId ?? null;
  const { rectangle, surfaceProps } = useMarqueeSelection();
  const folders = sortFolderItems(
    notes.filter(
      (note) =>
        note.workspaceId === workspaceId &&
        note.kind === NoteKind.Folder &&
        note.parentId === parentId &&
        !note.isFavorite &&
        !note.isTrashed,
    ),
    sortMode,
  );
  const folderIds = folders.map((folder) => folder.id);
  const { containerRef: folderGridRef, isLayoutAnimating } =
    useFolderReorderAnimation(folderIds, mode);

  const openFolder = (id: string) => {
    navigateToFolder(id);
  };

  return (
    <div className="min-h-0 flex flex-1 flex-col px-2 pb-2">
      <div className="flex shrink-0 items-center justify-between gap-1 py-2">
        <span className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("folders.title")}
        </span>
        <div className="flex shrink-0 rounded-md border border-border/50 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-7", mode === "grid" && "bg-secondary")}
            onClick={() => setMode("grid")}
            aria-label={t("folders.gridView")}
          >
            <IconLayoutGrid size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-7", mode === "list" && "bg-secondary")}
            onClick={() => setMode("list")}
            aria-label={t("folders.listView")}
          >
            <IconList size={15} />
          </Button>
        </div>
      </div>
      <div
        {...surfaceProps}
        className={cn(
          "relative min-h-0 overflow-y-auto overflow-x-hidden",
          isLayoutAnimating && "overflow-hidden",
        )}
      >
        <div
          ref={folderGridRef}
          className={cn(
            mode === "grid"
              ? "grid grid-cols-[repeat(auto-fit,minmax(88px,1fr))] gap-2"
              : "flex flex-col gap-1",
          )}
        >
          {folders.map((folder) => (
            <DraggableNode
              key={folder.id}
              noteId={folder.id}
              destinationFolderId={folder.id}
              manualReorder={sortMode === "manual"}
              reorderAxis={mode === "grid" ? "horizontal" : "vertical"}
              className="rounded-lg"
            >
              <FolderContextMenu folderId={folder.id}>
                <button
                  type="button"
                  data-folder-item={folder.id}
                  aria-pressed={selectedItemIds.includes(folder.id)}
                  onClick={(event) => {
                    if (
                      !openItemsOnDoubleClick &&
                      !event.shiftKey &&
                      !event.metaKey &&
                      !event.ctrlKey
                    ) {
                      useFolderSelection.getState().clearSelection();
                      openFolder(folder.id);
                      return;
                    }
                    selectFromPointer(folder.id, folderIds, {
                      range: event.shiftKey,
                      toggle: event.metaKey || event.ctrlKey,
                    });
                  }}
                  onDoubleClick={(event) => {
                    if (
                      openItemsOnDoubleClick &&
                      !event.shiftKey &&
                      !event.metaKey &&
                      !event.ctrlKey
                    )
                      openFolder(folder.id);
                  }}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(":focus-visible"))
                      selectOnly(folder.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") openFolder(folder.id);
                  }}
                  onContextMenu={() => {
                    if (!selectedItemIds.includes(folder.id))
                      selectOnly(folder.id);
                  }}
                  className={cn(
                    "w-full min-w-0 rounded-lg text-left outline-none hover:bg-secondary/50 active:pushdown-98%",
                    mode === "grid"
                      ? "flex flex-col items-center gap-1 p-2"
                      : "flex items-center gap-2 px-2 py-1.5",
                    folder.id === activeFolder?.id && "bg-secondary/35",
                    selectedItemIds.includes(folder.id) && "bg-secondary/60",
                  )}
                >
                  <FolderIcon
                    size={mode === "grid" ? 34 : 18}
                    folderColor={folder.folderColor}
                  />
                  <span className="w-full truncate text-center text-sm">
                    {folder.title || t("folders.untitled")}
                  </span>
                </button>
              </FolderContextMenu>
            </DraggableNode>
          ))}
        </div>
        {folders.length === 0 && (
          <p className="px-1 py-3 text-center text-xs text-muted-foreground">
            {t("folders.emptySidebar")}
          </p>
        )}
        {rectangle && <MarqueeSelectionBox rectangle={rectangle} />}
      </div>
    </div>
  );
}
