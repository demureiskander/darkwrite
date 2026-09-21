import { nanoid } from "nanoid";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Outlet } from "react-router-dom";
import ThemeHandler from "@/components/theme-handler";
import { Toaster } from "@/components/ui";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLocalStore } from "@/context/local-state";
import { Sidebar } from "@/features/sidebar";
import { SelectionTrashDialog } from "@/features/trash/components/selection-trash-dialog";
import { useShortcuts } from "@/features/ui/hooks/use-shortcuts";
import { QuickPreview } from "@/features/folders/quick-preview";
import { cn } from "@/lib/utils";
import { AppMenuHandler } from "../app-menu/app-menu-handler";
import { NativeContextMenuProvider } from "../context-menu/native-context-menu";
import { EditorCenterView } from "../editor/components/center-view";
import { EditorContext } from "../editor/store/editor-context";
import NavigationHelper from "../navigation/navigation-helper";
import MoveNoteDialog from "../note/components/move-note-dialog";
import { RenameNoteDialog } from "../note/components/rename-note-dialog";
import { useNoteFromURL } from "../note/hooks/use-note-from-url";
import SearchDialog from "../search/search-dialog";
import { ClearTrashDialog } from "../trash/components/clear-trash-dialog";
import { useClampedSidebarWidth } from "./hooks/use-sidebar-width-range";
import { useTrackpadHistory } from "./hooks/use-trackpad-history";
import { useWindowControlsOverlay } from "./hooks/use-window-controls-overlay";
import SidebarResizeHandle from "./sidebar-resize-handle";
import { Titlebar } from "./titlebar";

export function Layout() {
  const noteId = useNoteFromURL() ?? "";
  const instanceId = useRef(nanoid()).current;
  const isSidebarCollapsed = useLocalStore((s) => s.isSidebarCollapsed);
  const { contentRef, swipeProgress, swipeVisible } =
    useTrackpadHistory();

  useShortcuts(noteId || null);
  useWindowControlsOverlay();
  useClampedSidebarWidth();
  return (
    <EditorContext.Provider value={{ noteId, instanceId }}>
      <div
        className={cn(
          "flex w-full h-full bg-background overflow-hidden [--slide-distance:32px]",
          isSidebarCollapsed && "bg-(--dw-editor-background)",
        )}
      >
        <TooltipProvider>
          <ThemeHandler />
          <NativeContextMenuProvider />
          <AppMenuHandler />
          <NavigationHelper />
          <Sidebar></Sidebar>
          <SidebarResizeHandle />
          <div className="h-full min-w-0 flex flex-col grow overflow-hidden">
            <Titlebar></Titlebar>
            <div className="relative min-h-0 flex-1">
              <div
                ref={contentRef}
                className={cn(
                  "bg-view-1 min-w-0 h-full overflow-x-hidden scroll-smooth scroll-view transition-[margin] duration-150 border-border/25 ml-0 mb-1.5 mr-1.5 z-1 rounded-md rounded-br-sm border",
                  isSidebarCollapsed && "m-0 rounded-none border-0",
                )}
              >
                <SearchDialog />
                <MoveNoteDialog />
                <RenameNoteDialog />
                <ClearTrashDialog />
                <SelectionTrashDialog />
                <QuickPreview />
                <EditorCenterView />
                <Outlet />
              </div>
              {swipeProgress && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-y-0 z-20 flex items-center overflow-hidden transition-opacity duration-150 motion-reduce:transition-none",
                    swipeProgress.direction === "back"
                      ? "left-0 justify-start bg-linear-to-r from-primary/25 to-transparent"
                      : "right-0 justify-end bg-linear-to-l from-primary/25 to-transparent",
                  )}
                  style={{
                    width: `${48 + swipeProgress.progress * 88}px`,
                    opacity: swipeVisible
                      ? 0.35 + swipeProgress.progress * 0.65
                      : 0,
                  }}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border border-primary/50 bg-primary/20 text-primary shadow-sm transition-transform duration-100 motion-reduce:transition-none",
                      swipeProgress.direction === "back" ? "ml-2" : "mr-2",
                      swipeProgress.completed && "scale-110",
                    )}
                  >
                    {swipeProgress.direction === "back" ? (
                      <ChevronLeft className="size-5" />
                    ) : (
                      <ChevronRight className="size-5" />
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
      <Toaster />
    </EditorContext.Provider>
  );
}
