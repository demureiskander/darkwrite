import { Folder } from "lucide-react";
import type { ComponentProps } from "react";
import { normalizeFolderColor } from "@/features/folders/folder-color";
import { cn } from "@/lib/utils";

type FolderIconProps = ComponentProps<typeof Folder> & {
  folderColor?: string | null;
};

export function FolderIcon({
  folderColor,
  className,
  style,
  ...props
}: FolderIconProps) {
  const color = normalizeFolderColor(folderColor);

  return (
    <Folder
      {...props}
      className={cn(
        "shrink-0 transition-colors duration-150",
        !color && "fill-muted-foreground/15 text-muted-foreground",
        className,
      )}
      style={
        color
          ? {
              ...style,
              color,
              fill: `color-mix(in srgb, ${color} 24%, transparent)`,
            }
          : style
      }
    />
  );
}
