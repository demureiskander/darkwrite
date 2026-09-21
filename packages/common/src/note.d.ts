import type { NoteContent } from "@/note-content";
import { type DwResult } from "./result";
export declare enum PropertyType {
    Text = "text",
    Date = "date",
    Checkbox = "checkbox"
}
export type TextProperty = {
    type: PropertyType.Text;
    value: string;
};
export type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};
export declare const serializeRange: (range: DateRange) => string;
export declare const deserializeRange: (serialized: string) => import("neverthrow").Result<{
    from: Date | undefined;
    to: Date | undefined;
}, import("./json-util").JsonParseError>;
export type DateProperty = {
    type: PropertyType.Date;
    /** Stringified date range. */
    value: string;
};
export type CheckboxProperty = {
    type: PropertyType.Checkbox;
    value: boolean;
};
export type NoteProperty = TextProperty | DateProperty | CheckboxProperty;
type propertyTypeMap = {
    [PropertyType.Checkbox]: CheckboxProperty;
    [PropertyType.Date]: DateProperty;
    [PropertyType.Text]: TextProperty;
};
export declare function getDefaultNoteProperty<T extends PropertyType>(type: T): propertyTypeMap[T];
export declare const NoteProperty: {
    default: typeof getDefaultNoteProperty;
};
/** Key doubles down as the property name. */
export type NotePropertyMap = Record<string, NoteProperty>;
export type ParentId = string | null;
/** Distinguishes editable documents from navigation-only folders. */
export declare enum NoteKind {
    Document = "document",
    Folder = "folder"
}
export interface Note {
    id: string;
    title: string;
    /** Whether this tree node contains a document or groups other nodes. */
    kind: NoteKind;
    /** Unicode emoji to be displayed as an icon. `null` means no icon, and a default icon will be rendered in relevant spaces instead. */
    icon: string | null;
    /** Custom color used for folder icons. Documents keep this value `null`. */
    folderColor: string | null;
    /** The parent note of this note. `null` means the note is at in top layer of the tree. */
    parentId: ParentId;
    /** ISO-string date. */
    createdAt: string;
    /** ISO-string date. */
    modifiedAt: string;
    /** ISO-string date. */
    trashedAt: string | null;
    /** A lexicographical hint to sort notes in the sidebar "All notes" section. */
    orderHint: string;
    /** A lexicographical hint to sort notes in the sidebar "Favorites" section. */
    favoriteOrderHint: string;
    isFavorite: boolean | null;
    isTrashed: boolean | null;
    /** The custom properties attached to this note. Properties
     * are keyed by their name. */
    properties: NotePropertyMap;
    /** Defines an absolute order for the keys of the properties field.
     * This list should be updated when a property is added or renamed. */
    propertyOrder: string[];
    /** ID of the workspace this note belongs to. */
    workspaceId: string;
}
export type NewNoteArgs = Partial<Note> & Pick<Note, "id" | "parentId" | "workspaceId" | "orderHint">;
export declare const Note: {
    /**
     * Produce a duplicate draft to use with a new Note.
     * @param note
     * @returns Note fields that were duplicated.
     */
    duplicate: (note: Note) => {
        parentId: ParentId;
        kind: NoteKind;
        title: string;
        icon: string | null;
        folderColor: string | null;
        properties: NotePropertyMap;
        propertyOrder: string[];
        workspaceId: string;
    };
    /**
     * Initialize a note with default fields. (all nested fields are copied.)
     * @param args bare minimum required to produce a valid note.
     * @returns a full note
     */
    new: (args: NewNoteArgs) => Note;
    /**
     * Test constructor that pre-fills IDs by default.
     * @param args fields to override
     * @returns a full note
     */
    _test: (args?: Partial<Note>) => Note;
    hasProperty: (note: Note, propertyName: string) => boolean;
};
export type NotePartial = Partial<Note> & {
    id: Note["id"];
};
/** @deprecated use `Note` instead */
export type NoteDTO = Note;
export interface NotesResponseDTO {
    notes: Record<string, Note>;
}
export interface NoteResponseDTO {
    note: Note | null;
}
export interface NoteContentResponseDTO {
    document: NoteContent;
}
/** Recursively walk up the tree to find the parent tree of a note.
 * @param id the starting note id
 * @param notes a map of all notes keyed by their ID
 * @returns the parent tree: lowest node first, highest node last
 */
