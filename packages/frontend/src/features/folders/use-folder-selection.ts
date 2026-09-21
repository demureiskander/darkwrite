import { create } from "zustand";

type FolderSelectionState = {
  selectedItemIds: string[];
  anchorItemId: string | null;
  previewItemId: string | null;
  pendingTrashItemIds: string[] | null;
  clearSelection: () => void;
  closePreview: () => void;
  openPreview: (id: string) => void;
  closeTrashConfirmation: () => void;
  requestTrashConfirmation: (ids: readonly string[]) => void;
  setSelection: (ids: readonly string[], anchorId?: string | null) => void;
  selectOnly: (id: string) => void;
  selectFromPointer: (
    id: string,
    visualOrder: readonly string[],
    modifiers: { range: boolean; toggle: boolean },
  ) => void;
};

/** Transient selection shared by folder views and object commands. */
export const useFolderSelection = create<FolderSelectionState>((set) => ({
  selectedItemIds: [],
  anchorItemId: null,
  previewItemId: null,
  pendingTrashItemIds: null,
  clearSelection: () => set({ selectedItemIds: [], anchorItemId: null }),
  closePreview: () => set({ previewItemId: null }),
  openPreview: (id) => set({ previewItemId: id }),
  closeTrashConfirmation: () => set({ pendingTrashItemIds: null }),
  requestTrashConfirmation: (ids) =>
    set({ pendingTrashItemIds: Array.from(new Set(ids)) }),
  setSelection: (ids, anchorId) => {
    const selectedItemIds = Array.from(new Set(ids));
    set({
      selectedItemIds,
      anchorItemId: anchorId ?? selectedItemIds[0] ?? null,
    });
  },
  selectOnly: (id) => set({ selectedItemIds: [id], anchorItemId: id }),
  selectFromPointer: (id, visualOrder, modifiers) =>
    set((state) => {
      if (modifiers.range) {
        const anchorIndex = state.anchorItemId
          ? visualOrder.indexOf(state.anchorItemId)
          : -1;
        const targetIndex = visualOrder.indexOf(id);
        if (anchorIndex >= 0 && targetIndex >= 0) {
          const start = Math.min(anchorIndex, targetIndex);
          const end = Math.max(anchorIndex, targetIndex);
          return { selectedItemIds: visualOrder.slice(start, end + 1) };
        }
        return { selectedItemIds: [id], anchorItemId: id };
      }

      if (modifiers.toggle) {
        const selectedItemIds = state.selectedItemIds.includes(id)
          ? state.selectedItemIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedItemIds, id];
        return {
          selectedItemIds,
          anchorItemId: state.anchorItemId ?? id,
        };
      }

      return { selectedItemIds: [id], anchorItemId: id };
    }),
}));
