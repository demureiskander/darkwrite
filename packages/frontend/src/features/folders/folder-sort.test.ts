import { Note, NoteKind, Rank } from "@darkwrite/common";
import { describe, expect, it } from "vitest";
import { sortFolderItems } from "./folder-sort";

const firstRank = Rank.default();
const first = Note._test({
  id: "first",
  title: "Beta 10",
  orderHint: firstRank.get(),
  modifiedAt: "2026-01-01T00:00:00.000Z",
});
const second = Note._test({
  id: "second",
  title: "Alpha 2",
  orderHint: firstRank.next().get(),
  modifiedAt: "2026-02-01T00:00:00.000Z",
});
const folder = Note._test({
  id: "folder",
  kind: NoteKind.Folder,
  title: "Zulu",
});

describe("sortFolderItems", () => {
  it("uses order hints in manual mode", () => {
    expect(sortFolderItems([second, first], "manual").map((n) => n.id)).toEqual(
      [first.id, second.id],
    );
  });

  it("sorts names naturally in both directions", () => {
    expect(
      sortFolderItems([first, second], "name-asc").map((n) => n.id),
    ).toEqual([second.id, first.id]);
    expect(
      sortFolderItems([first, second], "name-desc").map((n) => n.id),
    ).toEqual([first.id, second.id]);
  });

  it("sorts by modification date", () => {
    expect(
      sortFolderItems([first, second], "modified-desc").map((n) => n.id),
    ).toEqual([second.id, first.id]);
  });

  it("keeps folders before documents", () => {
    expect(sortFolderItems([first, folder], "name-asc")[0].id).toBe(folder.id);
  });
});