export declare function resolveUpperTree(id: string, notes: Record<string, Note>): Note[];
/**
 * Returns true if potentialChildId is a descendant of potentialParentId
 * @param potentialChildId
 * @param potentialParentId
 * @param notes
 * @returns "CIRCULAR" if child and parent are in a circular reference, true if is a descendant, false in all other cases
 */
export declare function isDescendant(potentialChildId: string, potentialParentId: string, notesMapOrGetter: Record<string, Note> | ((id: string) => Note)): boolean | "CIRCULAR";
/**
 * Returns true if potentialChildId is a descendant of potentialParentId
 * @param potentialChildId
 * @param potentialParentId
 * @param notes
 * @returns "CIRCULAR" if child and parent are in a circular reference, true if is a descendant, false in all other cases
 */
export declare function isDescendantAsync(potentialChildId: string, potentialParentId: string, getNote: (id: string) => Promise<Note | undefined | null>): Promise<boolean | "CIRCULAR">;
export type NoteExportFormat = "md" | "html" | "json";
export declare const FileFormatMap: Record<NoteExportFormat, string>;
export type NoteImportResult = {
    type: NoteExportFormat;
    content: string[];
};
/** Valid fields to order notes by. These keys must have valid ranks. */
export type OrderKey = "orderHint" | "favoriteOrderHint";
export type MovePlacement = "inside-start" | "inside-end" | "below";
/** 📄 - Default icon to set when "Add icon" is clicked. */
export declare const DEFAULT_NOTE_ICON = "1f4c4";
/**
 * Replaces newlines with spaces in note titles.
 * @param title
 * @returns title with newlines gone
 */
export declare const cleanNoteTitle: (title: string) => string;
/** Generate a sorting function to sort notes by a key deterministically.
 * Notes will always have the same order even if there are colliding keys.
 * ID will be used as a fallback. */
export declare const stableSortByOrderKeyFn: (key?: OrderKey) => (a: Note, b: Note) => number;
export type PropertyDiff = Pick<Note, "propertyOrder" | "properties" | "id">;
export declare const PropertyDiff: {
    from: (note: Note) => {
        id: string;
        properties: {
            [x: string]: NoteProperty;
        };
        propertyOrder: string[];
    };
};
/**
 * Sets a property on a note and ensures it exists in the order list.
 * @param note
 * @param propertyName name of the target property
 * @param property the replacement value
 * @returns a diff to perform updates.
 */
declare function setNoteProperty(note: Note, propertyName: string, property: NoteProperty): {
    id: string;
    properties: {
        [x: string]: NoteProperty;
    };
    propertyOrder: string[];
};
/**
 * Renames a note property
 * @param note
 * @param oldName
 * @param newName
 * @returns a diff to perform updates
 */
declare function renameNoteProperty(note: Note, oldName: string, newName: string): DwResult<PropertyDiff>;
/**
 * Deletes a note property if it exists.
 * @param note source note
 * @param propertyName target property
 * @returns `Ok<PropertyDiff>` on success, `DwErr` on non-existent property.
 */
declare function deleteNoteProperty(note: Note, propertyName: string): DwResult<PropertyDiff>;
declare function reorderNoteProperty(note: Note, source: string, dest: string, placement: "before" | "after"): DwResult<PropertyDiff>;
export declare const PropertyUpdater: {
    renameNoteProperty: typeof renameNoteProperty;
    deleteNoteProperty: typeof deleteNoteProperty;
    setNoteProperty: typeof setNoteProperty;
    reorderNoteProperty: typeof reorderNoteProperty;
};
export {};
