import { NoteKind } from "@darkwrite/common";
import { FileText, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FolderIcon } from "@/components/folder-icon";
import { useLocalStore } from "@/context/local-state";
import {
  navigateToFolder,
  navigateToNote,
} from "@/features/navigation/navigator";
import { NoteContextMenuContainer } from "@/features/note/note-context-menu";
import { selectFavorites } from "@/features/note/store/note-selectors";
import { useAppSelector } from "@/features/store/hooks";
import { cn } from "@/lib/utils";
import { FolderContextMenu } from "./folder-context-menu";
import { DraggableNode } from "./folder-dnd";
import { useFolderSelection } from "./use-folder-selection";
import { useFolderLocation } from "./use-folder-location";
import { useFolderReorderAnimation } from "./use-folder-reorder-animation";

export function PinnedNavigation() {
  const { t } = useTranslation();
  const { activeFolderId, workspaceId } = useFolderLocation();
  const pinned = useAppSelector((state) =>
    workspaceId ? selectFavorites(state, workspaceId) : [],
  );
  const openItemsOnDoubleClick = useAppSelector(
    (state) => state.settings.client.openItemsOnDoubleClick ?? true,
  );
  const selectedItemIds = useFolderSelection((state) => state.selectedItemIds);
  const selectFromPointer = useFolderSelection(
    (state) => state.selectFromPointer,
  );
  const width = useLocalStore((state) => state.sidebarWidth);
  const { containerRef: pinnedListRef } = useFolderReorderAnimation(
    pinned.map((item) => item.id),
    "pinned",
  );

  if (pinned.length === 0) return null;

  const open = (id: string, kind: NoteKind) => {
    if (kind === NoteKind.Folder) {
      navigateToFolder(id);
    } else {
      navigateToNote(id);
    }
  };

  return (
    <section className="shrink-0 border-b border-border/40 px-2 pb-2">
      <div className="flex items-center gap-1 px-1 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Star size={13} className="fill-star text-star" />
        {width >= 150 && <span className="truncate">{t("pinned.title")}</span>}
      </div>
      <div
        ref={pinnedListRef}
        className="flex max-h-40 flex-col gap-0.5 overflow-y-auto"
      >
        {pinned.map((item) => {
          const button = (
            <button
              type="button"
              data-folder-item={item.id}
              aria-pressed={selectedItemIds.includes(item.id)}
              onClick={(event) => {
                if (
                  !openItemsOnDoubleClick &&
                  !event.shiftKey &&
                  !event.metaKey &&
                  !event.ctrlKey
                ) {
                  useFolderSelection.getState().clearSelection();
                  open(item.id, item.kind);
                  return;
                }
                selectFromPointer(
                  item.id,
                  pinned.map((entry) => entry.id),
                  {
                    range: event.shiftKey,
                    toggle: event.metaKey || event.ctrlKey,
                  },
                );
              }}
              onDoubleClick={(event) => {
                if (
                  openItemsOnDoubleClick &&
                  !event.shiftKey &&
                  !event.metaKey &&
                  !event.ctrlKey
                )
                  open(item.id, item.kind);
              }}
              onContextMenu={() => {
                if (!selectedItemIds.includes(item.id))
                  useFolderSelection.getState().selectOnly(item.id);
              }}
              className={cn(
                "flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-secondary/50 active:pushdown-98%",
                item.id === activeFolderId && "bg-secondary",
                selectedItemIds.includes(item.id) && "bg-secondary/60",
              )}
            >
              {item.kind === NoteKind.Folder ? (
                <FolderIcon size={17} folderColor={item.folderColor} />
              ) : (
                <FileText
                  size={17}
                  className="shrink-0 text-muted-foreground"
                />
              )}
              <span className="min-w-0 flex-1 truncate">
                {item.title || t("defaults.pageTitle")}
              </span>
            </button>
          );

          return item.kind === NoteKind.Folder ? (
            <DraggableNode
              key={item.id}
              noteId={item.id}
              destinationFolderId={item.id}
              className="rounded-lg"
            >
              <FolderContextMenu folderId={item.id}>{button}</FolderContextMenu>
            </DraggableNode>
          ) : (
            <DraggableNode
              key={item.id}
              noteId={item.id}
              className="rounded-lg"
            >
              <NoteContextMenuContainer noteId={item.id}>
                {button}
              </NoteContextMenuContainer>
            </DraggableNode>
          );
        })}
      </div>
    </section>
  );
}
