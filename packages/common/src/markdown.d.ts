import { type NotePropertyMap } from "./note";
export declare const MarkdownConverter: {
    convertMarkdownToHTML: (markdown: string) => string;
    propertiesToFrontmatter: (properties: NotePropertyMap, order: string[]) => string;
};
