// @vitest-environment jsdom
import { Note, NoteKind } from "@darkwrite/common";
import { fireEvent, render, screen } from "@testing-library/react";
import { okAsync } from "neverthrow";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { updateNote } from "../store/note.thunk";
import { InlineNoteTitle } from "./inline-note-title";

const dispatch = vi.fn(() => okAsync(undefined));

vi.mock("@/features/store/hooks", () => ({
  useAppDispatch: () => dispatch,
}));

vi.mock("../store/note.thunk", () => ({
  updateNote: vi.fn((patch) => patch),
}));

const folder = Note._test({
  id: "folder-1",
  kind: NoteKind.Folder,
  title: "Old name",
});

const showTitle = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <InlineNoteTitle note={folder} />
    </I18nextProvider>,
  );

describe("InlineNoteTitle", () => {
  beforeEach(() => {
    dispatch.mockClear();
    vi.mocked(updateNote).mockClear();
  });

  it("saves a new name with Enter", () => {
    showTitle();
    fireEvent.click(screen.getByRole("button", { name: /Old name/ }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: " New name " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(updateNote).toHaveBeenCalledWith({
      id: "folder-1",
      title: "New name",
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("cancels without updating on Escape", () => {
    showTitle();
    fireEvent.click(screen.getByRole("button", { name: /Old name/ }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Other name" } });
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);

    expect(updateNote).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
