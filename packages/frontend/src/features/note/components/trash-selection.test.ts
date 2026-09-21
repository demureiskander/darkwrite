import { Note, NoteKind } from "@darkwrite/common";
import { describe, expect, it } from "vitest";
import {
  emptyTrashSelection,
  hasFailedTrashDescendant,
  resolveTrashBatchIds,
  selectTrashItem,
} from "./trash-selection";

const visibleIds = ["one", "two", "three", "four"];

describe("trash selection", () => {
  it("starts on right-click and toggles individual items", () => {
    const first = selectTrashItem(
      emptyTrashSelection,
      "one",
      visibleIds,
      "context",
    );
    const second = selectTrashItem(first, "three", visibleIds, "toggle");
    expect(second.selectedIds).toEqual(["one", "three"]);
    expect(
      selectTrashItem(second, "one", visibleIds, "toggle").selectedIds,
    ).toEqual(["three"]);
    expect(selectTrashItem(second, "three", visibleIds, "context")).toBe(
      second,
    );
  });

  it("selects a range by current visual order", () => {
    const first = selectTrashItem(
      emptyTrashSelection,
      "one",
      visibleIds,
      "context",
    );
    const range = selectTrashItem(first, "three", visibleIds, "range");
    expect(range.selectedIds).toEqual(["one", "two", "three"]);
    expect(range.anchorId).toBe("one");
  });

  it("starts a new range if the anchor is filtered out", () => {
    const first = selectTrashItem(
      emptyTrashSelection,
      "one",
      visibleIds,
      "context",
    );
    const range = selectTrashItem(first, "three", ["three"], "range");
    expect(range.selectedIds).toEqual(["three"]);
  });
});

describe("trash batch targets", () => {
  const folder = Note.new({
    id: "folder",
    workspaceId: "workspace",
    parentId: null,
    orderHint: "a0",
    kind: NoteKind.Folder,
  });
  folder.isTrashed = true;
  const child = Note.new({
    id: "child",
    workspaceId: "workspace",
    parentId: "folder",
    orderHint: "a0",
  });
  child.isTrashed = true;
  const other = Note.new({
    id: "other",
    workspaceId: "workspace",
    parentId: null,
    orderHint: "a1",
  });
  other.isTrashed = true;

  it("includes trashed descendants of selected folders once", () => {
    expect(
      resolveTrashBatchIds(["folder", "child"], [folder, child, other]),
    ).toEqual(["child", "folder"]);
  });

  it("does not include unrelated trashed items", () => {
    expect(resolveTrashBatchIds(["child"], [folder, child, other])).toEqual([
      "child",
    ]);
  });

  it("retains an ancestor after a child deletion fails", () => {
    const notes = { folder, child, other };
    expect(hasFailedTrashDescendant("folder", ["child"], notes)).toBe(true);
    expect(hasFailedTrashDescendant("other", ["child"], notes)).toBe(false);
  });
});
