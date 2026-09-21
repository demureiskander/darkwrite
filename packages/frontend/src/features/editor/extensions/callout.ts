import { mergeAttributes, Node } from "@tiptap/core";
import { cn } from "@/lib/utils";

/** A visually distinct, multi-paragraph block for notes and supporting context. */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        {
          "data-callout": "",
          class: cn(
            "my-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-sm",
            "[&>p:first-child]:mt-0 [&>p:last-child]:mb-0",
          ),
        },
        HTMLAttributes,
      ),
      0,
    ];
  },
});
