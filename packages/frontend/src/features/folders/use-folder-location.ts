import { type Note, NoteKind } from "@darkwrite/common";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocalStore } from "@/context/local-state";
import { folderRoute } from "@/features/navigation/navigator";
import { selectAllNotesAsMap } from "@/features/note/store/note-selectors";
import { useAppSelector } from "@/features/store/hooks";

export function useFolderLocation() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeFolderId = useLocalStore((state) => state.activeFolderId);
  const setActiveFolderId = useLocalStore((state) => state.setActiveFolderId);
  const workspaceId = useAppSelector((state) => state.session.workspaceId);
  const notes = useAppSelector(selectAllNotesAsMap);
  const candidate = activeFolderId ? notes[activeFolderId] : undefined;
  const activeFolder =
    candidate?.kind === NoteKind.Folder &&
    candidate.workspaceId === workspaceId &&
    !candidate.isTrashed
      ? candidate
      : undefined;

  useEffect(() => {
    if (location.pathname !== "/") return;
    const params = new URLSearchParams(location.search);
    if (!params.has("folder")) {
      navigate(folderRoute(activeFolder?.id ?? null), { replace: true });
      return;
    }
    const value = params.get("folder");
    const folderId = !value || value === "root" ? null : value;
    if (folderId === activeFolderId) return;
    if (folderId === null) {
      setActiveFolderId(null);
      return;
    }

    const routeFolder = notes[folderId];
    // Metadata is loaded after the first render. Keep the persisted folder
    // stable until its note arrives instead of oscillating with the URL.
    if (!routeFolder) return;
    if (
      routeFolder.kind === NoteKind.Folder &&
      routeFolder.workspaceId === workspaceId &&
      !routeFolder.isTrashed
    ) {
      setActiveFolderId(folderId);
    } else {
      navigate(folderRoute(null), { replace: true });
    }
  }, [
    activeFolder?.id,
    activeFolderId,
    location.pathname,
    location.search,
    navigate,
    notes,
    setActiveFolderId,
    workspaceId,
  ]);

  useEffect(() => {
    if (activeFolderId && candidate && !activeFolder)
      setActiveFolderId(null);
  }, [activeFolder, activeFolderId, candidate, setActiveFolderId]);

  const ancestors: Note[] = [];
  const seen = new Set<string>();
  let current = activeFolder;
  while (current) {
    if (seen.has(current.id)) break;
    seen.add(current.id);
    ancestors.unshift(current);
    current = current.parentId ? notes[current.parentId] : undefined;
  }

  return {
    activeFolder,
    activeFolderId: activeFolder?.id ?? null,
    ancestors,
    setActiveFolderId,
    workspaceId,
  };
}
