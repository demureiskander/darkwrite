import { NoteKind } from "@darkwrite/common";
import { IconChevronDown, IconEdit, IconFolderPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useLocalStore } from "@/context/local-state";
import { useFolderLocation } from "@/features/folders/use-folder-location";
import { useAppDispatch } from "@/features/store/hooks";
import { cn } from "@/lib/utils";
import { createNote } from "../note/store/note.thunk";
import { useCurrentWorkspaceId } from "../workspaces/hooks/use-workspace";
import { SidebarItem } from "./sidebar-item";

export function CreatePageButton(props: { className?: string }) {
  const dispatch = useAppDispatch();
  const workspaceId = useCurrentWorkspaceId();
  const width = useLocalStore((state) => state.sidebarWidth);
  const { activeFolderId } = useFolderLocation();
  const { t } = useTranslation();
  if (!workspaceId) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarItem className={cn("w-full", props.className)}>
            <IconEdit size={18} />
            {width >= 160 && (
              <span className="min-w-0 flex-1 truncate text-left">
                {t("sidebar.button.create")}
              </span>
            )}
            <IconChevronDown className="ml-auto shrink-0" size={15} />
          </SidebarItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          <DropdownMenuItem
            onSelect={() =>
              dispatch(
                createNote({ parentId: activeFolderId, renameAfter: true }),
              )
            }
          >
            <IconEdit size={17} />
            {t("sidebar.button.newPage")}
          </DropdownMenuItem>
          <DropdownMenuItem
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
            <IconFolderPlus size={17} />
            {t("folders.newFolder")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
