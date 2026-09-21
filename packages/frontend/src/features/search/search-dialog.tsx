import { NoteKind } from "@darkwrite/common";
import { FileText, Home } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
} from "@/components/ui";
import { FolderIcon } from "@/components/folder-icon";
import { useLocalStore } from "@/context/local-state";
import {
  navigateToFolder,
  navigateToNote,
} from "@/features/navigation/navigator";
import { selectAllNotes } from "@/features/note/store/note-selectors";
import { useAppSelector } from "@/features/store/hooks";
import { quickSwitchItems, type QuickSwitchItem } from "./quick-switch";
import { setSearchOpen, setSearchQuery, useSearchState } from "./search-state";

function ResultItem({ item }: { item: QuickSwitchItem }) {
  const { t } = useTranslation();
  const setActiveFolderId = useLocalStore((state) => state.setActiveFolderId);
  const title =
    item.note.title ||
    t(
      item.note.kind === NoteKind.Folder
        ? "folders.untitled"
        : "defaults.pageTitle",
    );
  const path = item.parentPath.map(
    (parent) => parent.title || t("folders.untitled"),
  );

  const open = () => {
    setSearchOpen(false);
    if (item.note.kind === NoteKind.Folder) {
      navigateToFolder(item.note.id);
      return;
    }
    const parentFolder = item.parentPath
      .toReversed()
      .find((parent) => parent.kind === NoteKind.Folder);
    setActiveFolderId(parentFolder?.id ?? null);
    navigateToNote(item.note.id);
  };

  return (
    <CommandItem
      className="flex items-center gap-3 rounded-lg px-2 py-2"
      value={`${item.note.id} ${item.searchText}`}
      onSelect={open}
    >
      {item.note.kind === NoteKind.Folder ? (
        <FolderIcon size={19} folderColor={item.note.folderColor} />
      ) : (
        <FileText size={19} />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate">{title}</div>
        <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <Home size={11} />
          {path.length > 0 && <span>/ {path.join(" / ")}</span>}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        {item.note.kind === NoteKind.Folder
          ? t("folders.itemType")
          : t("quickSwitch.documentType")}
      </span>
    </CommandItem>
  );
}

export default function SearchDialog() {
  const open = useSearchState((state) => state.open);
  const query = useSearchState((state) => state.query);
  const { t } = useTranslation();
  const allNotes = useAppSelector(selectAllNotes);
  const workspaceId = useAppSelector((state) => state.session.workspaceId);
  const items = quickSwitchItems(allNotes, workspaceId, query);
  const folders = items.filter((item) => item.note.kind === NoteKind.Folder);
  const documents = items.filter(
    (item) => item.note.kind === NoteKind.Document,
  );

  // biome-ignore lint/style/noNonNullAssertion: ref is always set
  const listRef = useRef<HTMLDivElement>(null!);
  return (
    <Dialog open={open} onOpenChange={setSearchOpen}>
      <DialogContent
        noOverlay
        className="top-16 max-w-xl translate-y-0 origin-top bg-view-1/85 p-0 drop-shadow-2xl backdrop-blur-lg"
      >
        <Command
          shouldFilter={false}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <CommandInput
            autoFocus
            placeholder={t("search.placeholder")}
            value={query}
            onValueChange={(value) => {
              setSearchQuery(value);
              listRef.current.scrollTo(0, 0);
            }}
          />
          <CommandList ref={listRef} className="w-full hide-scrollbar">
            <CommandEmpty>{t("search.noResult")}</CommandEmpty>
            {folders.length > 0 && (
              <CommandGroup heading={t("folders.title")}>
                {folders.map((item) => (
                  <ResultItem key={item.note.id} item={item} />
                ))}
              </CommandGroup>
            )}
            {documents.length > 0 && (
              <CommandGroup heading={t("quickSwitch.documents")}>
                {documents.map((item) => (
                  <ResultItem key={item.note.id} item={item} />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
