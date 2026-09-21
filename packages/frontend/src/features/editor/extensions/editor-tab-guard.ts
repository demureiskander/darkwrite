import { Extension } from "@tiptap/core";
import { Block } from "../types";

/** Keeps Tab inside the editor instead of moving focus to the app chrome. */
export const EditorTabGuard = Extension.create({
  name: "editor-tab-guard",

  addKeyboardShortcuts() {
    return {
      Tab: () => !this.editor.isActive(Block.CodeBlock),
    };
  },
});
