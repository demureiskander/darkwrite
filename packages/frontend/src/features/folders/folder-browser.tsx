import { NoteKind } from "@darkwrite/common";
import {
  Check,
  FilePlus2,
  FileText,
  FolderPlus,
  LayoutGrid,
  List,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui";
import { FolderIcon } from "@/components/folder-icon";
import { useLocalStore } from "@/context/local-state";
import { CanvasWidthContainer } from "@/features/layout/canvas-width-container";
import {
  navigateToFolder,
  navigateToNote,
} from "@/features/navigation/navigator";
import { NoteContextMenuContainer } from "@/features/note/note-context-menu";
import { InlineNoteTitle } from "@/features/note/components/inline-note-title";
import { createNote } from "@/features/note/store/note.thunk";
import { selectAllNotes } from "@/features/note/store/note-selectors";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { cn } from "@/lib/utils";
import { FolderContextMenu } from "./folder-context-menu";
import { DraggableNode } from "./folder-dnd";
import { sortFolderItems } from "./folder-sort";
import { FolderSortMenu } from "./folder-sort-menu";
import { useFolderDrop } from "./use-folder-dnd";
import { useFolderLocation } from "./use-folder-location";
import { useFolderReorderAnimation } from "./use-folder-reorder-animation";
import { useFolderSelection } from "./use-folder-selection";
import {
  MarqueeSelectionBox,
  useMarqueeSelection,
} from "./use-marquee-selection";

export function FolderBrowser() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
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
  const { activeFolder, activeFolderId, workspaceId } =
    useFolderLocation();
  const { rectangle, surfaceProps } = useMarqueeSelection();
  const currentFolderDrop = useFolderDrop(activeFolderId);
  const children = sortFolderItems(
    notes.filter(
      (note) =>
        note.workspaceId === workspaceId &&
        note.parentId === activeFolderId &&
        !note.isTrashed,
    ),
    sortMode,
  );
  const childIds = children.map((note) => note.id);
  const { containerRef: itemGridRef } = useFolderReorderAnimation(
    childIds,
    mode,
  );

  const open = (id: string, kind: NoteKind) => {
    if (kind === NoteKind.Folder) navigateToFolder(id);
    else navigateToNote(id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          {...surfaceProps}
          className="relative min-h-full p-6 md:p-10"
          onDragEnter={currentFolderDrop.onDragEnter}
          onDragLeave={currentFolderDrop.onDragLeave}
          onDragOver={currentFolderDrop.onDragOver}
          onDrop={currentFolderDrop.onDrop}
        >
          <CanvasWidthContainer className="flex flex-col gap-5">
            <div className="flex items-end justify-between gap-4 border-b border-border/50 pb-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {activeFolder ? (
                    <InlineNoteTitle note={activeFolder} />
                  ) : (
                    t("folders.root")
                  )}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("folders.itemCount", { count: children.length })}
                </p>
              </div>
              <FolderSortMenu />
            </div>
            <div
              ref={itemGridRef}
              className={cn(
                mode === "grid"
                  ? "grid grid-cols-[repeat(auto-fill,minmax(112px,140px))] gap-2"
                  : "flex flex-col gap-1",
              )}
            >
              {children.map((note) => {
                const item = (
                  <button
                    type="button"
                    data-folder-item={note.id}
                    aria-pressed={selectedItemIds.includes(note.id)}
                    onClick={(event) => {
                      if (
                        !openItemsOnDoubleClick &&
                        !event.shiftKey &&
                        !event.metaKey &&
                        !event.ctrlKey
                      ) {
                        useFolderSelection.getState().clearSelection();
                        open(note.id, note.kind);
                        return;
                      }
                      selectFromPointer(note.id, childIds, {
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
                        open(note.id, note.kind);
                    }}
                    onFocus={(event) => {
                      if (event.currentTarget.matches(":focus-visible"))
                        selectOnly(note.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") open(note.id, note.kind);
                    }}
                    onContextMenu={(event) => {
                      if (!selectedItemIds.includes(note.id))
                        selectOnly(note.id);
                      event.stopPropagation();
                    }}
                    className={cn(
                      "relative h-full w-full min-w-0 rounded-xl border border-transparent text-left outline-none hover:border-border/60 hover:bg-secondary/35 active:pushdown-99%",
                      mode === "grid"
                        ? "flex min-h-28 flex-col items-center justify-center gap-2 p-2"
                        : "flex items-center gap-3 rounded-lg py-2.5 pr-8 pl-3",
                      selectedItemIds.includes(note.id) &&
                        "border-transparent bg-secondary/60",
                    )}
                  >
                    {note.kind === NoteKind.Folder ? (
                      <FolderIcon
                        size={mode === "grid" ? 40 : 21}
                        folderColor={note.folderColor}
                      />
                    ) : (
                      <FileText
                        size={mode === "grid" ? 36 : 20}
                        className="shrink-0 text-muted-foreground"
                      />
                    )}
                    <span className="max-w-full truncate text-center">
                      {note.title || t("defaults.pageTitle")}
                    </span>
                    <Star
                      aria-hidden="true"
                      size={mode === "grid" ? 17 : 15}
                      className={cn(
                        "pointer-events-none absolute fill-star text-star transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none",
                        mode === "grid"
                          ? "top-2 right-2"
                          : "top-1/2 right-2 -translate-y-1/2",
                        note.isFavorite
                          ? "scale-100 opacity-100"
                          : "scale-70 opacity-0",
                      )}
                    />
                  </button>
                );
                return note.kind === NoteKind.Document ? (
                  <DraggableNode
                    key={note.id}
                    noteId={note.id}
                    manualReorder={sortMode === "manual"}
                    reorderAxis={mode === "grid" ? "horizontal" : "vertical"}
                  >
                    <NoteContextMenuContainer noteId={note.id}>
                      {item}
                    </NoteContextMenuContainer>
                  </DraggableNode>
                ) : (
                  <DraggableNode
                    key={note.id}
                    noteId={note.id}
                    destinationFolderId={note.id}
                    manualReorder={sortMode === "manual"}
                    reorderAxis={mode === "grid" ? "horizontal" : "vertical"}
                  >
                    <FolderContextMenu folderId={note.id}>
                      {item}
                    </FolderContextMenu>
                  </DraggableNode>
                );
              })}
            </div>
            {children.length === 0 && (
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
                {t("folders.empty")}
              </div>
            )}
          </CanvasWidthContainer>
          {rectangle && <MarqueeSelectionBox rectangle={rectangle} />}
          {currentFolderDrop.isDraggingOver && (
            <span className="pointer-events-none absolute inset-2 z-30 rounded-xl bg-primary/5 ring-2 ring-inset ring-primary/70" />
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-48">
        <ContextMenuItem
          onSelect={() =>
            dispatch(
              createNote({ parentId: activeFolderId, renameAfter: true }),
            )
          }
        >
          <FilePlus2 size={17} />
          {t("sidebar.button.newPage")}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() =>
            dispatch(
              createNote({
                parentId: activeFolderId,
                renameAfter: true,
                overrides: { kind: NoteKind.Folder },
              }),
            )
          }
        >
          <FolderPlus size={17} />
          {t("folders.newFolder")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => setMode("grid")}>
          <LayoutGrid size={17} />
          <span className="flex-1">{t("folders.gridView")}</span>
          {mode === "grid" && <Check size={15} />}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => setMode("list")}>
          <List size={17} />
          <span className="flex-1">{t("folders.listView")}</span>
          {mode === "list" && <Check size={15} />}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
