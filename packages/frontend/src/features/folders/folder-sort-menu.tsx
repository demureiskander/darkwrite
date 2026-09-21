import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpWideNarrow,
  Check,
  ListOrdered,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { type FolderSortMode, useLocalStore } from "@/context/local-state";

export function FolderSortMenu() {
  const { t } = useTranslation();
  const mode = useLocalStore((state) => state.folderSortMode);
  const setMode = useLocalStore((state) => state.setFolderSortMode);
  const options: Array<{
    icon: typeof ListOrdered;
    label: string;
    mode: FolderSortMode;
  }> = [
    { icon: ListOrdered, label: t("folders.sort.manual"), mode: "manual" },
    { icon: ArrowDownAZ, label: t("folders.sort.nameAsc"), mode: "name-asc" },
    { icon: ArrowUpAZ, label: t("folders.sort.nameDesc"), mode: "name-desc" },
    {
      icon: ArrowDownWideNarrow,
      label: t("folders.sort.newest"),
      mode: "modified-desc",
    },
    {
      icon: ArrowUpWideNarrow,
      label: t("folders.sort.oldest"),
      mode: "modified-asc",
    },
  ];
  const selected = options.find((option) => option.mode === mode) ?? options[0];
  const SelectedIcon = selected.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="h-8 gap-2">
          <SelectedIcon size={16} />
          <span className="hidden sm:inline">{selected.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.mode}
              onSelect={() => setMode(option.mode)}
            >
              <Icon size={16} />
              <span className="flex-1">{option.label}</span>
              {option.mode === mode && <Check size={15} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
