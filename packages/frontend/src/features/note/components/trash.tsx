import { IconArrowBackUp, IconSearch, IconTrash } from "@tabler/icons-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { TextTooltip } from "@/components/ui/tooltip";
import { useDragState } from "@/features/dnd/use-drag-state";
import { navigateToNote } from "@/features/navigation/navigator";
import notify from "@/features/notifications/notify";
import { SidebarItem } from "@/features/sidebar/sidebar-item";
import { useAppDispatch, useAppStore } from "@/features/store/hooks";
import { cn, getNoteIcon } from "@/lib/utils";
import { useNoteById } from "../hooks/use-note-by-id";
import { useTrash } from "../hooks/use-trash";
import {
  restoreFailToast,
  restoreSuccessToast,
  trashFailToast,
  trashSuccessToast,
} from "../note.toast";
import {
  moveToTrash,
  permanentlyDeleteNote,
  restoreFromTrash,
  updateManyNotes,
} from "../store/note.thunk";
import { getMovingNote, selectAllNotes } from "../store/note-selectors";
import { NoteTitle } from "./note-title";
import { ClearTrashButton } from "./clear-trash-button";
import {
  emptyTrashSelection,
  hasFailedTrashDescendant,
  resolveTrashBatchIds,
  selectTrashItem,
  type TrashSelection,
} from "./trash-selection";

type TrashItemProps = {
  noteId: string;
  selectionMode: boolean;
  selected: boolean;
  onContextSelect: (noteId: string) => void;
  onSelect: (noteId: string, range: boolean) => void;
};

const TrashItem = memo(function ({
  noteId,
  selectionMode,
  selected,
  onContextSelect,
  onSelect,
}: TrashItemProps) {
  const { note } = useNoteById(noteId);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  if (!note) return null;

  return (
    <div
      onContextMenu={(event) => {
        event.preventDefault();
        onContextSelect(noteId);
      }}
      className={cn(
        "group flex h-11 items-center gap-1 rounded-lg px-1 transition-colors hover:bg-secondary/50 focus-within:bg-secondary/50",
        selected && "bg-secondary/60",
      )}
    >
      {selectionMode && (
        <Checkbox
          checked={selected}
          aria-label={t("sidebar.trash.selectItem", {
            name: note.title || t("defaults.pageTitle"),
          })}
          className="ml-2 shrink-0"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(noteId, event.shiftKey);
          }}
        />
      )}
      <button
        type="button"
        onClick={(event) => {
          if (selectionMode) onSelect(noteId, event.shiftKey);
          else navigateToNote(noteId);
        }}
        className="flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
          {getNoteIcon(note.icon)}
        </span>
        <NoteTitle className="min-w-0 truncate text-sm">{note.title}</NoteTitle>
      </button>
      {!selectionMode && (
        <TextTooltip text={t("sidebar.trash.restore")}>
          <Button
            aria-label={t("sidebar.trash.restore")}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(restoreFromTrash(noteId))
                .andTee(restoreSuccessToast)
                .orTee(restoreFailToast);
            }}
            variant="ghost"
            className="size-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
          >
            <IconArrowBackUp className="size-4" />
          </Button>
        </TextTooltip>
      )}
      {!selectionMode && (
        <TextTooltip text={t("sidebar.trash.delete")}>
          <Button
            aria-label={t("sidebar.trash.delete")}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(permanentlyDeleteNote(noteId));
            }}
            variant="ghost"
            className="size-8 shrink-0 p-0 text-destructive hover:bg-destructive/15 hover:text-destructive"
          >
            <IconTrash className="size-4" />
          </Button>
        </TextTooltip>
      )}
    </div>
  );
});

type TrashListProps = {
  query: string;
  noteIds: string[];
  selectionMode: boolean;
  selectedIds: string[];
  onContextSelect: (noteId: string) => void;
  onSelect: (noteId: string, range: boolean) => void;
};

