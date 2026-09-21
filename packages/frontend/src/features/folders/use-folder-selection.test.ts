import { beforeEach, describe, expect, it } from "vitest";
import { useFolderSelection } from "./use-folder-selection";

const order = ["folder-1", "document-2", "folder-3", "document-4"];
const pointer = (id: string, range = false, toggle = false) =>
  useFolderSelection.getState().selectFromPointer(id, order, { range, toggle });

describe("folder selection", () => {
  beforeEach(() => {
    useFolderSelection.setState({
      selectedItemIds: [],
      anchorItemId: null,
      previewItemId: null,
      pendingTrashItemIds: null,
    });
  });

  it("selects one item and clears the selection", () => {
    useFolderSelection.getState().selectOnly("document-2");
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: ["document-2"],
      anchorItemId: "document-2",
    });

    useFolderSelection.getState().clearSelection();
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: [],
      anchorItemId: null,
    });
  });

  it("toggles individual items without moving the first modifier anchor", () => {
    pointer("folder-1", false, true);
    pointer("folder-3", false, true);
    pointer("document-4", false, true);
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: ["folder-1", "folder-3", "document-4"],
      anchorItemId: "folder-1",
    });

    pointer("folder-3", false, true);
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: ["folder-1", "document-4"],
      anchorItemId: "folder-1",
    });
  });

  it("selects and redraws a visual range from the same anchor", () => {
    pointer("folder-1");
    pointer("document-4", true);
    expect(useFolderSelection.getState().selectedItemIds).toEqual(order);

    pointer("folder-3", true);
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: ["folder-1", "document-2", "folder-3"],
      anchorItemId: "folder-1",
    });
  });

  it("supports a reverse range in the current visual order", () => {
    pointer("document-4");
    pointer("document-2", true);
    expect(useFolderSelection.getState().selectedItemIds).toEqual([
      "document-2",
      "folder-3",
      "document-4",
    ]);
  });

  it("starts a new selection when the old anchor is outside the view", () => {
    useFolderSelection.getState().selectOnly("hidden-item");
    pointer("folder-3", true);
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: ["folder-3"],
      anchorItemId: "folder-3",
    });
  });

  it("snapshots and deduplicates a selection for trash confirmation", () => {
    useFolderSelection
      .getState()
      .requestTrashConfirmation(["folder-1", "folder-1", "document-2"]);
    expect(useFolderSelection.getState().pendingTrashItemIds).toEqual([
      "folder-1",
      "document-2",
    ]);

    useFolderSelection.getState().closeTrashConfirmation();
    expect(useFolderSelection.getState().pendingTrashItemIds).toBeNull();
  });

  it("opens and closes a quick preview without changing the selection", () => {
    useFolderSelection.getState().selectOnly("document-2");
    useFolderSelection.getState().openPreview("document-2");
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: ["document-2"],
      previewItemId: "document-2",
    });

    useFolderSelection.getState().closePreview();
    expect(useFolderSelection.getState()).toMatchObject({
      selectedItemIds: ["document-2"],
      previewItemId: null,
    });
  });
});
