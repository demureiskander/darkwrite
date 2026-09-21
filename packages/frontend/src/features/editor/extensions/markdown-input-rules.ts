import { Extension, markInputRule, textblockTypeInputRule } from "@tiptap/core";

const boldInput = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/;
const italicInput = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/;

/** Converts the most common Markdown markers while they are typed. */
export const MarkdownInputRules = Extension.create({
  name: "markdown-input-rules",
  priority: 1_000,

  addInputRules() {
    const { bold, italic } = this.editor.schema.marks;
    const heading = this.editor.schema.nodes.heading;
    if (!bold || !italic || !heading) return [];

    return [
      markInputRule({ find: boldInput, type: bold }),
      markInputRule({ find: italicInput, type: italic }),
      textblockTypeInputRule({
        find: /^(#{1,4})\s$/,
        type: heading,
        getAttributes: (match) => ({ level: match[1].length }),
      }),
    ];
  },
});