function TrashList({
  query,
  noteIds,
  selectionMode,
  selectedIds,
  onContextSelect,
  onSelect,
}: TrashListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const virtual = useVirtualizer({
    count: noteIds.length,
    estimateSize: () => 44,
    getScrollElement: () => parentRef.current,
    getItemKey: (i) => noteIds[i],
    overscan: 5,
  });

  useEffect(() => {
    virtual.scrollToIndex(0);
  }, [query]);

  if (noteIds.length === 0)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary/50">
          {query ? <IconSearch size={22} /> : <IconTrash size={22} />}
        </span>
        <p className="text-sm">
          {t(query ? "sidebar.trash.noMatches" : "sidebar.trash.emptyState")}
        </p>
      </div>
    );

  return (
    <div
      ref={parentRef}
      className="min-h-0 h-full overflow-y-auto scroll-view px-2 py-1 gutter-stable w-full"
    >
      <div style={{ height: virtual.getTotalSize(), position: "relative" }}>
        {virtual.getVirtualItems().map((v) => (
          <div
            key={v.key}
            style={{
              height: v.size,
              transform: `translateY(${v.start}px)`,
            }}
            className="absolute top-0 left-0 w-full"
          >
            <TrashItem
              noteId={v.key.toString()}
              selectionMode={selectionMode}
              selected={selectedIds.includes(v.key.toString())}
              onContextSelect={onContextSelect}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrashWidget() {
  const [query, setQuery] = useState("");
  const { noteIds: allTrashedIds } = useTrash();
  const { noteIds: visibleIds } = useTrash(query);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selection, setSelection] =
    useState<TrashSelection>(emptyTrashSelection);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(
    null,
  );
  const [working, setWorking] = useState(false);
  const selectedIds = selection.selectedIds.filter((id) =>
    allTrashedIds.includes(id),
  );

  const {
    isDraggingOver,
    onDragEnter,
    onDragLeave,
    onDragOver,
    setIsDraggingOver,
  } = useDragState();

  const { t } = useTranslation();
  const store = useAppStore();

  const leaveSelectionMode = () => {
    setSelectionMode(false);
    setSelection(emptyTrashSelection);
  };

  const selectItem = (noteId: string, range: boolean) => {
    setSelection((current) =>
      selectTrashItem(current, noteId, visibleIds, range ? "range" : "toggle"),
    );
  };

  const selectFromContext = (noteId: string) => {
    if (!selectionMode) setSelectionMode(true);
    setSelection((current) =>
      selectTrashItem(
        selectionMode ? current : emptyTrashSelection,
        noteId,
        visibleIds,
        "context",
      ),
    );
  };

  const batchIds = () =>
    resolveTrashBatchIds(selectedIds, selectAllNotes(store.getState()));

  const restoreSelected = async () => {
    const ids = batchIds();
    if (ids.length === 0 || working) return;
    setWorking(true);
    const result = await store.dispatch(
      updateManyNotes(
        ids.map((id) => ({ id, isTrashed: false, trashedAt: null })),
      ),
    );
    setWorking(false);
    if (result.isErr()) {
      notify.error(t("sidebar.trash.bulkRestoreFailed"));
      return;
    }
    leaveSelectionMode();
    notify.success(t("sidebar.trash.bulkRestoreSuccess"));
  };

  const confirmDelete = async () => {
    if (!pendingDeleteIds?.length || working) return;
    setWorking(true);
    const failedIds: string[] = [];
    const notesById = Object.fromEntries(
      selectAllNotes(store.getState()).map((note) => [note.id, note]),
    );
    for (const id of pendingDeleteIds) {
      if (hasFailedTrashDescendant(id, failedIds, notesById)) {
        failedIds.push(id);
        continue;
      }
      const result = await store.dispatch(permanentlyDeleteNote(id));
      if (result.isErr()) failedIds.push(id);
    }
    setWorking(false);
    setPendingDeleteIds(null);
    if (failedIds.length > 0) {
      setSelection({ anchorId: failedIds[0], selectedIds: failedIds });
      notify.error(
        t("sidebar.trash.bulkDeleteFailed", { count: failedIds.length }),
      );
      return;
    }
    leaveSelectionMode();
    notify.success(t("sidebar.trash.bulkDeleteSuccess"));
  };

  return (
    <>
      <Popover
        onOpenChange={(open) => {
          if (!open) {
            setQuery("");
            leaveSelectionMode();
          }
        }}
      >
        <PopoverTrigger asChild>
          <SidebarItem
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={(e) => {
              setIsDraggingOver(false);
              const note = getMovingNote(e, store.getState());
              if (note)
                store
                  .dispatch(moveToTrash(note.id))
                  .andTee(trashSuccessToast)
                  .orTee(trashFailToast);
            }}
            className={cn("col-span-2", isDraggingOver && "bg-destructive/20")}
          >
            <IconTrash size={18} />
            <span>
              {t(
                isDraggingOver
                  ? "sidebar.notes.contextmenu.trash"
                  : "sidebar.button.trash",
              )}
            </span>
          </SidebarItem>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          sticky="always"
          className="grid h-[min(560px,calc(100vh-24px))] w-[min(400px,calc(100vw-24px))] grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden border-border bg-view-2 p-0 shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground">
              <IconTrash size={17} />
            </span>
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
              {t("sidebar.trash.title")}
            </h2>
            <span className="rounded-md bg-secondary/60 px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {allTrashedIds.length}
            </span>
            {selectionMode && (
              <Button
                type="button"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={leaveSelectionMode}
                disabled={working}
              >
                {t("sidebar.trash.done")}
              </Button>
            )}
          </div>
          <div className="relative px-3 py-2.5">
            <IconSearch
              size={16}
              className="pointer-events-none absolute top-1/2 left-6 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelection(emptyTrashSelection);
              }}
              placeholder={t("sidebar.trash.search")}
              aria-label={t("sidebar.trash.search")}
              className="rounded-lg border-border/50 bg-secondary/35 pl-9"
            />
          </div>
          <TrashList
            query={query}
            noteIds={visibleIds}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onContextSelect={selectFromContext}
            onSelect={selectItem}
          />
          {selectionMode ? (
            <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {t("sidebar.trash.selectedCount", {
                  count: selectedIds.length,
                })}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  disabled={working || selectedIds.length === 0}
                  onClick={restoreSelected}
                >
                  <IconArrowBackUp size={16} />
                  {t("sidebar.trash.restoreSelected")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={working || selectedIds.length === 0}
                  onClick={() => setPendingDeleteIds(batchIds())}
                >
                  <IconTrash size={16} />
                  {t("sidebar.trash.deleteSelected")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end border-t border-border/60 px-3 py-2">
              <ClearTrashButton disabled={allTrashedIds.length === 0} />
            </div>
          )}
        </PopoverContent>
      </Popover>
      <AlertDialog
        open={pendingDeleteIds !== null}
        onOpenChange={(open) => {
          if (!open && !working) setPendingDeleteIds(null);
        }}
      >
        <AlertDialogContent className="max-w-md!">
          <AlertDialogTitle>
            {t("sidebar.trash.deleteSelectedTitle", {
              count: pendingDeleteIds?.length ?? 0,
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("sidebar.trash.deleteSelectedDescription")}
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={working}
              onClick={() => setPendingDeleteIds(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={working}
              onClick={confirmDelete}
            >
              {t("sidebar.trash.delete")}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
