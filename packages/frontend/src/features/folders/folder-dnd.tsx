import type { ParentId } from "@darkwrite/common";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type ReorderAxis, useFolderDrop, useNodeDrag } from "./use-folder-dnd";

export function DraggableNode({
  children,
  className,
  destinationFolderId,
  manualReorder = false,
  noteId,
  reorderAxis = "vertical",
}: {
  children: ReactNode;
  className?: string;
  destinationFolderId?: string;
  manualReorder?: boolean;
  noteId: string;
  reorderAxis?: ReorderAxis;
}) {
  const onDragStart = useNodeDrag(noteId);
  const acceptsChildren = destinationFolderId !== undefined;
  const acceptsDrop = acceptsChildren || manualReorder;
  const drop = useFolderDrop(destinationFolderId ?? null, {
    acceptsChildren,
    allowReorder: manualReorder,
    anchorId: noteId,
    axis: reorderAxis,
  });

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={acceptsDrop ? drop.onDragEnter : undefined}
      onDragLeave={acceptsDrop ? drop.onDragLeave : undefined}
      onDragOver={acceptsDrop ? drop.onDragOver : undefined}
      onDrop={acceptsDrop ? drop.onDrop : undefined}
      className={cn(
        "relative isolate min-w-0 cursor-grab rounded-xl active:cursor-grabbing",
        className,
      )}
    >
      {children}
      {acceptsDrop && drop.isDraggingOver && drop.dropIntent === "into" && (
        <span className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-primary/15 ring-2 ring-inset ring-primary" />
      )}
      {acceptsDrop &&
        drop.isDraggingOver &&
        (drop.dropIntent === "before" || drop.dropIntent === "after") && (
          <span
            className={cn(
              "pointer-events-none absolute z-20 rounded-full bg-primary",
              reorderAxis === "horizontal" ? "inset-y-1 w-1" : "inset-x-1 h-1",
              drop.dropIntent === "before" &&
                (reorderAxis === "horizontal" ? "left-0" : "top-0"),
              drop.dropIntent === "after" &&
                (reorderAxis === "horizontal" ? "right-0" : "bottom-0"),
            )}
          />
        )}
    </div>
  );
}

export function FolderDropZone({
  children,
  className,
  destinationId,
}: {
  children: ReactNode;
  className?: string;
  destinationId: ParentId;
}) {
  const drop = useFolderDrop(destinationId);
  return (
    <div
      onDragEnter={drop.onDragEnter}
      onDragLeave={drop.onDragLeave}
      onDragOver={drop.onDragOver}
      onDrop={drop.onDrop}
      className={cn("relative isolate rounded-lg", className)}
    >
      {children}
      {drop.isDraggingOver && (
        <span className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-primary/15 ring-2 ring-inset ring-primary" />
      )}
    </div>
  );
}
