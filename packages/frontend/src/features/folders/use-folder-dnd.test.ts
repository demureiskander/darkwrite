import { Note, NoteKind } from "@darkwrite/common";
import { describe, expect, it } from "vitest";
import { canDropIntoFolder, isAlreadyInFolder } from "./use-folder-dnd";

const document = Note._test({ id: "document" });
const folder = Note._test({ id: "folder", kind: NoteKind.Folder });
const childFolder = Note._test({
  id: "child-folder",
  kind: NoteKind.Folder,
  parentId: folder.id,
});
const notes = Object.fromEntries(
  [document, folder, childFolder].map((note) => [note.id, note]),
);

describe("canDropIntoFolder", () => {
  it("allows documents to move into folders", () => {
    expect(canDropIntoFolder(document.id, folder.id, notes)).toBe(true);
  });

  it("allows nodes to return to the root", () => {
    expect(canDropIntoFolder(document.id, null, notes)).toBe(true);
  });

  it("rejects documents as drop destinations", () => {
    expect(canDropIntoFolder(folder.id, document.id, notes)).toBe(false);
  });

  it("rejects moving a folder into its descendant", () => {
    expect(canDropIntoFolder(folder.id, childFolder.id, notes)).toBe(false);
  });

  it("detects a drop that would leave an object in the same folder", () => {
    expect(isAlreadyInFolder(folder.id, null, notes)).toBe(true);
    expect(isAlreadyInFolder(childFolder.id, folder.id, notes)).toBe(true);
    expect(isAlreadyInFolder(document.id, folder.id, notes)).toBe(false);
  });
});
