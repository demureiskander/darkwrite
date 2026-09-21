import { Note, NoteKind } from "@darkwrite/common";
import { describe, expect, it } from "vitest";
import { quickSwitchItems } from "./quick-switch";

const workspaceId = "workspace";
const folder = Note._test({
  id: "folder",
  kind: NoteKind.Folder,
  title: "Research",
  workspaceId,
});
const document = Note._test({
  id: "document",
  title: "Sources",
  parentId: folder.id,
  workspaceId,
});

describe("quickSwitchItems", () => {
  it("finds both folders and documents", () => {
    expect(
      quickSwitchItems([folder, document], workspaceId, "research").map(
        (item) => item.note.id,
      ),
    ).toEqual([folder.id, document.id]);
  });

  it("includes the parent path for disambiguation", () => {
    const [result] = quickSwitchItems(
      [folder, document],
      workspaceId,
      "sources",
    );
    expect(result.parentPath.map((parent) => parent.title)).toEqual([
      "Research",
    ]);
  });

  it("excludes trashed objects and other workspaces", () => {
    const trashed = Note._test({
      id: "trashed",
      isTrashed: true,
      workspaceId,
    });
    const other = Note._test({ id: "other", workspaceId: "other-workspace" });
    expect(
      quickSwitchItems([folder, document, trashed, other], workspaceId, ""),
    ).toHaveLength(2);
  });
});
